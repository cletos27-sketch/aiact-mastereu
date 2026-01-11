import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import {
  Download,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  GraduationCap,
  Lock,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { generateAILiteracyGuidePDF } from "@/lib/generateAILiteracyGuidePDF";
import { toast } from "sonner";

interface RiskAssessment {
  id: string;
  risk_classification: string;
  risk_score: number;
  created_at: string;
  legal_justification: string | null;
  relevant_articles: string[] | null;
  priority_actions: string[] | null;
  responses: unknown;
}

interface DocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DocumentType = 
  | "transparencia"
  | "logs"
  | "tecnica"
  | "literacia"
  | "impacto"
  | "supervisao";

const documentTemplates: Record<DocumentType, { title: string; sections: string[] }> = {
  transparencia: {
    title: "Política de Transparência em IA",
    sections: [
      "1. OBJETIVO",
      "Esta política estabelece as diretrizes para garantir transparência no uso de sistemas de Inteligência Artificial, em conformidade com o Regulamento Europeu de IA (EU AI Act).",
      "",
      "2. ÂMBITO DE APLICAÇÃO",
      "Aplica-se a todos os sistemas de IA utilizados pela organização que interajam direta ou indiretamente com cidadãos da União Europeia.",
      "",
      "3. PRINCÍPIOS DE TRANSPARÊNCIA",
      "• Informar claramente quando um sistema de IA está em uso",
      "• Explicar as finalidades do sistema de IA",
      "• Disponibilizar informações sobre a lógica de funcionamento",
      "• Comunicar limitações conhecidas do sistema",
      "",
      "4. OBRIGAÇÕES ESPECÍFICAS",
      "• Sistemas de chatbot: Informar que o usuário está interagindo com IA",
      "• Sistemas de reconhecimento de emoções: Obter consentimento prévio",
      "• Conteúdo gerado por IA: Marcar claramente como artificial",
      "",
      "5. RESPONSABILIDADES",
      "O Responsável pela Conformidade de IA deve garantir a implementação desta política.",
    ],
  },
  logs: {
    title: "Estrutura de Registro de Logs de Auditoria",
    sections: [
      "1. REQUISITOS DE LOGGING (Artigo 12)",
      "Os sistemas de IA de alto risco devem manter logs automáticos durante todo o ciclo de vida.",
      "",
      "2. INFORMAÇÕES A REGISTRAR",
      "• Data e hora de cada utilização",
      "• Identificação do operador/usuário",
      "• Dados de entrada processados",
      "• Decisões/outputs gerados",
      "• Tempo de processamento",
      "• Eventuais erros ou anomalias",
      "",
      "3. PERÍODO DE RETENÇÃO",
      "• Mínimo: Duração especificada na documentação técnica",
      "• Sistemas de Alto Risco: Conforme requisitos regulatórios específicos",
      "",
      "4. FORMATO DE ARMAZENAMENTO",
      "• Formato estruturado (JSON/XML)",
      "• Criptografia em repouso",
      "• Backup regular",
      "• Rastreabilidade garantida",
      "",
      "5. ACESSO AOS LOGS",
      "• Autoridades de fiscalização: Acesso integral",
      "• Equipe interna: Conforme perfil de acesso",
    ],
  },
  tecnica: {
    title: "Documentação Técnica do Sistema de IA",
    sections: [
      "1. DESCRIÇÃO GERAL DO SISTEMA",
      "• Nome do sistema:",
      "• Versão:",
      "• Finalidade principal:",
      "• Classificação de risco EU AI Act:",
      "",
      "2. ARQUITETURA TÉCNICA",
      "• Modelo de IA utilizado:",
      "• Framework/biblioteca:",
      "• Infraestrutura de hospedagem:",
      "• Integrações com outros sistemas:",
      "",
      "3. DADOS DE TREINAMENTO",
      "• Fontes de dados:",
      "• Volume de dados:",
      "• Período de coleta:",
      "• Metodologia de validação:",
      "",
      "4. MÉTRICAS DE DESEMPENHO",
      "• Acurácia:",
      "• Precisão:",
      "• Recall:",
      "• Outras métricas relevantes:",
      "",
      "5. GESTÃO DE RISCOS",
      "• Riscos identificados:",
      "• Medidas de mitigação:",
      "• Testes realizados:",
      "",
      "6. MANUTENÇÃO E ATUALIZAÇÕES",
      "• Frequência de atualização:",
      "• Processo de validação pós-atualização:",
    ],
  },
  literacia: {
    title: "Material de Literacia em IA (Artigo 4)",
    sections: [
      "1. INTRODUÇÃO À LITERACIA EM IA",
      "O Artigo 4 do EU AI Act exige que provedores e operadores garantam que sua equipe tenha conhecimento suficiente sobre IA.",
      "",
      "2. CONCEITOS FUNDAMENTAIS",
      "• O que é Inteligência Artificial",
      "• Tipos de sistemas de IA",
      "• Diferença entre IA generativa e discriminativa",
      "• Limitações dos sistemas de IA",
      "",
      "3. EU AI ACT - VISÃO GERAL",
      "• Objetivos do regulamento",
      "• Classificação de riscos (Mínimo, Limitado, Alto, Inaceitável)",
      "• Obrigações por categoria de risco",
      "• Prazos de implementação",
      "",
      "4. BOAS PRÁTICAS",
      "• Validação de outputs de IA",
      "• Identificação de vieses",
      "• Supervisão humana adequada",
      "• Reportar anomalias",
      "",
      "5. RESPONSABILIDADES DA EQUIPE",
      "• Entender como os sistemas de IA funcionam",
      "• Conhecer suas limitações",
      "• Saber quando escalar decisões",
      "• Manter documentação atualizada",
    ],
  },
  impacto: {
    title: "Avaliação de Impacto em Direitos Fundamentais",
    sections: [
      "1. IDENTIFICAÇÃO DO SISTEMA",
      "• Nome do sistema:",
      "• Operador responsável:",
      "• Data da avaliação:",
      "",
      "2. ANÁLISE DE DIREITOS IMPACTADOS",
      "• Dignidade humana:",
      "• Liberdade e autonomia:",
      "• Não-discriminação:",
      "• Privacidade e proteção de dados:",
      "• Acesso à justiça:",
      "",
      "3. GRUPOS VULNERÁVEIS",
      "• Identificação de grupos afetados:",
      "• Impactos específicos por grupo:",
      "• Medidas de proteção:",
      "",
      "4. AVALIAÇÃO DE RISCOS",
      "• Probabilidade de impacto negativo:",
      "• Gravidade potencial:",
      "• Reversibilidade do dano:",
      "",
      "5. MEDIDAS DE MITIGAÇÃO",
      "• Ações preventivas:",
      "• Mecanismos de correção:",
      "• Processo de monitoramento:",
      "",
      "6. CONCLUSÃO E RECOMENDAÇÕES",
      "• Parecer final:",
      "• Condições para operação:",
      "• Revisões futuras necessárias:",
    ],
  },
  supervisao: {
    title: "Política de Supervisão Humana",
    sections: [
      "1. OBJETIVO",
      "Estabelecer diretrizes para garantir supervisão humana adequada dos sistemas de IA, conforme Artigo 14 do EU AI Act.",
      "",
      "2. PRINCÍPIOS DE SUPERVISÃO",
      "• Capacidade de compreender o funcionamento do sistema",
      "• Capacidade de monitorar a operação",
      "• Capacidade de intervir ou interromper o sistema",
      "• Capacidade de ignorar outputs do sistema",
      "",
      "3. PAPÉIS E RESPONSABILIDADES",
      "• Operador de IA: Monitoramento diário",
      "• Supervisor de IA: Revisão de decisões críticas",
      "• Responsável de Conformidade: Auditoria periódica",
      "• Gestão: Aprovação de mudanças significativas",
      "",
      "4. PROCEDIMENTOS DE INTERVENÇÃO",
      "• Critérios para intervenção manual",
      "• Processo de escalação",
      "• Documentação de intervenções",
      "",
      "5. TREINAMENTO NECESSÁRIO",
      "• Capacitação inicial obrigatória",
      "• Atualizações periódicas",
      "• Avaliação de competências",
      "",
      "6. REGISTRO E AUDITORIA",
      "• Documentação de todas as intervenções",
      "• Relatórios periódicos de supervisão",
      "• Indicadores de desempenho",
    ],
  },
};

const DocumentsModal = ({ open, onOpenChange }: DocumentsModalProps) => {
  const { user } = useAuth();
  const { hasCompliancePack, isPaymentFailed, loading: purchaseLoading } = usePurchaseStatus();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  const handlePremiumDownload = (downloadFn: () => void) => {
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
    downloadFn();
  };

  useEffect(() => {
    if (open && user) {
      fetchAssessments();
    }
  }, [open, user]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (classification: string) => {
    switch (classification) {
      case "Risco Inaceitável":
        return { color: "bg-red-500", icon: AlertTriangle, textColor: "text-red-400" };
      case "Alto Risco":
        return { color: "bg-orange-500", icon: Shield, textColor: "text-orange-400" };
      case "Risco Limitado":
        return { color: "bg-yellow-500", icon: Shield, textColor: "text-yellow-400" };
      default:
        return { color: "bg-green-500", icon: CheckCircle, textColor: "text-green-400" };
    }
  };

  const generateDocumentPDF = async (docType: DocumentType, assessment?: RiskAssessment) => {
    setGeneratingPDF(docType);
    
    try {
      const template = documentTemplates[docType];
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // Header
      pdf.setFillColor(12, 25, 41);
      pdf.rect(0, 0, pageWidth, 40, "F");
      
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(template.title, margin, 25);

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text(`EU AI Act Compliance • Gerado em ${new Date().toLocaleDateString("pt-BR")}`, margin, 35);

      yPosition = 55;

      // If we have an assessment, add context
      if (assessment) {
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(10);
        pdf.text(`Baseado na avaliação de ${new Date(assessment.created_at).toLocaleDateString("pt-BR")}`, margin, yPosition);
        yPosition += 5;
        pdf.text(`Classificação: ${assessment.risk_classification} (Score: ${assessment.risk_score})`, margin, yPosition);
        yPosition += 15;
      }

      // Content
      pdf.setTextColor(50, 50, 50);
      
      for (const section of template.sections) {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        if (section === "") {
          yPosition += 5;
          continue;
        }

        if (section.match(/^\d+\./)) {
          // Section header
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(12, 25, 41);
          yPosition += 5;
        } else if (section.startsWith("•")) {
          // Bullet point
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(80, 80, 80);
        } else {
          // Regular text
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
        }

        const lines = pdf.splitTextToSize(section, pageWidth - 2 * margin);
        for (const line of lines) {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        }
      }

      // Add assessment-specific information if available
      if (assessment) {
        pdf.addPage();
        yPosition = 20;

        pdf.setFillColor(12, 25, 41);
        pdf.rect(0, 0, pageWidth, 30, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Informações do Diagnóstico", margin, 20);

        yPosition = 45;

        if (assessment.legal_justification) {
          pdf.setTextColor(12, 25, 41);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Justificativa Legal:", margin, yPosition);
          yPosition += 8;

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(10);
          const justificationLines = pdf.splitTextToSize(assessment.legal_justification, pageWidth - 2 * margin);
          for (const line of justificationLines) {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          }
          yPosition += 10;
        }

        if (assessment.relevant_articles && assessment.relevant_articles.length > 0) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setTextColor(12, 25, 41);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Artigos Relevantes:", margin, yPosition);
          yPosition += 8;

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(10);
          for (const article of assessment.relevant_articles) {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(`• ${article}`, margin, yPosition);
            yPosition += 6;
          }
          yPosition += 10;
        }

        if (assessment.priority_actions && assessment.priority_actions.length > 0) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setTextColor(12, 25, 41);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Ações Prioritárias:", margin, yPosition);
          yPosition += 8;

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(10);
          for (const action of assessment.priority_actions) {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            const actionLines = pdf.splitTextToSize(`• ${action}`, pageWidth - 2 * margin);
            for (const line of actionLines) {
              pdf.text(line, margin, yPosition);
              yPosition += 6;
            }
          }
        }
      }

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(0, 280, pageWidth, 17, "F");
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        pdf.text("EU AI Act Compliance Tool • Este documento foi gerado automaticamente", margin, 288);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, 288);
      }

      pdf.save(`${docType}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const latestAssessment = assessments.length > 0 ? assessments[0] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Documentos e Avaliações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Assessment History Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Histórico de Avaliações de Risco
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma avaliação encontrada.</p>
                <Button variant="outline" className="mt-3" asChild>
                  <a href="/assessment">Iniciar Avaliação</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {assessments.map((assessment) => {
                  const config = getRiskConfig(assessment.risk_classification);
                  const RiskIcon = config.icon;
                  return (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.color}/20 flex items-center justify-center`}>
                          <RiskIcon className={`h-4 w-4 ${config.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {assessment.risk_classification}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
                            <span>•</span>
                            <span>Score: {assessment.risk_score}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={config.textColor}>
                        {assessment.risk_classification}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Literacy Guide - Featured Document */}
          <div className={`bg-gradient-to-r rounded-lg border p-4 ${
            hasCompliancePack 
              ? "from-gold/10 to-accent/10 border-gold/30" 
              : "from-muted/50 to-muted/30 border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                  hasCompliancePack 
                    ? "bg-gradient-to-br from-gold to-gold/70" 
                    : "bg-muted"
                }`}>
                  {hasCompliancePack ? (
                    <GraduationCap className="h-6 w-6 text-primary" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      Guia de Literacia em IA (Artigo 4)
                    </p>
                    <Badge className={`text-xs ${
                      hasCompliancePack 
                        ? "bg-gold/20 text-gold" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {hasCompliancePack ? "Compliance Pack" : "🔒 Premium"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documento profissional de 8 páginas • EU AI Act 2026
                  </p>
                </div>
              </div>
              <Button
                variant={hasCompliancePack ? "gold" : "outline"}
                size="sm"
                onClick={() => handlePremiumDownload(() => {
                  generateAILiteracyGuidePDF(latestAssessment ? {
                    risk_classification: latestAssessment.risk_classification,
                    risk_score: latestAssessment.risk_score,
                    legal_justification: latestAssessment.legal_justification,
                    relevant_articles: latestAssessment.relevant_articles,
                    priority_actions: latestAssessment.priority_actions,
                  } : undefined);
                })}
                className="flex items-center gap-2"
                disabled={purchaseLoading}
              >
                {purchaseLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasCompliancePack ? (
                  <>
                    <Download className="h-4 w-4" />
                    Download
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Premium
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Document Templates Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold" />
              Templates de Documentos
              {latestAssessment && (
                <Badge variant="secondary" className="text-xs">
                  Personalizados com seu diagnóstico
                </Badge>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(documentTemplates) as DocumentType[]).map((docType) => {
                const template = documentTemplates[docType];
                const isGenerating = generatingPDF === docType;
                
                return (
                  <div
                    key={docType}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
                      hasCompliancePack 
                        ? "border-border hover:border-accent/50 hover:bg-muted/30" 
                        : "border-border/50 bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        hasCompliancePack ? "bg-accent/10" : "bg-muted"
                      }`}>
                        {hasCompliancePack ? (
                          <FileText className="h-5 w-5 text-accent" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${
                            hasCompliancePack ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {template.title}
                          </p>
                          {!hasCompliancePack && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              🔒
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          PDF • {hasCompliancePack ? "Gerado dinamicamente" : "Conteúdo Premium"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePremiumDownload(() => generateDocumentPDF(docType, latestAssessment))}
                      disabled={isGenerating || purchaseLoading}
                      className={`transition-opacity ${
                        hasCompliancePack 
                          ? "opacity-70 group-hover:opacity-100" 
                          : "opacity-50"
                      }`}
                    >
                      {isGenerating || purchaseLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : hasCompliancePack ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsModal;
