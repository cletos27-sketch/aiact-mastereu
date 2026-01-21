import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";

// 1. Função de Log Externa para evitar erros de "not found"
const logStep = (step: string, details?: any) => {
  console.log(`[ASSESSMENT] ${step}`, details || "");
};

const Assessment = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 2. Carregar questões do banco
  useEffect(() => {
    const fetchQuestions = async () => {
      try {        
          const { data, error } = await supabase
          .from ("risk_questions" as any)
          .select("*");
          .order("id");
          if (error) throw error;
        setQuestions(data || []);
      } catch (error: any) {
        toast.error("Erro ao carregar questões");
        logStep("Error fetching questions", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Categorias únicas para navegação
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const currentCategory = categories[currentCategoryIndex];
  const categoryQuestions = questions.filter((q) => q.category === currentCategory);

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = async () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    // FINALIZAÇÃO DO DIAGNÓSTICO
    try {
      setLoading(true);
      logStep("Submitting assessment...");

      const formattedAnswers = Object.entries(answers).map(([id, val]) => ({
        questionId: id,
        answer: val
      }));

      // Chama a Edge Function que já configuramos para dar os 60%
      const { data: serverResult, error: funcError } = await supabase.functions.invoke('analyze-risk', {
        body: { answers: formattedAnswers }
      });

      if (funcError) throw funcError;

      // Monta o objeto final para o Results.tsx
      const assessmentData = {
        score: serverResult?.score ?? 0,
        riskClassification: serverResult?.riskClassification ?? "RISCO_MINIMO",
        questionsData: questions.map(q => ({
          ...q,
          answer: answers[q.id] === true ? "Sim" : "Não"
        })),
        timestamp: new Date().toISOString(),
      };

      logStep("Redirecting to results", { score: assessmentData.score });
      navigate("/results", { state: assessmentData });

    } catch (error: any) {
      logStep("Submission error", error.message);
      toast.error("Erro ao processar diagnóstico.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">{currentCategory}</h1>
          <div className="w-full bg-secondary h-2 rounded-full">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentCategoryIndex + 1) / categories.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {categoryQuestions.map((q) => (
            <Card key={q.id} className="p-6 border-l-4 border-l-primary">
              <p className="text-lg mb-4 font-medium">{q.question}</p>
              <div className="flex gap-4">
                <Button
                  variant={answers[q.id] === true ? "default" : "outline"}
                  onClick={() => handleAnswer(q.id, true)}
                  className="flex-1"
                >
                  Sim
                </Button>
                <Button
                  variant={answers[q.id] === false ? "default" : "outline"}
                  onClick={() => handleAnswer(q.id, false)}
                  className="flex-1"
                >
                  Não
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
            disabled={currentCategoryIndex === 0}
          >
            <ChevronLeft className="mr-2" /> Anterior
          </Button>
          <Button onClick={handleNext} className="px-8">
            {currentCategoryIndex === categories.length - 1 ? "Finalizar" : "Próximo"} <ChevronRight className="ml-2" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;