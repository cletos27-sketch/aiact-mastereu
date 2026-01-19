import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // User should have a session from the recovery link
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    // Listen for auth state changes (when user clicks recovery link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        } else if (session) {
          setIsValidSession(true);
        }
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Senha atualizada com sucesso!",
          description: "Você já pode fazer login com sua nova senha.",
        });
        
        // Sign out and redirect to login after 3 seconds
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container-legal max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center">
                <Shield className="w-7 h-7 text-gold" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isSuccess ? "Senha Atualizada!" : "Redefinir Senha"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSuccess
                ? "Sua senha foi alterada com sucesso"
                : "Crie uma nova senha segura para sua conta"}
            </p>
          </div>

          {/* Card */}
          <div className="legal-card p-8">
            {!isValidSession ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Link inválido ou expirado
                </h2>
                <p className="text-muted-foreground">
                  O link de recuperação pode ter expirado ou já foi utilizado.
                  Solicite um novo link de recuperação.
                </p>
                <div className="pt-4">
                  <Link to="/forgot-password">
                    <Button variant="gold" className="w-full">
                      Solicitar novo link
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Tudo pronto!
                </h2>
                <p className="text-muted-foreground">
                  Sua senha foi atualizada com sucesso. Você será redirecionado
                  para a página de login em instantes...
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="gold" className="w-full">
                      Ir para o login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Digite novamente"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Dicas para uma senha segura:</strong>
                    <br />• Mínimo de 8 caracteres
                    <br />• Use letras maiúsculas e minúsculas
                    <br />• Inclua números e símbolos
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Atualizando...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
