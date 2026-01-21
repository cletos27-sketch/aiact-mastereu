import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";

const Assessment = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { user: _user } = useAuth(); // Corrigido: _ indica que não será usado agora
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Corrigido: 'as any' resolve o erro de tipo da tabela
        const { data: qData, error } = await supabase
          .from("risk_questions" as any)
          .select("*")
          .order("id");
        if (error) throw error;
        setQuestions(qData || []);
      } catch (error: any) {
        toast.error("Erro ao carregar questões");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const currentCategory = categories[currentCategoryIndex];
  const categoryQuestions = questions.filter((q) => q.category === currentCategory);

  const handleNext = async () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    try {
      setLoading(true);
      const formattedAnswers = Object.entries(answers).map(([id, val]) => ({
        questionId: id,
        answer: val
      }));

      const { data: serverResult, error: funcError } = await supabase.functions.invoke('analyze-risk', {
        body: { answers: formattedAnswers }
      });

      if (funcError) throw funcError;

      const assessmentData = {
        score: serverResult?.score ?? 0,
        riskClassification: serverResult?.riskClassification ?? "RISCO_MINIMO",
        questionsData: questions.map(q => ({
          ...q,
          answer: answers[q.id] === true ? "Sim" : "Não"
        })),
        timestamp: new Date().toISOString(),
      };

      navigate("/results", { state: assessmentData });
    } catch (error: any) {
      toast.error("Erro ao processar diagnóstico.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">{currentCategory}</h1>
        <div className="space-y-6">
          {categoryQuestions.map((q) => (
            <Card key={q.id} className="p-6">
              <p className="text-lg mb-4">{q.question}</p>
              <div className="flex gap-4">
                <Button variant={answers[q.id] === true ? "default" : "outline"} onClick={() => setAnswers(prev => ({...prev, [q.id]: true}))} className="flex-1">Sim</Button>
                <Button variant={answers[q.id] === false ? "default" : "outline"} onClick={() => setAnswers(prev => ({...prev, [q.id]: false}))} className="flex-1">Não</Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-12 flex justify-between">
          <Button variant="ghost" onClick={() => setCurrentCategoryIndex(p => p - 1)} disabled={currentCategoryIndex === 0}><ChevronLeft /> Anterior</Button>
          <Button onClick={handleNext}>{currentCategoryIndex === categories.length - 1 ? "Finalizar" : "Próximo"} <ChevronRight /></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;