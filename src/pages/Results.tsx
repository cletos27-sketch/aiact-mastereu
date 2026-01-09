import { useLocation, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Lock,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react";

interface RiskScore {
  score: number;
  maxScore: number;
  percentage: number;
}

const Results = () => {
  const location = useLocation();
  const { riskScore } = (location.state as { riskScore: RiskScore }) || {};

  if (!riskScore) {
    return <Navigate to="/assessment" replace />;
  }

  const getRiskLevel = () => {
    const { percentage } = riskScore;
    if (percentage >= 75) return "prohibited";
    if (percentage >= 50) return "high";
    if (percentage >= 25) return "limited";
    return "minimal";
  };

  const riskLevel = getRiskLevel();

  const riskConfig = {
    prohibited: {
      label: "Risco Inaceitável",
      description: "Seu sistema pode estar na categoria de práticas proibidas pelo EU AI Act.",
      color: "risk-prohibited",
      icon: Ban,
      action: "Consulte imediatamente um advogado especializado.",
      complianceScore: 10,
    },
    high: {
      label: "Alto Risco",
      description: "Seu sistema requer avaliação de conformidade e documentação extensiva.",
      color: "risk-high",
      icon: ShieldAlert,
      action: "Inicie o processo de adequação o quanto antes.",
      complianceScore: 35,
    },
    limited: {
      label: "Risco Limitado",
      description: "Seu sistema tem obrigações de transparência específicas a cumprir.",
      color: "risk-limited",
      icon: Eye,
      action: "Implemente as medidas de transparência necessárias.",
      complianceScore: 60,
    },
    minimal: {
      label: "Risco Mínimo",
      description: "Seu sistema tem requisitos regulatórios mínimos, mas boas práticas são recomendadas.",
      color: "risk-minimal",
      icon: Gauge,
      action: "Mantenha documentação e siga boas práticas.",
      complianceScore: 85,
    },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const requiredDocuments = [
    {
      name: "Política de Transparência",
      description: "Documento que explica como a IA é utilizada e seus impactos",
      required: ["high", "limited", "prohibited"].includes(riskLevel),
      icon: Eye,
    },
    {
      name: "Registro de Logs de Auditoria",
      description: "Sistema de rastreamento de decisões e ações do sistema",
      required: ["high", "prohibited"].includes(riskLevel),
      icon: ClipboardList,
    },
    {
      name: "Documentação Técnica",
      description: "Arquitetura, dados de treino, métricas e limitações",
      required: ["high", "prohibited"].includes(riskLevel),
      icon: FileText,
    },
    {
      name: "Avaliação de Impacto",
      description: "Análise de riscos e medidas de mitigação",
      required: ["high", "prohibited"].includes(riskLevel),
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
      required: ["high", "prohibited"].includes(riskLevel),
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
      priority: riskLevel === "minimal" ? "Média" : "Alta",
    },
    {
      title: "Gestão de Risco (Artigo 9)",
      description: "Implementar sistema de gestão de riscos contínuo.",
      deadline: "Agosto 2026",
      priority: riskLevel === "high" || riskLevel === "prohibited" ? "Crítica" : "Baixa",
    },
    {
      title: "Qualidade de Dados (Artigo 10)",
      description: "Garantir qualidade e representatividade dos dados de treino.",
      deadline: "Agosto 2026",
      priority: riskLevel === "high" ? "Alta" : "Média",
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
