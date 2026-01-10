import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SettingsModal from "@/components/dashboard/SettingsModal";
import AssessmentHistory from "@/components/dashboard/AssessmentHistory";
import DocumentsModal from "@/components/dashboard/DocumentsModal";
import { PopupModal } from "react-calendly";
import { jsPDF } from "jspdf";
import { generateAILiteracyGuidePDF } from "@/lib/generateAILiteracyGuidePDF";
import { supabase } from "@/integrations/supabase/client";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import PricingCards from "@/components/PricingCards";
import { toast } from "sonner";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileText,
  GraduationCap,
  History,
  Info,
  Loader2,
  Lock,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Types for system updates
interface SystemUpdate {
  id: string;
  title: string;
  content: string;
  update_type: string;
  priority: number;
  published_at: string;
}

const documents = [
  {
    id: 1,
    name: "Dossiê Técnico Anexo IV",
    description: "Documentação técnica completa conforme Anexo IV do EU AI Act",
    format: "PDF",
    size: "78 KB",
    icon: FileText,
  },
  {
    id: 2,
    name: "Instruções de Uso Art. 13",
    description: "Instruções para utilizadores conforme Artigo 13",
    format: "PDF",
    size: "45 KB",
    icon: Eye,
  },
  {
    id: 3,
    name: "Guia de Literacia Art. 4",
    description: "Formação em literacia de IA conforme Artigo 4",
    format: "PDF",
    size: "2.3 MB",
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Registro de Logs de Auditoria",
    description: "Estrutura para rastreamento de decisões",
    format: "PDF",
    size: "32 KB",
    icon: ClipboardList,
  },
  {
    id: 5,
    name: "Avaliação de Impacto",
    description: "Metodologia de análise de riscos",
    format: "PDF",
    size: "56 KB",
    icon: ShieldAlert,
  },
  {
    id: 6,
    name: "Política de Supervisão Humana",
    description: "Definição de papéis e responsabilidades",
    format: "PDF",
    size: "38 KB",
    icon: Users,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const { hasCompliancePack, loading: purchaseLoading, refresh: refreshPurchase } = usePurchaseStatus();
  const { 
    tasks, 
    initialLoading: tasksLoading, 
    toggleTask, 
    completedCount: completedTasks, 
    totalCount: totalTasks, 
    progressPercentage 
  } = useTaskProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [generatingLiteracyGuide, setGeneratingLiteracyGuide] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  const handleOpenCustomerPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        console.error("Customer portal error:", error);
        toast.error("Erro ao abrir portal de gestão. Tente novamente.");
        return;
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast.error("Erro ao abrir portal de gestão.");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleDownloadLiteracyGuide = async () => {
    if (!hasCompliancePack) {
      toast.error("Você precisa adquirir o Dossiê de Conformidade para baixar este documento.");
      return;
    }
    setGeneratingLiteracyGuide(true);
    try {
      // Fetch latest assessment for personalized content
      const { data: assessments } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const latestAssessment = assessments?.[0];
      
      generateAILiteracyGuidePDF(latestAssessment ? {
        risk_classification: latestAssessment.risk_classification,
        risk_score: latestAssessment.risk_score,
        legal_justification: latestAssessment.legal_justification,
        relevant_articles: latestAssessment.relevant_articles,
        priority_actions: latestAssessment.priority_actions,
      } : undefined);
    } catch (error) {
      console.error("Error generating AI Literacy Guide:", error);
    } finally {
      setGeneratingLiteracyGuide(false);
    }
  };

  const handleDocumentDownload = (docId: number, docName: string) => {
    if (!hasCompliancePack) {
      toast.error("Você precisa adquirir o Dossiê de Conformidade para baixar este documento.");
      return;
    }
    generateQuickPDF(docId, docName);
  };

  const documentPDFContent: Record<number, { title: string; content: string[] }> = {
    1: {
      title: "Dossiê Técnico Anexo IV - EU AI Act",
      content: [
        "1. DESCRIÇÃO GERAL DO SISTEMA DE IA",
        "Conforme Anexo IV do Regulamento (UE) 2024/1689 (EU AI Act)",
        "",
        "2. INFORMAÇÕES EXIGIDAS PELO ANEXO IV",
        "• Nome e versão do sistema de IA",
        "• Identidade e dados de contacto do fornecedor",
        "• Descrição da finalidade do sistema",
        "• Descrição detalhada dos elementos do sistema e do processo de desenvolvimento",
        "",
        "3. GESTÃO DE RISCOS (Art. 9)",
        "• Sistema de gestão de riscos implementado",
        "• Identificação e análise de riscos conhecidos e previsíveis",
        "• Medidas de gestão e mitigação adotadas",
        "",
        "4. DADOS E GOVERNAÇÃO DE DADOS (Art. 10)",
        "• Práticas de formação, validação e ensaio de dados",
        "• Conjuntos de dados utilizados",
        "• Medidas de qualidade de dados",
      ],
    },
    2: {
      title: "Instruções de Uso - Artigo 13 EU AI Act",
      content: [
        "1. INFORMAÇÕES PARA O RESPONSÁVEL PELA IMPLANTAÇÃO",
        "Conforme Artigo 13 do Regulamento (UE) 2024/1689",
        "",
        "2. CONTEÚDO DAS INSTRUÇÕES",
        "• Identidade e dados de contacto do fornecedor",
        "• Características, capacidades e limitações do sistema",
        "• Alterações ao sistema ao longo do seu ciclo de vida",
        "",
        "3. SUPERVISÃO HUMANA (Art. 14)",
        "• Medidas de interface homem-máquina",
        "• Capacidades e limitações de desempenho do sistema",
        "• Riscos conhecidos para a saúde, segurança ou direitos fundamentais",
        "",
        "4. ESPECIFICAÇÕES TÉCNICAS",
        "• Níveis previstos de precisão e robustez",
        "• Medidas de cibersegurança implementadas",
      ],
    },
    3: {
      title: "Guia de Literacia em IA - Artigo 4 EU AI Act",
      content: [
        "1. OBRIGAÇÃO DE LITERACIA EM IA",
        "Conforme Artigo 4 do Regulamento (UE) 2024/1689",
        "",
        "2. REQUISITOS DE FORMAÇÃO",
        "• Fornecedores e responsáveis pela implantação devem assegurar literacia suficiente",
        "• Competências, conhecimentos e compreensão de IA adequados",
        "• Tendo em conta o contexto e as pessoas que utilizam os sistemas",
        "",
        "3. CONTEÚDO DA FORMAÇÃO",
        "• Conceitos fundamentais de IA",
        "• Limitações e riscos dos sistemas de IA",
        "• Identificação de vieses algorítmicos",
        "• Direitos dos afetados por sistemas de IA",
        "",
        "4. PROCEDIMENTOS INTERNOS",
        "• Processo de reporte de incidentes",
        "• Canais de comunicação para questões de IA",
      ],
    },
    4: {
      title: "Registro de Logs de Auditoria",
      content: [
        "1. REQUISITOS DE LOGGING (Art. 12)",
        "Os sistemas de IA de alto risco devem manter logs automáticos durante todo o ciclo de vida.",
        "",
        "2. INFORMAÇÕES A REGISTRAR",
        "• Data e hora de cada utilização",
        "• Identificação do operador/utilizador",
        "• Dados de entrada e saída",
        "• Período de conservação dos registos",
        "",
        "3. RASTREABILIDADE",
        "• Permitir rastrear o funcionamento do sistema",
        "• Facilitar monitorização pós-comercialização",
      ],
    },
    5: {
      title: "Avaliação de Impacto em Direitos Fundamentais",
      content: [
        "1. IDENTIFICAÇÃO DO SISTEMA (Art. 27)",
        "• Nome do sistema:",
        "• Operador responsável:",
        "",
        "2. ANÁLISE DE DIREITOS IMPACTADOS",
        "• Dignidade humana",
        "• Liberdade e autonomia",
        "• Não-discriminação",
        "• Proteção de dados pessoais",
        "",
        "3. MEDIDAS DE MITIGAÇÃO",
        "• Salvaguardas implementadas",
        "• Procedimentos de supervisão humana",
      ],
    },
    6: {
      title: "Política de Supervisão Humana",
      content: [
        "1. OBJETIVO (Art. 14)",
        "Estabelecer diretrizes para supervisão humana adequada conforme Artigo 14.",
        "",
        "2. PRINCÍPIOS DE SUPERVISÃO",
        "• Capacidade de compreender o funcionamento",
        "• Capacidade de monitorar a operação",
        "• Capacidade de intervir ou interromper",
        "",
        "3. RESPONSABILIDADES",
        "• Designação de responsáveis",
        "• Formação adequada dos supervisores",
        "• Procedimentos de escalação",
      ],
    },
  };

  const generateQuickPDF = (docId: number, docName: string) => {
    const template = documentPDFContent[docId];
    if (!template) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Header
    pdf.setFillColor(12, 25, 41);
    pdf.rect(0, 0, pageWidth, 40, "F");
    
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(template.title, margin, 25);

    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(10);
    pdf.text(`EU AI Act Compliance • ${new Date().toLocaleDateString("pt-BR")}`, margin, 35);

    yPosition = 55;

    // Content
    pdf.setTextColor(50, 50, 50);
    
    for (const line of template.content) {
      if (line === "") {
        yPosition += 5;
        continue;
      }

      if (line.match(/^\d+\./)) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(12, 25, 41);
        yPosition += 5;
      } else if (line.startsWith("•")) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
      } else {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
      }

      const lines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
      for (const textLine of lines) {
        pdf.text(textLine, margin, yPosition);
        yPosition += 6;
      }
    }

    // Footer
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 280, pageWidth, 17, "F");
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.text("EU AI Act Compliance Tool • Documento gerado automaticamente", margin, 288);

    pdf.save(`${docName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch system updates
  useEffect(() => {
    const fetchSystemUpdates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("system_updates")
          .select("*")
          .order("priority", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching system updates:", error);
        } else {
          setSystemUpdates(data || []);
        }
      } catch (error) {
        console.error("Error fetching system updates:", error);
      } finally {
        setUpdatesLoading(false);
      }
    };

    fetchSystemUpdates();
  }, [user]);

  // Verify payment if session_id is present in URL (redirect from Stripe)
  useEffect(() => {
    const verifyPaymentFromUrl = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId || !user || isVerifyingPayment) return;
      
      setIsVerifyingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) {
          console.error("Payment verification error:", error);
          toast.error("Erro ao verificar pagamento.");
        } else if (data?.paid) {
          toast.success("Pagamento confirmado! Documentos desbloqueados.");
          await refreshPurchase();
        }
      } catch (error) {
        console.error("Payment verification error:", error);
      } finally {
        setIsVerifyingPayment(false);
        // Clean up the URL
        searchParams.delete("session_id");
        setSearchParams(searchParams, { replace: true });
      }
    };

    verifyPaymentFromUrl();
  }, [searchParams, user, refreshPurchase, setSearchParams, isVerifyingPayment]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container-legal">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Painel de Conformidade
              </h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo, {user.email}! Acompanhe seu progresso rumo à conformidade total.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {hasCompliancePack && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenCustomerPortal}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Gerir Assinatura / Faturação
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* System Notifications Section */}
          <div className="legal-card p-6 mb-8 border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Notificações do Sistema
                </h2>
                <p className="text-xs text-muted-foreground">
                  Atualizações regulatórias e novos templates
                </p>
              </div>
            </div>
            
            {updatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : systemUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {systemUpdates.map((update) => {
                  const getUpdateIcon = (type: string) => {
                    switch (type) {
                      case "regulation":
                        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                      case "template":
                        return <FileText className="w-4 h-4 text-green-500" />;
                      case "warning":
                        return <ShieldAlert className="w-4 h-4 text-red-500" />;
                      default:
                        return <Info className="w-4 h-4 text-blue-500" />;
                    }
                  };
                  
                  const getUpdateBadge = (type: string) => {
                    switch (type) {
                      case "regulation":
                        return { bg: "bg-amber-500/10", text: "text-amber-500", label: "Regulação" };
                      case "template":
                        return { bg: "bg-green-500/10", text: "text-green-500", label: "Template" };
                      case "warning":
                        return { bg: "bg-red-500/10", text: "text-red-500", label: "Alerta" };
                      default:
                        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Info" };
                    }
                  };
                  
                  const badge = getUpdateBadge(update.update_type);
                  
                  return (
                    <div
                      key={update.id}
                      className="p-4 rounded-lg border border-border hover:border-accent/30 transition-all bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getUpdateIcon(update.update_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-foreground">
                              {update.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {update.content}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(update.published_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assessment History Section */}
          <div className="legal-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <History className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Histórico de Avaliações
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suas avaliações de risco anteriores
                </p>
              </div>
            </div>
            <AssessmentHistory />
          </div>

          {/* Compliance Pack Status / Purchase CTA */}
          {!purchaseLoading && (
            <PricingCards hasCompliancePack={hasCompliancePack} />
          )}

          {/* AI Literacy Guide Section - Compliance Pack Feature (show only if purchased) */}
          {hasCompliancePack && (
            <div className="legal-card p-6 mb-8 bg-gradient-to-r from-gold/5 to-accent/5 border-gold/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Guia de Literacia em IA (Artigo 4)
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
                      ✓ Desbloqueado
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Documento profissional de 8 páginas baseado no EU AI Act 2026. Inclui introdução à IA para colaboradores, 
                    direitos e responsabilidades, identificação de vieses, e procedimentos internos de reporte.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <BookOpen className="h-3 w-3" /> Formação Completa
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Conformidade Art. 4
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <FileText className="h-3 w-3" /> Personalizado
                    </span>
                  </div>
                </div>
                <Button 
                  variant="gold" 
                  size="lg"
                  onClick={handleDownloadLiteracyGuide}
                  disabled={generatingLiteracyGuide}
                  className="flex items-center gap-2 min-w-[180px]"
                >
                  {generatingLiteracyGuide ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {generatingLiteracyGuide ? "Gerando..." : "Download PDF"}
                </Button>
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className="legal-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-trust-gradient flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Progresso de Conformidade
                  </h2>
                  <span className="text-2xl font-bold text-accent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {completedTasks} de {totalTasks} tarefas concluídas • Prazo: Agosto 2026
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Documents Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Templates de Documentos
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => {
                  const DocIcon = doc.icon;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <DocIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.format} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-opacity ${hasCompliancePack ? 'opacity-0 group-hover:opacity-100' : 'opacity-50'}`}
                        onClick={() => handleDocumentDownload(doc.id, doc.name)}
                        title={hasCompliancePack ? "Download" : "Requer Dossiê de Conformidade"}
                      >
                        {hasCompliancePack ? (
                          <Download className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setDocumentsOpen(true)}
              >
                Ver Todos os Documentos
              </Button>
            </div>

            {/* Checklist Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Checklist de Obrigações
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedTasks}/{totalTasks}
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {tasks.map((task) => {
                  const isLocked = task.premium && !hasCompliancePack;
                  
                  return (
                    <div
                      key={task.key}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                        isLocked 
                          ? "border-border bg-muted/20 cursor-not-allowed opacity-60"
                          : task.completed
                            ? "border-accent/30 bg-accent/5 cursor-pointer"
                            : "border-border hover:border-accent/50 cursor-pointer"
                      } ${task.loading ? "opacity-70" : ""}`}
                      onClick={() => !task.loading && !isLocked && toggleTask(task.key)}
                    >
                      <div className="relative mt-0.5">
                        {task.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        ) : isLocked ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adquira o Dossiê de Conformidade para desbloquear esta tarefa</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.key)}
                            disabled={isLocked}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isLocked
                              ? "text-muted-foreground"
                              : task.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                          }`}
                        >
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {task.category}
                          </span>
                          {isLocked && (
                            <span className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                      {task.completed && !task.loading && !isLocked && (
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Help Banner */}
          <div className="legal-card p-6 mt-8 bg-gradient-to-r from-primary/5 to-accent/10 border-accent/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Precisa de ajuda com a conformidade?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Nossa equipe de especialistas está pronta para auxiliar sua empresa 
                  em cada etapa do processo de adequação ao EU AI Act.
                </p>
                <p className="text-xs text-accent font-medium flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Precisa de uma implementação personalizada para sistemas de Alto Risco? Fale com um especialista.
                </p>
              </div>
              <Button 
                variant="gold" 
                onClick={() => setCalendlyOpen(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Agendar Consultoria
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <DocumentsModal open={documentsOpen} onOpenChange={setDocumentsOpen} />
      
      <PopupModal
        url="https://calendly.com/cletoguarda/30min"
        onModalClose={() => setCalendlyOpen(false)}
        open={calendlyOpen}
        rootElement={document.getElementById("root") as HTMLElement}
        pageSettings={{
          backgroundColor: "0c1929",
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: "d4af37",
          textColor: "f8fafc",
        }}
      />
    </div>
  );
};

export default Dashboard;
