import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react"; // useRef e supabase removidos
// import { supabase } from "@/integrations/supabase/client"; // Removido: não utilizado diretamente aqui
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PricingCards from "@/components/PricingCards";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { toast } from "sonner"; // Import toast from sonner
import jsPDF from "jspdf";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Gauge,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldOff,
  Users,
} from "lucide-react";

// interface RiskScore { // Removido: não utilizado
//   score: number;
//   maxScore: number;
//   percentage: number;
// }

interface QuestionData {
  id: number;
  question: string;
  category: string;
  riskType: string;
  legalReference: string;
  answer: string;
  triggersClassification: boolean;
}

type RiskClassification = "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO";

const PENDING_ASSESSMENT_KEY = "pending_assessment_data";

const Results = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const { hasCompliancePack, loading: purchaseLoading } = usePurchaseStatus();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Effect to load assessment data from location.state or localStorage
  useEffect(() => {
    if (location.state && !assessmentData) {
      setAssessmentData(location.state);
    } else if (!assessmentData) {
      const storedData = localStorage.getItem(PENDING_ASSESSMENT_KEY);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setAssessmentData(parsedData);
        } catch (e) {
          console.error("Error parsing pending assessment:", e);
          localStorage.removeItem(PENDING_ASSESSMENT_KEY);
        }
      }
    }
  }, [location.state, assessmentData]);
    
  if (!assessmentData) {
    return <Navigate to="/assessment" replace />;
  }

  const { questionsData, riskClassification } = assessmentData;
  const generateLegalJustification = useCallback((): string => {
  const triggeredQs = questionsData?.filter((q: QuestionData) => q.triggersClassification) || [];
    
    if (riskClassification === "FORA_DE_ESCOPO") {
      return "Conforme Artigo 2(5)(c) do Regulamento (UE) 2024/1689, sistemas de IA desenvolvidos ou utilizados exclusivamente para fins pessoais não profissionais estão fora do âmbito de aplicação do AI Act.";
    }
    
    if (riskClassification === "PROIBIDO") {
      const articles = triggeredQs.map((q: QuestionData) => q.legalReference).join(", ");
      return `O sistema enquadra-se nas práticas de IA proibidas definidas no Artigo 5 do AI Act. Referências específicas: ${articles}. A utilização deste sistema na sua forma atual é proibida na União Europeia.`;
    }
    
    if (riskClassification === "ALTO_RISCO") {
      const articles = triggeredQs.map((q: QuestionData) => q.legalReference).join(", ");
      return `O sistema é classificado como de alto risco conforme o Anexo III do Regulamento (UE) 2024/1689. Referências: ${articles}. São obrigatórias medidas de conformidade extensivas incluindo avaliação de conformidade, documentação técnica, e sistema de gestão de qualidade.`;
    }
    
    if (riskClassification === "RISCO_LIMITADO") {
      return "O sistema está sujeito a obrigações de transparência específicas conforme o Artigo 52 do AI Act. Os utilizadores devem ser informados de que estão interagindo com um sistema de IA.";
    }
    
    return "O sistema apresenta risco mínimo e não está sujeito a obrigações específicas do AI Act, além das boas práticas recomendadas.";
  }, [questionsData, riskClassification]);

  const getRelevantArticles = useCallback((): string[] => {
    const articles = new Set<string>();
    
    if (riskClassification === "PROIBIDO") {
      articles.add("Artigo 5 - Práticas Proibidas");
    }
    if (riskClassification === "ALTO_RISCO") {
      articles.add("Artigo 6 - Sistemas de Alto Risco");
      articles.add("Anexo III - Lista de Áreas de Alto Risco");
      articles.add("Artigo 9 - Gestão de Riscos");
      articles.add("Artigo 10 - Dados e Governança de Dados");
    }
    if (riskClassification === "RISCO_LIMITADO") {
      articles.add("Artigo 52 - Obrigações de Transparência");
    }
    
    questionsData?.filter((q: QuestionData) => q.triggersClassification).forEach((q: QuestionData) => {
      articles.add(q.legalReference);
    });
    
    articles.add("Artigo 4 - Literacia em IA");
    
    return Array.from(articles);
  }, [questionsData, riskClassification]);

  const getPriorityActions = useCallback((): string[] => {
    const actions: string[] = [];
    
    if (riskClassification === "PROIBIDO") {
      actions.push("Suspender imediatamente a utilização do sistema");
      actions.push("Consultar advogado especializado em AI Act");
      actions.push("Avaliar alternativas que cumpram a regulamentação");
      actions.push("Documentar a decisão e comunicar às partes interessadas");
    } else if (riskClassification === "ALTO_RISCO") {
      actions.push("Implementar sistema de gestão de qualidade");
      actions.push("Preparar documentação técnica completa");
      actions.push("Realizar avaliação de conformidade");
      actions.push("Estabelecer processos de supervisão humana");
      actions.push("Implementar sistema de logging e auditoria");
    } else if (riskClassification === "RISCO_LIMITADO") {
      actions.push("Implementar avisos de transparência claros");
      actions.push("Informar utilizadores sobre natureza IA do sistema");
      actions.push("Documentar medidas de transparência adoptadas");
    } else if (riskClassification === "FORA_DE_ESCOPO") {
      actions.push("Manter documentação sobre uso pessoal");
      actions.push("Reavaliar se houver uso comercial futuro");
    } else {
      actions.push("Implementar boas práticas de IA responsável");
      actions.push("Documentar funcionamento do sistema");
      actions.push("Monitorizar actualizações regulatórias");
    }
    
    actions.push("Implementar programa de literacia em IA (Artigo 4)");
    
    return actions;
  }, [riskClassification]);

  const generatePDF = useCallback(() => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * (fontSize * 0.4);
      };

      // Helper to check and add new page if needed
      const checkNewPage = (neededSpace: number) => {
        if (yPos + neededSpace > 270) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Header
      doc.setFillColor(15, 30, 60); // Navy blue
      doc.rect(0, 0, pageWidth, 45, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("EU AI-Compliance Master", margin, 20);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório de Diagnóstico de Conformidade", margin, 30);
      
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-PT", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}`, margin, 40);

      yPos = 60;

      // Risk Classification Box
      const riskLabels: Record<RiskClassification, string> = {
        PROIBIDO: "SISTEMA PROIBIDO",
        ALTO_RISCO: "ALTO RISCO",
        RISCO_LIMITADO: "RISCO LIMITADO",
        RISCO_MINIMO: "RISCO MÍNIMO",
        FORA_DE_ESCOPO: "FORA DO ÂMBITO"
      };

      const riskColors: Record<RiskClassification, [number, number, number]> = {
        PROIBIDO: [220, 38, 38],
        ALTO_RISCO: [234, 88, 12],
        RISCO_LIMITADO: [202, 138, 4],
        RISCO_MINIMO: [22, 163, 74],
        FORA_DE_ESCOPO: [100, 116, 139]
      };

      const [r, g, b] = riskColors[riskClassification as RiskClassification]; // Adicionado type assertion
      
      doc.setFillColor(r, g, b);
      doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Classificação: ${riskLabels[riskClassification as RiskClassification]}`, pageWidth / 2, yPos + 16, { align: "center" }); // Adicionado type assertion

      yPos += 40;

      // Legal Justification Section
      doc.setTextColor(15, 30, 60);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Justificativa Legal", margin, yPos);
      
      yPos += 8;
      doc.setDrawColor(200, 168, 87); // Gold
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + 40, yPos);
      
      yPos += 10;
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      yPos = addWrappedText(generateLegalJustification(), margin, yPos, contentWidth, 10);

      yPos += 15;
      checkNewPage(50);

      // Triggered Questions
      const triggeredQs = questionsData?.filter((q: QuestionData) => q.triggersClassification) || [];
      if (triggeredQs.length > 0) {
        doc.setTextColor(15, 30, 60);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("2. Questões Determinantes", margin, yPos);
        
        yPos += 8;
        doc.setDrawColor(200, 168, 87);
        doc.line(margin, yPos, margin + 50, yPos);
        
        yPos += 10;
        
        triggeredQs.forEach((q: QuestionData, idx: number) => {
          checkNewPage(25);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPos - 5, contentWidth, 20, 2, 2, "F");
          
          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`${idx + 1}.`, margin + 5, yPos + 3);
          
          doc.setFont("helvetica", "normal");
          const questionLines = doc.splitTextToSize(q.question, contentWidth - 25);
          doc.text(questionLines, margin + 15, yPos + 3);
          
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(q.legalReference, margin + 15, yPos + 12);
          
          yPos += 22;
        });
      }

      yPos += 10;
      checkNewPage(60);

      // Relevant Articles
      doc.setTextColor(15, 30, 60);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("3. Artigos Relevantes do EU AI Act", margin, yPos);
      
      yPos += 8;
      doc.setDrawColor(200, 168, 87);
      doc.line(margin, yPos, margin + 60, yPos);
      
      yPos += 10;
      
      const articles = getRelevantArticles();
      articles.forEach((article) => {
        checkNewPage(10);
        doc.setFillColor(200, 168, 87);
        doc.circle(margin + 3, yPos - 2, 1.5, "F");
        
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(article, margin + 10, yPos);
        yPos += 8;
      });

      yPos += 15;
      checkNewPage(60);

      // Priority Actions
      doc.setTextColor(15, 30, 60);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("4. Ações Prioritárias", margin, yPos);
      
      yPos += 8;
      doc.setDrawColor(200, 168, 87);
      doc.line(margin, yPos, margin + 40, yPos);
      
      yPos += 10;
      
      const actions = getPriorityActions();
      actions.forEach((action, idx) => {
        checkNewPage(12);
        doc.setFillColor(22, 163, 74);
        doc.roundedRect(margin, yPos - 4, 5, 5, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}`, margin + 1.5, yPos);
        
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        yPos = addWrappedText(action, margin + 10, yPos, contentWidth - 10, 10);
        yPos += 4;
      });

      // Footer on all pages
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(15, 30, 60);
        doc.rect(0, 285, pageWidth, 12, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("EU AI-Compliance Master | Regulamento (UE) 2024/1689", margin, 291);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 291, { align: "right" });
      }

      // Save the PDF
      const fileName = `EU-AI-Act-Diagnostico-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) { // Captura o erro para exibir a mensagem
      console.error("Error generating PDF:", error);
      toast.error(`Erro ao gerar PDF do relatório: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [riskClassification, questionsData, generateLegalJustification, getRelevantArticles, getPriorityActions]);

  const riskConfig = {
    PROIBIDO: {
      label: "Sistema Proibido",
      description: "O seu sistema enquadra-se nas práticas de IA proibidas pelo Artigo 5 do EU AI Act.",
      color: "risk-prohibited",
      icon: Ban,
      action: "A utilização deste sistema é proibida na UE. Consulte imediatamente um advogado especializado.",
      complianceScore: 0,
    },
    ALTO_RISCO: {
      label: "Alto Risco",
      description: "O seu sistema é classificado como alto risco conforme o Anexo III do EU AI Act.",
      color: "risk-high",
      icon: ShieldAlert,
      action: "São necessárias medidas extensivas de conformidade, incluindo avaliação por organismos notificados.",
      complianceScore: 30,
    },
    RISCO_LIMITADO: {
      label: "Risco Limitado",
      description: "O seu sistema tem obrigações de transparência específicas a cumprir.",
      color: "risk-limited",
      icon: Eye,
      action: "Implemente as obrigações de transparência do Artigo 52 antes de Agosto 2026.",
      complianceScore: 60,
    },
    RISCO_MINIMO: {
      label: "Risco Mínimo",
      description: "O seu sistema não está sujeito a obrigações específicas do AI Act.",
      color: "risk-minimal",
      icon: Gauge,
      action: "Recomendamos seguir as boas práticas e códigos de conduta voluntários.",
      complianceScore: 90,
    },
    FORA_DE_ESCOPO: {
      label: "Fora do Âmbito",
      description: "O seu sistema está excluído do âmbito de aplicação do EU AI Act.",
      color: "muted-foreground",
      icon: ShieldOff,
      action: "O AI Act não se aplica a sistemas para uso pessoal não profissional.",
      complianceScore: 100,
    },
  };

  const config = riskConfig[riskClassification as RiskClassification]; // Adicionado type assertion
  const Icon = config.icon;

  const triggeredQuestionsData = questionsData.filter((q: QuestionData) => q.triggersClassification);

  const requiredDocuments = [
    {
      name: "Política de Transparência",
      description: "Documento que explica como a IA é utilizada e seus impactos",
      required: ["PROIBIDO", "ALTO_RISCO", "RISCO_LIMITADO"].includes(riskClassification),
      icon: Eye,
    },
    {
      name: "Registro de Logs de Auditoria",
      description: "Sistema de rastreamento de decisões e ações do sistema",
      required: ["PROIBIDO", "ALTO_RISCO"].includes(riskClassification),
      icon: ClipboardList,
    },
    {
      name: "Documentação Técnica",
      description: "Arquitetura, dados de treino, métricas e limitações",
      required: ["PROIBIDO", "ALTO_RISCO"].includes(riskClassification),
      icon: FileText,
    },
    {
      name: "Avaliação de Impacto",
      description: "Análise de riscos e medidas de mitigação",
      required: ["PROIBIDO", "ALTO_RISCO"].includes(riskClassification),
      icon: ShieldAlert,
    },
    {
      name: "Plano de Literacia em IA",
      description: "Programa de treinamento conforme Artigo 4",
      required: true,
      icon: BookOpen,
    },
    {
      name: "Política de Supervisão Humana",
      description: "Definição de papéis e processos de supervisão",
      required: ["PROIBIDO", "ALTO_RISCO"].includes(riskClassification),
      icon: Users,
    },
  ];

  const obligations = [
    {
      title: "Literacia em IA (Artigo 4)",
      description: "Garantir que todos os operadores e utilizadores tenham conhecimento adequado sobre IA.",
      deadline: "Agosto 2025",
      priority: "Alta",
    },
    {
      title: "Transparência (Artigo 52)",
      description: "Informar utilizadores quando interagem com sistemas de IA.",
      deadline: "Agosto 2026",
      priority: riskClassification === "RISCO_MINIMO" ? "Média" : "Alta",
    },
    {
      title: "Gestão de Risco (Artigo 9)",
      description: "Implementar sistema de gestão de riscos contínuo.",
      deadline: "Agosto 2026",
      priority: ["ALTO_RISCO", "PROIBIDO"].includes(riskClassification) ? "Crítica" : "Baixa",
    },
    {
      title: "Qualidade de Dados (Artigo 10)",
      description: "Garantir qualidade e representatividade dos dados de treino.",
      deadline: "Agosto 2026",
      priority: riskClassification === "ALTO_RISCO" ? "Alta" : "Média",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container-legal max-w-4xl mx-auto">
          {/* Result Header */}
          <div className={`legal-card p-8 mb-8 border-2 border-${config.color}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-${config.color}/10 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-10 h-10 text-${config.color}`} />
              </div>
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 bg-${config.color}/10 rounded-full px-3 py-1 mb-3`}>
                  <span className={`text-sm font-semibold text-${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Resultado do Diagnóstico
                </h1>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {/* Compliance Progress */}
            <div className="mt-8 p-6 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Nível de Conformidade Estimado
                </span>
                <span className="text-lg font-bold text-foreground">
                  {config.complianceScore}%
                </span>
              </div>
              <Progress value={config.complianceScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-3">
                {config.action}
              </p>
            </div>
          </div>

          {/* Legal Justification Section */}
          <div className="legal-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Justificativa Legal
                </h2>
                <p className="text-xs text-muted-foreground">
                  Baseada no Regulamento (UE) 2024/1689
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {generateLegalJustification()}
              </p>

              {/* Triggered Questions */}
              {triggeredQuestionsData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Questões Determinantes:</h4>
                  <div className="space-y-2">
                    {triggeredQuestionsData.map((q: QuestionData) => (
                      <div key={q.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          q.riskType === "prohibited" ? "text-risk-prohibited" :
                          q.riskType === "high" ? "text-risk-high" :
                          "text-risk-limited"
                        }`} />
                        <div>
                          <p className="text-sm text-foreground">{q.question}</p>
                          <span className="text-xs text-muted-foreground">{q.legalReference}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Articles */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Artigos Relevantes:</h4>
                <div className="flex flex-wrap gap-2">
                  {getRelevantArticles().map((article, idx) => (
                    <span key={idx} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">
                      {article}
                    </span>
                  ))}
                </div>
              </div>

              {/* Priority Actions */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Ações Prioritárias:</h4>
                <ul className="space-y-2">
                  {getPriorityActions().map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Required Documents */}
            <div className="legal-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Documentos Necessários
                </h2>
              </div>

              <div className="space-y-4">
                {requiredDocuments.map((doc) => {
                  const DocIcon = doc.icon;
                  return (
                    <div
                      key={doc.name}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        doc.required ? "bg-accent/5" : "bg-muted/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${doc.required ? 'bg-accent/20' : 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
                        <DocIcon className={`w-4 h-4 ${doc.required ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${doc.required ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {doc.name}
                          </span>
                          {doc.required && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Obligations Checklist */}
            <div className="legal-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Obrigações Chave
                </h2>
              </div>

              <div className="space-y-4">
                {obligations.map((obligation) => (
                  <div
                    key={obligation.title}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-foreground text-sm">
                          {obligation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {obligation.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        obligation.priority === "Crítica"
                          ? "bg-risk-prohibited/10 text-risk-prohibited"
                          : obligation.priority === "Alta"
                          ? "bg-risk-high/10 text-risk-high"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {obligation.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Prazo: {obligation.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section - Show Compliance Pack pricing for ALTO_RISCO and RISCO_LIMITADO */}
          {(riskClassification === "ALTO_RISCO" || riskClassification === "RISCO_LIMITADO") && user && !purchaseLoading && (
            <div className="legal-card p-8 mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gold" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Dossiê de Conformidade EU AI Act
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Obtenha todos os documentos e templates necessários para estar em conformidade 
                  com o EU AI Act. Escolha o plano ideal para sua empresa.
                </p>
              </div>
              <PricingCards hasCompliancePack={hasCompliancePack} />
              <p className="text-xs text-muted-foreground text-center">
                Pagamento seguro via Stripe. Acesso imediato após confirmação.
              </p>
            </div>
          )}

          {/* General CTA Section */}
          <div className="legal-card p-8 bg-hero-gradient text-center">
            <div className="max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground mb-4">
                {user ? "Acesse seu Painel de Conformidade" : "Crie sua Conta Gratuita"}
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                {user 
                  ? "Acompanhe seu progresso, baixe documentos e gerencie sua conformidade."
                  : "Crie uma conta gratuita para salvar seus resultados e acessar recursos exclusivos."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to={user ? "/dashboard" : "/login"}>
                    {user ? "Acessar Dashboard" : "Criar Conta Gratuita"}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  variant="heroOutline" 
                  size="lg"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isGeneratingPDF ? "Gerando..." : "Baixar Relatório PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;