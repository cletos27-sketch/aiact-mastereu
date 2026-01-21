import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { session } = useAuth(); // Obter a sessão do usuário
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showHelp, setShowHelp] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // New function to handle finalization of the diagnostic
  const aoFinalizarDiagnostico = useCallback((dados: any) => {
    // 1. Salva no "bolso" do navegador (localStorage)
    localStorage.setItem(PENDING_ASSESSMENT_KEY, JSON.stringify(dados));
    
    // 2. Redireciona
    if (session?.user) { // Se o usuário estiver logado, redireciona para o dashboard
      navigate('/dashboard');
    } else { // Caso contrário, redireciona para a página de resultados
      navigate('/results'); 
    }
  }, [navigate, session?.user]); // Adicionar session?.user às dependências

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final question, submit to Supabase Edge Function
      setIsSubmitting(true);
      try {
        const formattedResponses = Object.keys(answers).reduce((acc, key) => {
          acc[`q${key}`] = answers[parseInt(key)] ? "yes" : "no";
          return acc;
        }, {} as Record<string, string>);

        const token = session?.access_token;
        // If user is not logged in, we still want to proceed to results,
        // but the assessment won't be saved to DB until they log in.
        // The PENDING_ASSESSMENT_KEY will ensure data is available.

        let serverResult: any;
        if (token) {
          const { data, error } = await supabase.functions.invoke('analyze-risk', {
            body: JSON.stringify({ responses: formattedResponses, questions: questions }), // <--- Adicionado o array de questions aqui
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (error) {
            console.error("Error invoking analyze-risk function:", error);
            toast.error(`Erro ao analisar risco: ${error.message}`);
            // Proceed with a default or client-side calculation if server fails
            // For now, we'll just return to avoid blank page, but ideally
            // a fallback risk calculation would be here.
            setIsSubmitting(false);
            return; 
          }
          serverResult = data;
        } else {
          // Fallback for unauthenticated users: client-side risk calculation
          // This is a simplified version for demonstration.
          // In a real app, you'd replicate the server-side logic here or
          // ensure login is mandatory before final submission.
          const prohibitedTriggered = questions.some(q => q.riskType === "prohibited" && answers[q.id]);
          const highRiskTriggered = questions.some(q => q.riskType === "high" && answers[q.id]);
          const limitedRiskTriggered = questions.some(q => q.riskType === "limited" && answers[q.id]);
          const outOfScopeTriggered = questions.some(q => q.riskType === "out_of_scope" && answers[q.id]);

          let riskClassification: RiskClassification = "RISCO_MINIMO";
          if (outOfScopeTriggered) riskClassification = "FORA_DE_ESCOPO";
          else if (prohibitedTriggered) riskClassification = "PROIBIDO";
          else if (highRiskTriggered) riskClassification = "ALTO_RISCO";
          else if (limitedRiskTriggered) riskClassification = "RISCO_LIMITADO";

          const triggeredQuestions = questions.filter(q => answers[q.id] && (q.riskType === "prohibited" || q.riskType === "high" || q.riskType === "limited"));
          
          serverResult = {
            riskScore: { score: 0, maxScore: 0, percentage: 0 }, // Placeholder
            riskClassification: riskClassification,
            triggeredQuestions: triggeredQuestions.map(q => ({ question: `q${q.id}`, riskType: q.riskType })),
          };
        }
       
      const questionsDataForDisplay = (questions || []).map((q) => {
      const answered = answers[q.id];
      
      // Proteção contra o erro 'some'
      const isTriggered = Array.isArray(serverResult?.triggeredQuestions) 
        ? serverResult.triggeredQuestions.some((tq: any) => String(tq.id || tq.question_id) === String(q.id))
        : false;

      return {
        id: q.id,
        question: q.question,
        category: q.category,
        riskType: q.riskType,
        legalReference: q.legalReference,
        answer: answered === true ? "Sim" : answered === false ? "Não" : "Não respondida",
        triggersClassification: isTriggered
      };
    }); 
    
    // <--- Verifique se este parêntese e ponto-e-vírgula estão aqui

    // 2. Montar o objeto de dados final
    const assessmentData = {
      answers,
      riskScore: typeof serverResult?.score === 'number' ? serverResult.score : 0,
      questionsData: questionsDataForDisplay,
      riskClassification: serverResult?.riskClassification || "RISCO_MINIMO",
      timestamp: new Date().toISOString(),
    };

    // 2. Montar o objeto de dados final para a página de Resultados
    const assessmentData = {
      answers,
      riskScore: typeof serverResult?.score === 'number' ? serverResult.score : 0,
      questionsData: questionsDataForDisplay,
      riskClassification: serverResult?.riskClassification || "RISCO_MINIMO",
      timestamp: new Date().toISOString(),
    };
        
        // Clear session storage progress since assessment is complete
        sessionStorage.removeItem("assessment_progress");

        // Use the new function to finalize the diagnostic
        aoFinalizarDiagnostico(assessmentData);

      } catch (error: any) {
        console.error("Unexpected error during assessment submission:", error);
        toast.error(`Erro inesperado: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
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
              disabled={currentStep === 0 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant={currentStep === questions.length - 1 ? "gold" : "default"}
              onClick={handleNext}
              disabled={!hasAnswered || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              {currentStep === questions.length - 1 ? (isSubmitting ? "Analisando..." : "Ver Resultado") : "Próxima"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;