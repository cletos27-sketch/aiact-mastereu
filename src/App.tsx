import { useEffect } from "react"; // Import useEffect
import { Toaster } from "@/components/ui/toaster";
import { SonnerToaster } from "@/components/ui/sonner-shadcn"; // <--- Atualizado para o novo nome
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

const AppContent = () => {
  const { user } = useAuth();
  const { refresh: refreshPurchaseStatus } = usePurchaseStatus();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId && user) {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId },
          });

          if (error) {
            console.error("Payment verification error:", error);
            toast.error("Erro ao verificar pagamento.");
          } else if (data?.paid) {
            toast.success("Pagamento confirmado! Acesso atualizado.");
            await refreshPurchaseStatus();
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Erro ao verificar pagamento.");
        } finally {
          // Clean up the URL
          urlParams.delete('session_id');
          window.history.replaceState({}, document.title, `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
        }
      }
    };

    handlePaymentSuccess();
  }, [user, refreshPurchaseStatus]);

  return (
    <>
      <Toaster />
      <SonnerToaster /> {/* <--- Usando o componente renomeado */}
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