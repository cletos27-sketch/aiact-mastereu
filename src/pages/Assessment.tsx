import { useState, useEffect } from "react";
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
  riskType: "prohibited" | "high" | "limited" | "out_of_scope";
  helpText?: string;
  legalReference: string;
}

const questions: Question[] = [
  {
    id: 1,
    category: "Práticas Proibidas",
    question: "O sistema usa técnicas subliminares para manipular o comportamento?",
    riskType: "prohibited",
    helpText: "Sistemas que utilizam técnicas subliminares além da consciência de uma pessoa para distorcer substancialmente o seu comportamento são proibidos pelo AI Act.",
    legalReference: "Artigo 5(1)(a)"
  },
  {
    id: 2,
    category: "Práticas Proibidas",
    question: "O sistema explora vulnerabilidades de grupos específicos (idade, deficiência)?",
    riskType: "prohibited",
    helpText: "É proibido explorar vulnerabilidades de um grupo específico de pessoas devido à sua idade, deficiência física ou mental.",
    legalReference: "Artigo 5(1)(b)"
  },
  {
    id: 3,
    category: "Práticas Proibidas",
    question: "O sistema faz 'Social Scoring' (pontuação social)?",
    riskType: "prohibited",
    helpText: "Sistemas de pontuação social por autoridades públicas que avaliam ou classificam pessoas com base no seu comportamento social são proibidos.",
    legalReference: "Artigo 5(1)(c)"
  },
  {
    id: 4,
    category: "Práticas Proibidas",
    question: "O sistema é usado para identificação biométrica em tempo real em espaços públicos?",
    riskType: "prohibited",
    helpText: "A identificação biométrica remota em tempo real em espaços acessíveis ao público para fins de aplicação da lei é proibida, salvo exceções específicas.",
    legalReference: "Artigo 5(1)(d)"
  },
  {
    id: 5,
    category: "Alto Risco",
    question: "A IA é usada em infraestruturas críticas (energia, água, transporte)?",
    riskType: "high",
    helpText: "Sistemas de IA utilizados como componentes de segurança na gestão e operação de infraestruturas críticas são de alto risco.",
    legalReference: "Anexo III, ponto 2"
  },
  {
    id: 6,
    category: "Alto Risco",
    question: "A IA é usada para avaliação/admissão em educação ou formação profissional?",
    riskType: "high",
    helpText: "Sistemas que determinam o acesso, admissão ou atribuição de pessoas a instituições de educação e formação profissional são de alto risco.",
    legalReference: "Anexo III, ponto 3"
  },
  {
    id: 7,
    category: "Alto Risco",
    question: "A IA é usada para recrutamento ou gestão de trabalhadores (RH)?",
    riskType: "high",
    helpText: "Sistemas usados para recrutamento, seleção, tomada de decisões sobre promoção e cessação de relações de trabalho são de alto risco.",
    legalReference: "Anexo III, ponto 4"
  },
  {
    id: 8,
    category: "Alto Risco",
    question: "A IA avalia a elegibilidade para serviços públicos essenciais?",
    riskType: "high",
    helpText: "Sistemas que avaliam a elegibilidade de pessoas para benefícios e serviços de assistência pública são de alto risco.",
    legalReference: "Anexo III, ponto 5(a)"
  },
  {
    id: 9,
    category: "Alto Risco",
    question: "A IA é usada para avaliação de crédito (Credit Scoring)?",
    riskType: "high",
    helpText: "Sistemas utilizados para avaliar a classificação de crédito ou a solvabilidade de pessoas singulares são de alto risco.",
    legalReference: "Anexo III, ponto 5(b)"
  },
  {
    id: 10,
    category: "Alto Risco",
    question: "A IA é usada por autoridades policiais ou migratórias?",
    riskType: "high",
    helpText: "Sistemas de IA utilizados por autoridades responsáveis pela aplicação da lei ou gestão de migração e controlo de fronteiras são de alto risco.",
    legalReference: "Anexo III, pontos 6 e 7"
  },
  {
    id: 11,
    category: "Risco Limitado",
    question: "O sistema interage diretamente com pessoas (Chatbots)?",
    riskType: "limited",
    helpText: "Sistemas de IA destinados a interagir diretamente com pessoas naturais estão sujeitos a obrigações de transparência.",
    legalReference: "Artigo 52(1)"
  },
  {
    id: 12,
    category: "Risco Limitado",
    question: "O sistema gera ou manipula conteúdo de imagem, áudio ou vídeo (Deepfakes)?",
    riskType: "limited",
    helpText: "Sistemas que geram ou manipulam conteúdo sintético devem divulgar que o conteúdo foi gerado ou manipulado artificialmente.",
    legalReference: "Artigo 52(3)"
  },
  {
    id: 13,
    category: "Práticas Proibidas",
    question: "O sistema faz categorização de emoções em ambientes de trabalho?",
    riskType: "prohibited",
    helpText: "A categorização biométrica para inferir emoções de trabalhadores ou estudantes é proibida, salvo razões médicas ou de segurança.",
    legalReference: "Artigo 5(1)(f)"
  },
  {
    id: 14,
    category: "Risco Limitado",
    question: "O sistema gera textos para informar o público sobre assuntos de interesse geral?",
    riskType: "limited",
    helpText: "Textos publicados com o objetivo de informar o público sobre questões de interesse público devem divulgar a sua natureza artificial.",
    legalReference: "Artigo 52(3)"
  },
  {
    id: 15,
    category: "Âmbito de Aplicação",
    question: "O sistema é apenas para uso pessoal não profissional?",
    riskType: "out_of_scope",
    helpText: "O AI Act não se aplica a sistemas de IA desenvolvidos ou utilizados exclusivamente para fins pessoais não profissionais.",
    legalReference: "Artigo 2(5)(c)"
  },
];

