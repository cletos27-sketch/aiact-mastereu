import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
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
  Shield,
  ShieldAlert,
  ShieldOff,
  Users,
} from "lucide-react";

interface RiskScore {
  score: number;
  maxScore: number;
  percentage: number;
}

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

const Results = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { riskScore, questionsData, riskClassification, triggeredQuestions } = (location.state as { 
    riskScore: RiskScore; 
    questionsData: QuestionData[];
    riskClassification: RiskClassification;
    triggeredQuestions: number[];
  }) || {};
  
  const [isSaving, setIsSaving] = useState(false);
  const hasSaved = useRef(false);

  useEffect(() => {
    const saveAssessment = async () => {
      if (!riskScore || !questionsData || !user || hasSaved.current) return;
      
      setIsSaving(true);
      try {
        const insertData = {
          user_id: user.id,
          user_email: user.email || "",
          responses: questionsData as unknown as Record<string, unknown>,
          risk_score: riskScore.score,
          risk_classification: riskClassification,
          legal_justification: generateLegalJustification(),
          relevant_articles: getRelevantArticles(),
          priority_actions: getPriorityActions(),
        };
        
        const { error: saveError } = await supabase
          .from("risk_assessments")
          .insert(insertData as any);

        if (saveError) {
          console.error("Error saving assessment:", saveError);
          toast.error("Erro ao salvar avaliação. Verifique se está logado.");
        } else {
          hasSaved.current = true;
          toast.success("Avaliação salva com sucesso!");
        }
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Erro ao salvar avaliação.");
      } finally {
        setIsSaving(false);
      }
    };

    saveAssessment();
  }, [riskScore, questionsData, riskClassification, user]);

  const generateLegalJustification = (): string => {
    const triggeredQs = questionsData?.filter(q => q.triggersClassification) || [];
    
    if (riskClassification === "FORA_DE_ESCOPO") {
      return "Conforme Artigo 2(5)(c) do Regulamento (UE) 2024/1689, sistemas de IA desenvolvidos ou utilizados exclusivamente para fins pessoais não profissionais estão fora do âmbito de aplicação do AI Act.";
    }
    
    if (riskClassification === "PROIBIDO") {
      const articles = triggeredQs.map(q => q.legalReference).join(", ");
      return `O sistema enquadra-se nas práticas de IA proibidas definidas no Artigo 5 do AI Act. Referências específicas: ${articles}. A utilização deste sistema na sua forma atual é proibida na União Europeia.`;
    }
    
    if (riskClassification === "ALTO_RISCO") {
      const articles = triggeredQs.map(q => q.legalReference).join(", ");
      return `O sistema é classificado como de alto risco conforme o Anexo III do Regulamento (UE) 2024/1689. Referências: ${articles}. São obrigatórias medidas de conformidade extensivas incluindo avaliação de conformidade, documentação técnica, e sistema de gestão de qualidade.`;
    }
    
    if (riskClassification === "RISCO_LIMITADO") {
      return "O sistema está sujeito a obrigações de transparência específicas conforme o Artigo 52 do AI Act. Os utilizadores devem ser informados de que estão interagindo com um sistema de IA.";
    }
    
    return "O sistema apresenta risco mínimo e não está sujeito a obrigações específicas do AI Act, além das boas práticas recomendadas.";
  };

  const getRelevantArticles = (): string[] => {
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
    
    questionsData?.filter(q => q.triggersClassification).forEach(q => {
      articles.add(q.legalReference);
    });
    
    articles.add("Artigo 4 - Literacia em IA");
    
    return Array.from(articles);
  };

  const getPriorityActions = (): string[] => {
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
  };

  if (!riskScore || !questionsData || !riskClassification) {
    return <Navigate to="/assessment" replace />;
  }

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

  const config = riskConfig[riskClassification];
  const Icon = config.icon;

  const triggeredQuestionsData = questionsData.filter(q => q.triggersClassification);

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
                    {triggeredQuestionsData.map((q) => (
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

          {/* CTA Section */}
          <div className="legal-card p-8 bg-hero-gradient text-center">
            <div className="max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground mb-4">
                Garanta sua Conformidade Completa
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Obtenha todos os templates, documentação e suporte necessários para 
                estar em total conformidade com o EU AI Act antes do prazo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/#pricing">
                    Ver Planos de Conformidade
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="heroOutline" size="lg">
                  <Download className="w-5 h-5" />
                  Baixar Relatório PDF
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
