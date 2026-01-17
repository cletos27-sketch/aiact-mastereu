import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SettingsModal from "@/components/dashboard/SettingsModal";
import AssessmentHistory from "@/components/dashboard/AssessmentHistory";
import DocumentsModal from "@/components/dashboard/DocumentsModal"; // Import the extracted component
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
  RefreshCw,
  Languages, // Importar o ícone de idiomas
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { RiskAssessment, DocumentType } from "../types/dashboard"; // Import shared types
import { documentPDFContent } from "../lib/documentTemplates"; // Import document content

// Types for system updates
interface SystemUpdate {
  id: string;
  title: string;
  content: string;
  update_type: string;
  priority: number;
  published_at: string;
}

// Types for system announcements (global notifications)
interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
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
    premium: true, // All these documents are premium
  },
  {
    id: 2,
    name: "Instruções de Uso Art. 13",
    description: "Instruções para utilizadores conforme Artigo 13",
    format: "PDF",
    size: "45 KB",
    icon: Eye,
    premium: true,
  },
  {
    id: 3,
    name: "Guia de Literacia Art. 4",
    description: "Formação em literacia de IA conforme Artigo 4",
    format: "PDF",
    size: "2.3 MB",
    icon: BookOpen,
    premium: true,
  },
  {
    id: 4,
    name: "Registro de Logs de Auditoria",
    description: "Estrutura para rastreamento de decisões",
    format: "PDF",
    size: "32 KB",
    icon: ClipboardList,
    premium: true,
  },
  {
    id: 5,
    name: "Avaliação de Impacto",
    description: "Metodologia de análise de riscos",
    format: "PDF",
    size: "56 KB",
    icon: ShieldAlert,
    premium: true,
  },
  {
    id: 6,
    name: "Política de Supervisão Humana",
    description: "Definição de papéis e responsabilidades",
    format: "PDF",
    size: "38 KB",
    icon: Users,
    premium: true,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const { 
    hasCompliancePack, 
    hasPremiumAccess,
    hasBasicAccess,
    accessLevel,
    isPaymentFailed, 
    isCanceled,
    isSubscriptionEnded,
    hasAnyPurchaseRecord,
    loading: purchaseLoading, 
    refresh: refreshPurchase 
  } = usePurchaseStatus();
  const [isRefreshingAccess, setIsRefreshingAccess] = useState(false);
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
  const [systemAnnouncements, setSystemAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt'); // Estado de idioma

  const handleAccessCheck = (isPremiumDoc: boolean, downloadFn: () => void) => {
    if (isSubscriptionEnded || isCanceled) {
      toast.error("⚠️ Assinatura Encerrada", {
        description: "Seu acesso aos documentos foi bloqueado. Adquira um plano para continuar.",
        action: {
          label: "Ver Planos",
          onClick: () => window.location.href = "/#pricing",
        },
      });
      return;
    }
    if (isPaymentFailed) {
      toast.error("Assinatura Pendente", {
        description: "Por favor, atualize seus dados de pagamento para baixar documentos.",
        action: {
          label: "Atualizar Pagamento",
          onClick: () => window.location.href = "/dashboard",
        },
      });
      return;
    }
    if (!hasCompliancePack) {
      toast.error("Conteúdo Premium", {
        description: "Este documento está disponível apenas para clientes do Compliance Pack.",
        action: {
          label: "Ver Planos",
          onClick: () => window.location.href = "/#pricing",
        },
      });
      return;
    }
    // If it's a premium document and user only has basic access
    if (isPremiumDoc && hasBasicAccess && !hasPremiumAccess) {
      toast.error("⚠️ Upgrade Necessário", {
        description: "Seu plano mensal permite apenas diagnósticos básicos. Faça upgrade para o Pacote Premium (499€) para acessar este documento.",
        action: {
          label: "Fazer Upgrade",
          onClick: async () => {
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData.session?.access_token;

              if (!accessToken) {
                toast.info("Faça login para continuar com a compra");
                window.location.href = "/login";
                return;
              }

              const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: { price_id: "price_1So0IyIV86RXPoUIiR2PXhM5" }, // Premium one-time price
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              if (error) {
                toast.error("Erro ao iniciar checkout. Tente novamente.");
                return;
              }
              if (data?.url) {
                window.location.assign(data.url);
              }
            } catch (err) {
              toast.error("Erro ao processar. Tente novamente.");
            }
          },
        },
      });
      return;
    }
    downloadFn();
  };

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

  const generateQuickPDF = (docId: number, docName: string) => {
    const template = documentPDFContent[docId];
    if (!template) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;
    let pageNumber = 1;

    const addFooter = () => {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `EU AI Act Compliance Tool • Versão 1.0 • ${new Date().toLocaleDateString("pt-BR")} • Página ${pageNumber}`,
        margin,
        pageHeight - 10
      );
    };

    const checkPageBreak = (neededSpace: number = 30) => {
      if (yPosition > pageHeight - neededSpace - 25) {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = 30;
        // Add header on new page
        pdf.setFillColor(12, 25, 41);
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setFillColor(212, 175, 55);
        pdf.rect(0, 20, pageWidth, 2, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(template.title, margin, 13);
      }
    };

    // Header
    pdf.setFillColor(12, 25, 41);
    pdf.rect(0, 0, pageWidth, 45, "F");
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 45, pageWidth, 2, "F");

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(template.title, pageWidth - 2 * margin);
    pdf.text(titleLines, margin, 22);

    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Regulamento (UE) 2024/1689 — EU AI Act`, margin, 35);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, margin, 42);

    yPosition = 60;

    // Content
    for (const section of template.sections) {
      checkPageBreak(40);

      // Section heading with background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin - 3, yPosition - 5, pageWidth - 2 * margin + 6, 12, "F");
      pdf.setFillColor(212, 175, 55);
      pdf.rect(margin - 3, yPosition - 5, 3, 12, "F");

      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(section.heading, margin + 5, yPosition + 3);
      yPosition += 18;

      // Section items
      for (const item of section.items) {
        checkPageBreak(15);

        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        // Check if it's a sub-item (starts with -)
        const isSubItem = item.startsWith("-");
        const bulletX = isSubItem ? margin + 10 : margin;
        const textX = bulletX + 6;
        const textContent = isSubItem ? item.substring(2) : item;

        // Gold bullet
        pdf.setFillColor(212, 175, 55);
        pdf.circle(bulletX + 2, yPosition - 1.5, 1.2, "F");

        const lines = pdf.splitTextToSize(textContent, pageWidth - textX - margin);
        for (const line of lines) {
          checkPageBreak(8);
          pdf.text(line, textX, yPosition);
          yPosition += 5.5;
        }
        yPosition += 2;
      }

      yPosition += 8;
    }

    addFooter();
    pdf.save(`${docName.replace(/\s+/g, "_")}_v1.0_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleDocumentDownload = (docId: number, docName: string) => {
    generateQuickPDF(docId, docName);
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

  // Fetch system announcements (global notifications)
  useEffect(() => {
    const fetchSystemAnnouncements = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("system_announcements")
          .select("*")
          .order("priority", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching system announcements:", error);
        } else {
          setSystemAnnouncements((data as SystemAnnouncement[]) || []);
        }
      } catch (error) {
        console.error("Error fetching system announcements:", error);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchSystemAnnouncements();
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
            <div className="flex flex-wrap gap-2">
              {/* Botão de troca de idioma */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === 'pt' ? 'English' : 'Português'}
              </Button>

              {/* Refresh Access Button - always visible */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setIsRefreshingAccess(true);
                  await refreshPurchase();
                  // After refresh, check if hasCompliancePack is true and reload
                  if (hasCompliancePack) {
                    window.location.reload();
                  }
                  setIsRefreshingAccess(false);
                }}
                disabled={isRefreshingAccess || purchaseLoading}
              >
                {isRefreshingAccess ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar Acesso
              </Button>
              
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
            </div>
          </div>

          {/* No Purchase Record Banner - Show only if user has ZERO records */}
          {hasAnyPurchaseRecord === false && !purchaseLoading && (
            <div className="legal-card p-6 mb-8 border-gold/50 bg-gradient-to-r from-gold/10 to-accent/5">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg font-semibold text-gold mb-1">
                    🚀 Comece sua Conformidade
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você ainda não adquiriu nenhum plano. Escolha uma opção abaixo para desbloquear 
                    diagnósticos e documentos de conformidade com o EU AI Act.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Ended Warning Banner - Show only if user HAS a purchase record but it's ended */}
          {isSubscriptionEnded && !isPaymentFailed && hasAnyPurchaseRecord === true && (
            <div className="legal-card p-6 mb-8 border-red-600/70 bg-red-600/15">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-600/30 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg font-semibold text-red-600 mb-1">
                    🔒 Assinatura Encerrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sua assinatura foi cancelada ou expirou. <strong>Todo o acesso aos documentos está bloqueado.</strong>
                    Para voltar a ter acesso, adquira novamente o Dossiê de Conformidade.
                  </p>
                </div>
                <Button 
                  variant="default"
                  onClick={async () => {
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      const accessToken = sessionData.session?.access_token;

                      if (!accessToken) {
                        toast.info("Faça login para continuar com a compra");
                        navigate("/login");
                        return;
                      }

                      const { data, error } = await supabase.functions.invoke("create-checkout", {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      });

                      if (error) {
                        toast.error("Erro ao iniciar checkout. Tente novamente.");
                        return;
                      }

                      if (data?.url) {
                        window.location.assign(data.url);
                      }
                    } catch (err) {
                      toast.error("Erro ao processar. Tente novamente.");
                    }
                  }}
                >
                  Ver Planos
                </Button>
              </div>
            </div>
          )}

          {/* Payment Failed Warning Banner */}
          {isPaymentFailed && (
            <div className="legal-card p-6 mb-8 border-red-500/50 bg-red-500/10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg font-semibold text-red-500 mb-1">
                    ⚠️ Assinatura Pendente
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Houve um problema com o pagamento da sua assinatura. Os downloads de documentos estão temporariamente bloqueados.
                    Por favor, atualize seus dados de pagamento para continuar usando o serviço.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={handleOpenCustomerPortal}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Atualizar Pagamento
                </Button>
              </div>
            </div>
          )}

          {/* Basic Plan Info Banner - Show for users with basic access */}
          {hasBasicAccess && !hasPremiumAccess && !isSubscriptionEnded && !isPaymentFailed && (
            <div className="legal-card p-6 mb-8 border-blue-500/50 bg-blue-500/10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg font-semibold text-blue-500 mb-1">
                    📊 Plano Mensal Ativo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem acesso a <strong>diagnósticos básicos e painel de conformidade</strong>. 
                    Para desbloquear downloads de documentos e consultoria IA avançada, 
                    faça upgrade para o <strong>Pacote Premium (499€)</strong>.
                  </p>
                </div>
                <Button 
                  variant="gold"
                  onClick={async () => {
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      const accessToken = sessionData.session?.access_token;

                      if (!accessToken) {
                        toast.info("Faça login para continuar com a compra");
                        navigate("/login");
                        return;
                      }

                      const { data, error } = await supabase.functions.invoke("create-checkout", {
                        body: { price_id: "price_1So0IyIV86RXPoUIiR2PXhM5" },
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      });
                      if (error) {
                        toast.error("Erro ao iniciar checkout. Tente novamente.");
                        return;
                      }
                      if (data?.url) {
                        window.location.assign(data.url);
                      }
                    } catch (err) {
                      toast.error("Erro ao processar. Tente novamente.");
                    }
                  }}
                >
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          )}

          {!announcementsLoading && systemAnnouncements.length > 0 && (
            <div className="legal-card p-6 mb-8 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Comunicados Importantes
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Mensagens importantes da administração
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {systemAnnouncements.map((announcement) => {
                  const getAnnouncementIcon = (type: string) => {
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
                  
                  const getAnnouncementBadge = (type: string) => {
                    switch (type) {
                      case "urgent":
                        return { bg: "bg-red-500/10", text: "text-red-500", label: "Urgente" };
                      case "update":
                        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Atualização" };
                      case "maintenance":
                        return { bg: "bg-amber-500/10", text: "text-amber-500", label: "Manutenção" };
                      default:
                        return { bg: "bg-primary/10", text: "text-primary", label: "Comunicado" };
                    }
                  };
                  
                  const badge = getAnnouncementBadge(announcement.announcement_type);
                  
                  return (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all bg-background"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getAnnouncementIcon(announcement.announcement_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-foreground">
                              {announcement.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(announcement.published_at).toLocaleDateString("pt-BR", {
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
            </div>
          )}

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
                      case "urgent":
                        return { bg: "bg-red-500/10", text: "text-red-500", label: "Urgente" };
                      case "update":
                        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Atualização" };
                      case "maintenance":
                        return { bg: "bg-amber-500/10", text: "text-amber-500", label: "Manutenção" };
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
                          {getUpdateIcon(update.type)}
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

          {/* AI Literacy Guide Section - Premium Feature (show only if purchased) */}
          {hasCompliancePack && (
            <div className={`legal-card p-6 mb-8 ${
              hasCompliancePack 
                ? "bg-gradient-to-r from-gold/5 to-accent/5 border-gold/30" 
                : "bg-muted/20 border-muted"
            }`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  hasCompliancePack 
                    ? "bg-gradient-to-br from-gold to-gold/70" 
                    : "bg-muted/50"
                }`}>
                  <GraduationCap className={`w-8 h-8 ${hasCompliancePack ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Guia de Literacia em IA (Artigo 4)
                    </h2>
                    {hasCompliancePack ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
                        ✓ Desbloqueado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gold/10 text-gold rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {hasCompliancePack 
                      ? "Documento profissional de 8 páginas baseado no EU AI Act 2026. Inclui introdução à IA para colaboradores, direitos e responsabilidades, identificação de vieses, e procedimentos internos de reporte."
                      : "Disponível apenas para o Pacote Premium (499€). Faça upgrade para acessar este documento completo."
                    }
                  </p>
                  {hasCompliancePack && (
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
                  )}
                </div>
                <Button 
                  variant="gold" 
                  onClick={() => handleAccessCheck(true, handleDownloadLiteracyGuide)} // This is a premium document
                  disabled={generatingLiteracyGuide || purchaseLoading}
                  className="flex items-center gap-2 min-w-[180px]"
                >
                  {generatingLiteracyGuide ? "Gerando..." : hasCompliancePack ? "Download PDF" : "Fazer Upgrade"}
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
                  const isPremiumDoc = doc.premium; // All documents here are premium
                  const canDownload = hasCompliancePack && !isSubscriptionEnded && !isPaymentFailed;
                  const isLockedForBasic = hasBasicAccess && !hasPremiumAccess;
                  const isDisabled = purchaseLoading || isLockedForBasic || !hasCompliancePack;
                  
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
                        canDownload 
                          ? "border-border hover:border-accent/50 hover:bg-muted/30" 
                          : "border-border/50 bg-muted/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          canDownload ? "bg-accent/10" : "bg-muted"
                        }`}>
                          <DocIcon className={`w-5 h-5 ${canDownload ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${
                              canDownload ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {doc.name}
                            </p>
                            {!canDownload && (
                              <span className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded">
                                Premium
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {doc.format} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-opacity ${canDownload ? 'opacity-0 group-hover:opacity-100' : 'opacity-50'}`}
                        onClick={() => handleAccessCheck(isPremiumDoc, () => handleDocumentDownload(doc.id, doc.name))}
                        disabled={isDisabled}
                        title={
                          isLockedForBasic 
                            ? "Requer Pacote Premium (499€)" 
                            : canDownload 
                              ? "Download" 
                              : "Requer Dossiê de Conformidade"
                        }
                      >
                        {canDownload ? (
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
                          <Loader2 className="h-4 w-4 animate-spin" />
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
                          {language === 'pt' ? task.task : (task.task_en || task.task)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {language === 'pt' ? task.category : (task.category_en || task.category)}
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