import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_ASSESSMENT_KEY = "pending_assessment_data";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to save pending assessment to database
  const savePendingAssessment = useCallback(async (userId: string, userEmail: string) => {
    const pendingData = localStorage.getItem(PENDING_ASSESSMENT_KEY);
    if (!pendingData) return;

    try {
      const assessmentData = JSON.parse(pendingData);
      
      // Generate justification and articles based on classification
      const generateLegalJustification = (classification: string, questionsData: any[]): string => {
        const triggeredQs = questionsData?.filter(q => q.triggersClassification) || [];
        
        if (classification === "FORA_DE_ESCOPO") {
          return "Conforme Artigo 2(5)(c) do Regulamento (UE) 2024/1689, sistemas de IA desenvolvidos ou utilizados exclusivamente para fins pessoais não profissionais estão fora do âmbito de aplicação do AI Act.";
        }
        
        if (classification === "PROIBIDO") {
          const articles = triggeredQs.map(q => q.legalReference).join(", ");
          return `O sistema enquadra-se nas práticas de IA proibidas definidas no Artigo 5 do AI Act. Referências específicas: ${articles}. A utilização deste sistema na sua forma atual é proibida na União Europeia.`;
        }
        
        if (classification === "ALTO_RISCO") {
          const articles = triggeredQs.map(q => q.legalReference).join(", ");
          return `O sistema é classificado como de alto risco conforme o Anexo III do Regulamento (UE) 2024/1689. Referências: ${articles}. São obrigatórias medidas de conformidade extensivas incluindo avaliação de conformidade, documentação técnica, e sistema de gestão de qualidade.`;
        }
        
        if (classification === "RISCO_LIMITADO") {
          return "O sistema está sujeito a obrigações de transparência específicas conforme o Artigo 52 do AI Act. Os utilizadores devem ser informados de que estão interagindo com um sistema de IA.";
        }
        
        return "O sistema apresenta risco mínimo e não está sujeito a obrigações específicas do AI Act, além das boas práticas recomendadas.";
      };

      const getRelevantArticles = (classification: string, questionsData: any[]): string[] => {
        const articles = new Set<string>();
        
        if (classification === "PROIBIDO") {
          articles.add("Artigo 5 - Práticas Proibidas");
        }
        if (classification === "ALTO_RISCO") {
          articles.add("Artigo 6 - Sistemas de Alto Risco");
          articles.add("Anexo III - Lista de Áreas de Alto Risco");
          articles.add("Artigo 9 - Gestão de Riscos");
          articles.add("Artigo 10 - Dados e Governança de Dados");
        }
        if (classification === "RISCO_LIMITADO") {
          articles.add("Artigo 52 - Obrigações de Transparência");
        }
        
        questionsData?.filter(q => q.triggersClassification).forEach(q => {
          articles.add(q.legalReference);
        });
        
        articles.add("Artigo 4 - Literacia em IA");
        
        return Array.from(articles);
      };

      const getPriorityActions = (classification: string): string[] => {
        const actions: string[] = [];
        
        if (classification === "PROIBIDO") {
          actions.push("Suspender imediatamente a utilização do sistema");
          actions.push("Consultar advogado especializado em AI Act");
          actions.push("Avaliar alternativas que cumpram a regulamentação");
          actions.push("Documentar a decisão e comunicar às partes interessadas");
        } else if (classification === "ALTO_RISCO") {
          actions.push("Implementar sistema de gestão de qualidade");
          actions.push("Preparar documentação técnica completa");
          actions.push("Realizar avaliação de conformidade");
          actions.push("Estabelecer processos de supervisão humana");
          actions.push("Implementar sistema de logging e auditoria");
        } else if (classification === "RISCO_LIMITADO") {
          actions.push("Implementar avisos de transparência claros");
          actions.push("Informar utilizadores sobre natureza IA do sistema");
          actions.push("Documentar medidas de transparência adoptadas");
        } else if (classification === "FORA_DE_ESCOPO") {
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

      const insertData = {
        user_id: userId,
        user_email: userEmail,
        responses: assessmentData.questionsData as unknown as Record<string, unknown>,
        risk_score: assessmentData.riskScore.score,
        risk_classification: assessmentData.riskClassification,
        legal_justification: generateLegalJustification(assessmentData.riskClassification, assessmentData.questionsData),
        relevant_articles: getRelevantArticles(assessmentData.riskClassification, assessmentData.questionsData),
        priority_actions: getPriorityActions(assessmentData.riskClassification),
      };
      
      const { error: saveError } = await supabase
        .from("risk_assessments")
        .insert(insertData as any);

      if (saveError) {
        console.error("Error saving pending assessment:", saveError);
        sonnerToast.error("Erro ao salvar avaliação pendente. Erro: " + saveError.message);
      } else {
        // Clear the pending data after successful save
        localStorage.removeItem(PENDING_ASSESSMENT_KEY);
        sonnerToast.success("Diagnóstico anterior salvo automaticamente!");
      }
    } catch (error) {
      console.error("Error parsing pending assessment:", error);
    }
  }, []);

  // Function to ensure profile exists
  const ensureProfileExists = useCallback(async (userId: string, userEmail: string, fullName?: string) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking profile:", fetchError);
        return;
      }

      // If profile doesn't exist, create it (backup for trigger)
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            email: userEmail,
            full_name: fullName || "",
            is_paid: false,
          });

        if (insertError && !insertError.message.includes("duplicate")) {
          console.error("Error creating profile:", insertError);
        }
      }
    } catch (error) {
      console.error("Error ensuring profile:", error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // On sign in, check for pending assessment and ensure profile
        if (event === "SIGNED_IN" && session?.user) {
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(async () => {
            await ensureProfileExists(
              session.user.id, 
              session.user.email || "",
              session.user.user_metadata?.full_name
            );
            await savePendingAssessment(session.user.id, session.user.email || "");
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Also check on initial load
      if (session?.user) {
        await ensureProfileExists(
          session.user.id, 
          session.user.email || "",
          session.user.user_metadata?.full_name
        );
        await savePendingAssessment(session.user.id, session.user.email || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [ensureProfileExists, savePendingAssessment]);

  // Placeholder for HaveIBeenPwned check
  const checkPasswordForPwned = async (password: string): Promise<boolean> => {
    // This is a client-side placeholder.
    // For production, implement this via a Supabase Edge Function or a secure backend.
    // Example using k-anonymity (requires SHA1 hashing on client, then API call):
    // const sha1Hash = await hashPasswordSHA1(password); // You'd need to implement this
    // const prefix = sha1Hash.substring(0, 5);
    // const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    // const text = await response.text();
    // return text.includes(sha1Hash.substring(5));
    
    // For now, we'll simulate a check or always pass.
    // In a real scenario, this would be an async call to your Edge Function.
    console.log("Checking password against HaveIBeenPwned (simulated)...");
    // Simulate a pwned password for demonstration
    if (password === "password123") { // Example of a weak/pwned password
      return true; 
    }
    return false;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // === HaveIBeenPwned Check ===
      const isPwned = await checkPasswordForPwned(password);
      if (isPwned) {
        toast({
          title: "Senha comprometida",
          description: "Esta senha foi encontrada em vazamentos de dados. Por favor, escolha uma senha mais segura.",
          variant: "destructive",
        });
        return { error: new Error("Pwned password") };
      }
      // === End HaveIBeenPwned Check ===

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Email já registrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode acessar sua conta.",
      });

      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro inesperado",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // === HaveIBeenPwned Check ===
      const isPwned = await checkPasswordForPwned(password);
      if (isPwned) {
        toast({
          title: "Senha comprometida",
          description: "Esta senha foi encontrada em vazamentos de dados. Por favor, escolha uma senha mais segura.",
          variant: "destructive",
        });
        return { error: new Error("Pwned password") };
      }
      // === End HaveIBeenPwned Check ===

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      });

      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro inesperado",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};