type RiskClassification = "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO";

const PENDING_ASSESSMENT_KEY = "pending_assessment_data";

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showHelp, setShowHelp] = useState<number | null>(null);

  // Restore answers from localStorage if user refreshed or came back
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem("assessment_progress");
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setAnswers(parsed.answers || {});
        setCurrentStep(parsed.currentStep || 0);
      } catch (e) {
        console.error("Error restoring assessment progress:", e);
      }
    }
  }, []);

  // Save progress to sessionStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      sessionStorage.setItem("assessment_progress", JSON.stringify({
        answers,
        currentStep
      }));
    }
  }, [answers, currentStep]);

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value === "yes" });
  };

  const calculateRiskClassification = (): { classification: RiskClassification; score: number; triggeredQuestions: number[] } => {
    const prohibitedQuestions = [1, 2, 3, 4, 13];
    const highRiskQuestions = [5, 6, 7, 8, 9, 10];
    const limitedRiskQuestions = [11, 12, 14];
    const outOfScopeQuestion = 15;

    const triggeredQuestions: number[] = [];

    // Check if out of scope first
    if (answers[outOfScopeQuestion] === true) {
      triggeredQuestions.push(outOfScopeQuestion);
      return { classification: "FORA_DE_ESCOPO", score: 0, triggeredQuestions };
    }

    // Check prohibited practices (highest priority)
    for (const qId of prohibitedQuestions) {
      if (answers[qId] === true) {
        triggeredQuestions.push(qId);
      }
    }
    if (triggeredQuestions.length > 0) {
      return { classification: "PROIBIDO", score: 100, triggeredQuestions };
    }

    // Check high risk
    for (const qId of highRiskQuestions) {
      if (answers[qId] === true) {
        triggeredQuestions.push(qId);
      }
    }
    if (triggeredQuestions.length > 0) {
      return { classification: "ALTO_RISCO", score: 75, triggeredQuestions };
    }

    // Check limited risk
    for (const qId of limitedRiskQuestions) {
      if (answers[qId] === true) {
        triggeredQuestions.push(qId);
      }
    }
    if (triggeredQuestions.length > 0) {
      return { classification: "RISCO_LIMITADO", score: 40, triggeredQuestions };
    }

    // All answers are "No" -> Minimal risk
    return { classification: "RISCO_MINIMO", score: 10, triggeredQuestions: [] };
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const result = calculateRiskClassification();
      
      const questionsData = questions.map((q) => {
        const answered = answers[q.id];
        return {
          id: q.id,
          question: q.question,
          category: q.category,
          riskType: q.riskType,
          legalReference: q.legalReference,
          answer: answered === true ? "Sim" : answered === false ? "Não" : "Não respondida",
          triggersClassification: result.triggeredQuestions.includes(q.id),
        };
      });

      const riskScore = {
        score: result.score,
        maxScore: 100,
        percentage: result.score,
      };

      // Save assessment data to localStorage for users not logged in
      // This will be persisted to DB when they login/signup
      const assessmentData = {
        answers, 
        riskScore, 
        questionsData,
        riskClassification: result.classification,
        triggeredQuestions: result.triggeredQuestions,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem(PENDING_ASSESSMENT_KEY, JSON.stringify(assessmentData));
      
      // Clear session storage progress since assessment is complete
      sessionStorage.removeItem("assessment_progress");

      navigate("/results", { 
        state: assessmentData
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentAnswer = answers[currentQuestion.id];
  const hasAnswered = currentAnswer !== undefined;

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
                    Diagnóstico EU AI Act
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
            <div className="flex items-center gap-2 mb-6">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                currentQuestion.riskType === "prohibited" 
                  ? "bg-destructive/10 text-destructive" 
                  : currentQuestion.riskType === "high"
                  ? "bg-orange-500/10 text-orange-600"
                  : currentQuestion.riskType === "limited"
                  ? "bg-yellow-500/10 text-yellow-600"
                  : "bg-muted text-muted-foreground"
              }`}>
                <span className="text-xs font-medium">{currentQuestion.category}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {currentQuestion.legalReference}
              </span>
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

            {/* Yes/No Options */}
            <RadioGroup
              value={currentAnswer === true ? "yes" : currentAnswer === false ? "no" : ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <div
                className={`relative flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                  currentAnswer === true
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="yes" id="yes" className="sr-only" />
                <Label htmlFor="yes" className="flex items-center gap-3 cursor-pointer w-full">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      currentAnswer === true
                        ? "border-accent bg-accent"
                        : "border-muted-foreground"
                    }`}
                  >
                    {currentAnswer === true && (
                      <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                    )}
                  </div>
                  <span className="text-sm md:text-base text-foreground font-medium">Sim</span>
                </Label>
              </div>

              <div
                className={`relative flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                  currentAnswer === false
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="no" id="no" className="sr-only" />
                <Label htmlFor="no" className="flex items-center gap-3 cursor-pointer w-full">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      currentAnswer === false
                        ? "border-accent bg-accent"
                        : "border-muted-foreground"
                    }`}
                  >
                    {currentAnswer === false && (
                      <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                    )}
                  </div>
                  <span className="text-sm md:text-base text-foreground font-medium">Não</span>
                </Label>
              </div>
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
              disabled={!hasAnswered}
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