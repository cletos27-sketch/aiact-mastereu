import { useEffect } from "react"; // Import useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth"; // Import useAuth
import { supabase } from "@/integrations/supabase/client"; // Import supabase
import { toast } from "sonner"; // Import sonner toast
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import { usePurchaseStatus } from "./hooks/usePurchaseStatus"; // Import usePurchaseStatus

const queryClient = new QueryClient();

// Define PENDING_ASSESSMENT_KEY here or import if it's in a shared constants file
const PENDING_ASSESSMENT_KEY = "pending_assessment_data";

const AppContent = () => {
  const { user } = useAuth();
  const { hasCompliancePack, loading: purchaseStatusLoading } = usePurchaseStatus(); // Use the hook

  useEffect(() => {
    // Debug log for access status
    if (!purchaseStatusLoading) {
      console.log("Status de acesso (usePurchaseStatus):", hasCompliancePack);
      if (user) {
        console.log("User ID:", user.id, "Email:", user.email);
      }
    }
  }, [user, hasCompliancePack, purchaseStatusLoading]);


  useEffect(() => {
    const sincronizarDiagnostico = async () => {
      const pendente = localStorage.getItem(PENDING_ASSESSMENT_KEY);
      if (pendente && user) {
        try {
          const assessmentData = JSON.parse(pendente);
          
          // Check if an assessment with the same timestamp already exists for this user
          // This helps prevent duplicate entries if the user logs in multiple times quickly
          const { data: existingAssessments, error: fetchError } = await supabase
            .from('risk_assessments')
            .select('id')
            .eq('user_id', user.id)
            .eq('created_at', assessmentData.timestamp) // Assuming timestamp is stored as created_at
            .limit(1);

          if (fetchError) {
            console.error("Error checking for existing assessment:", fetchError);
            return;
          }

          if (existingAssessments && existingAssessments.length > 0) {
            console.log("Pending assessment already exists in DB, removing from localStorage.");
            localStorage.removeItem(PENDING_ASSESSMENT_KEY);
            return;
          }

          // Insert the pending assessment
          const { error: insertError } = await supabase
            .from('risk_assessments') // Nome da sua tabela de diagnósticos
            .insert([{ 
              ...assessmentData, 
              user_id: user.id,
              user_email: user.email || "", // Ensure email is also saved
              risk_score: assessmentData.riskScore.score, // Extract score
              risk_classification: assessmentData.riskClassification, // Extract classification
              responses: assessmentData.questionsData, // Use questionsData as responses
              created_at: assessmentData.timestamp, // Use the timestamp from the assessment
              updated_at: new Date().toISOString(),
            }]);
          
          if (insertError) {
            console.error("Erro ao sincronizar diagnóstico:", insertError);
            toast.error("Erro ao salvar diagnóstico pendente. Tente novamente.");
          } else {
            localStorage.removeItem(PENDING_ASSESSMENT_KEY);
            toast.success("Diagnóstico anterior salvo automaticamente!");
          }
        } catch (e) {
          console.error("Erro ao processar diagnóstico pendente:", e);
          localStorage.removeItem(PENDING_ASSESSMENT_KEY); // Clear invalid data
        }
      }
    };
    sincronizarDiagnostico();
  }, [user]); // Dependência do usuário para disparar a sincronização no login

  return (
    <>
      <Toaster />
      <Sonner />
      <CookieConsent />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;