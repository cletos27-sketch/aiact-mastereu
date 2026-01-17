import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight, Download } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refresh: refreshPurchase } = usePurchaseStatus();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/login");
        return;
      }

      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setStatus("error");
        setMessage("Sessão de pagamento não encontrada.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.paid) {
          setStatus("success");
          setMessage("Seu pagamento foi processado com sucesso! O Dossiê de Conformidade está agora disponível no seu Dashboard.");
          // Refresh purchase status so dashboard shows updated state
          await refreshPurchase();
        } else {
          setStatus("error");
          setMessage("O pagamento ainda não foi confirmado. Por favor, aguarde alguns momentos ou entre em contato conosco.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage("Ocorreu um erro ao verificar o pagamento. Por favor, entre em contato conosco.");
      }
    };

    verifyPayment();
  }, [searchParams, user, authLoading, navigate, refreshPurchase]);

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16 px-4">
          <div className="container-legal text-center">
            <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Verificando pagamento...
            </h1>
            <p className="text-muted-foreground">
              Aguarde enquanto confirmamos seu pagamento.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-16 px-4">
        <div className="container-legal max-w-2xl mx-auto text-center">
          {status === "success" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Pagamento Confirmado!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {message}
              </p>
              <div className="legal-card p-6 mb-8 text-left">
                <h2 className="font-semibold text-lg mb-4 text-foreground">O que você ganhou acesso:</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Dossiê Técnico Simplificado (Anexo IV)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Política de Transparência para Utilizadores</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Guia de Literacia em IA (Artigo 4)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Registro de Logs de Auditoria</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Avaliação de Impacto em Direitos Fundamentais</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Política de Supervisão Humana</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="gold">
                  <Link to="/dashboard">
                    <Download className="w-4 h-4 mr-2" />
                    Acessar Documentos
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Ops, algo deu errado
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {message}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/results">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
