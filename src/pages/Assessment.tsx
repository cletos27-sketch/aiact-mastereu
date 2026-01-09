import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Shield } from "lucide-react";

interface Question {
  id: number;
  question: string;
  category: string;
  helpText?: string;
  options: {
    value: string;
    label: string;
    riskWeight: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "Identificação do Sistema",
    question: "Qual é o principal objetivo do seu sistema de IA?",
    helpText: "Anexo III do EU AI Act define categorias específicas de alto risco.",
    options: [
      { value: "biometric", label: "Identificação biométrica ou categorização de pessoas", riskWeight: 4 },
      { value: "critical", label: "Gestão de infraestruturas críticas (energia, água, trânsito)", riskWeight: 4 },
      { value: "education", label: "Educação e formação profissional", riskWeight: 3 },
      { value: "employment", label: "Recrutamento, gestão de trabalhadores", riskWeight: 4 },
      { value: "services", label: "Acesso a serviços essenciais (crédito, seguros)", riskWeight: 4 },
      { value: "law", label: "Aplicação da lei ou justiça", riskWeight: 4 },
      { value: "other", label: "Outro (chatbot, recomendações, automação)", riskWeight: 1 },
    ],
  },
  {
    id: 2,
    category: "Identificação do Sistema",
    question: "O sistema processa dados biométricos para identificar ou categorizar pessoas?",
    helpText: "Dados biométricos incluem reconhecimento facial, de voz, impressões digitais, etc.",
    options: [
      { value: "realtime", label: "Sim, em tempo real em espaços públicos", riskWeight: 5 },
      { value: "remote", label: "Sim, mas não em tempo real", riskWeight: 4 },
      { value: "emotion", label: "Sim, para detecção de emoções", riskWeight: 3 },
      { value: "no", label: "Não processa dados biométricos", riskWeight: 0 },
    ],
  },
  {
    id: 3,
    category: "Identificação do Sistema",
    question: "O sistema toma decisões que afetam significativamente direitos individuais?",
    options: [
      { value: "legal", label: "Sim, afeta direitos legais (contratos, emprego)", riskWeight: 4 },
      { value: "financial", label: "Sim, afeta acesso a serviços financeiros", riskWeight: 4 },
      { value: "social", label: "Sim, afeta benefícios ou serviços sociais", riskWeight: 4 },
      { value: "limited", label: "Afeta de forma limitada ou auxiliar", riskWeight: 2 },
      { value: "no", label: "Não toma decisões deste tipo", riskWeight: 0 },
    ],
  },
  {
    id: 4,
    category: "Transparência",
    question: "Os utilizadores sabem que estão interagindo com um sistema de IA?",
    helpText: "O Artigo 52 exige transparência na interação com sistemas de IA.",
    options: [
      { value: "clear", label: "Sim, é claramente comunicado antes da interação", riskWeight: 0 },
      { value: "partial", label: "Parcialmente, a informação existe mas não é destacada", riskWeight: 2 },
      { value: "unclear", label: "Não está claro para o utilizador", riskWeight: 3 },
      { value: "hidden", label: "A natureza IA é deliberadamente oculta", riskWeight: 5 },
    ],
  },
  {
    id: 5,
    category: "Transparência",
    question: "O sistema gera conteúdo sintético (deepfakes, texto, áudio)?",
    options: [
      { value: "realistic", label: "Sim, conteúdo que pode parecer real", riskWeight: 3 },
      { value: "labeled", label: "Sim, mas sempre marcado como IA", riskWeight: 1 },
      { value: "no", label: "Não gera conteúdo sintético", riskWeight: 0 },
    ],
  },
  {
    id: 6,
    category: "Dados e Privacidade",
    question: "Que tipos de dados pessoais o sistema processa?",
    options: [
      { value: "special", label: "Dados sensíveis (saúde, etnia, religião, orientação sexual)", riskWeight: 4 },
      { value: "biometric", label: "Dados biométricos ou genéticos", riskWeight: 4 },
      { value: "personal", label: "Dados pessoais comuns (nome, email, localização)", riskWeight: 2 },
      { value: "anonymized", label: "Apenas dados anonimizados ou agregados", riskWeight: 0 },
      { value: "none", label: "Não processa dados pessoais", riskWeight: 0 },
    ],
  },
  {
    id: 7,
    category: "Dados e Privacidade",
    question: "Como os dados de treino do sistema foram obtidos?",
    options: [
      { value: "consent", label: "Com consentimento explícito dos titulares", riskWeight: 0 },
      { value: "public", label: "De fontes públicas ou abertas", riskWeight: 1 },
      { value: "purchased", label: "Adquiridos de terceiros", riskWeight: 2 },
      { value: "scraped", label: "Coletados automaticamente (web scraping)", riskWeight: 3 },
      { value: "unknown", label: "Origem desconhecida ou não documentada", riskWeight: 4 },
    ],
  },
  {
    id: 8,
    category: "Governança",
    question: "Existe supervisão humana nas decisões do sistema?",
    helpText: "O EU AI Act exige supervisão humana para sistemas de alto risco.",
    options: [
      { value: "full", label: "Sim, humanos validam todas as decisões críticas", riskWeight: 0 },
      { value: "partial", label: "Sim, mas apenas para algumas decisões", riskWeight: 2 },
      { value: "review", label: "Apenas revisão posterior, não prévia", riskWeight: 3 },
      { value: "none", label: "O sistema opera de forma totalmente autônoma", riskWeight: 4 },
    ],
  },
  {
    id: 9,
    category: "Governança",
    question: "Existem registros (logs) das decisões tomadas pelo sistema?",
    helpText: "Logs de auditoria são obrigatórios para sistemas de alto risco.",
    options: [
      { value: "complete", label: "Sim, logs completos e imutáveis", riskWeight: 0 },
      { value: "partial", label: "Sim, mas logs parciais ou modificáveis", riskWeight: 2 },
      { value: "limited", label: "Apenas logs básicos de funcionamento", riskWeight: 3 },
      { value: "none", label: "Não existe sistema de logging", riskWeight: 4 },
    ],
  },
  {
    id: 10,
    category: "Governança",
    question: "A sua equipa recebeu formação sobre o EU AI Act e literacia em IA?",
    helpText: "O Artigo 4 exige que operadores garantam literacia adequada em IA.",
    options: [
      { value: "comprehensive", label: "Sim, formação completa e documentada", riskWeight: 0 },
      { value: "basic", label: "Formação básica ou informal", riskWeight: 2 },
      { value: "planned", label: "Planeada mas não realizada", riskWeight: 3 },
      { value: "none", label: "Sem formação em literacia de IA", riskWeight: 4 },
    ],
  },
  {
    id: 11,
    category: "Técnico",
    question: "O sistema foi testado para vieses ou discriminação?",
    options: [
      { value: "audited", label: "Sim, auditoria independente realizada", riskWeight: 0 },
      { value: "internal", label: "Sim, testes internos documentados", riskWeight: 1 },
      { value: "informal", label: "Apenas testes informais", riskWeight: 3 },
      { value: "none", label: "Não foi testado para vieses", riskWeight: 4 },
    ],
  },
  {
    id: 12,
    category: "Técnico",
    question: "Existe documentação técnica completa do sistema?",
    helpText: "Inclui arquitetura, dados de treino, métricas de desempenho e limitações.",
    options: [
      { value: "complete", label: "Sim, documentação completa e atualizada", riskWeight: 0 },
      { value: "partial", label: "Documentação parcial", riskWeight: 2 },
      { value: "minimal", label: "Apenas documentação básica", riskWeight: 3 },
      { value: "none", label: "Sem documentação técnica", riskWeight: 4 },
    ],
  },
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHelp, setShowHelp] = useState<number | null>(null);

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate risk and navigate to results
      const riskScore = calculateRiskScore();
      navigate("/results", { state: { answers, riskScore } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateRiskScore = () => {
    let totalWeight = 0;
    let maxPossibleWeight = 0;

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.value === answer);
        if (option) {
          totalWeight += option.riskWeight;
        }
      }
      // Calculate max possible weight for this question
      const maxOption = q.options.reduce((max, o) => (o.riskWeight > max ? o.riskWeight : max), 0);
      maxPossibleWeight += maxOption;
    });

    return {
      score: totalWeight,
      maxScore: maxPossibleWeight,
      percentage: Math.round((totalWeight / maxPossibleWeight) * 100),
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container-legal max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-hero-gradient flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">
                    Diagnóstico de Risco
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Questão {currentStep + 1} de {questions.length}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="legal-card p-8 mb-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-3 py-1 mb-6">
              <span className="text-xs font-medium text-accent">{currentQuestion.category}</span>
            </div>

            {/* Question */}
            <div className="flex items-start gap-3 mb-6">
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
                {currentQuestion.question}
              </h2>
              {currentQuestion.helpText && (
                <button
                  onClick={() => setShowHelp(showHelp === currentQuestion.id ? null : currentQuestion.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Help Text */}
            {showHelp === currentQuestion.id && currentQuestion.helpText && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">{currentQuestion.helpText}</p>
              </div>
            )}

            {/* Options */}
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                    answers[currentQuestion.id] === option.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex items-center gap-3 cursor-pointer w-full"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        answers[currentQuestion.id] === option.value
                          ? "border-accent bg-accent"
                          : "border-muted-foreground"
                      }`}
                    >
                      {answers[currentQuestion.id] === option.value && (
                        <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                      )}
                    </div>
                    <span className="text-sm md:text-base text-foreground">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant={currentStep === questions.length - 1 ? "gold" : "default"}
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentStep === questions.length - 1 ? "Ver Resultado" : "Próxima"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
