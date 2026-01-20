import { Toaster } from "@/components/ui/toaster";
import { SonnerToaster } from "@/components/ui/sonner-shadcn";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth"; // 'useAuth' removido
// import { supabase } from "@/integrations/supabase/client"; // Removido: não utilizado
// import { toast } from "sonner"; // Removido: não utilizado
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
// import { usePurchaseStatus } from "./hooks/usePurchaseStatus"; // Removido: não utilizado


const queryClient = new QueryClient();

const AppContent = () => {
  // const { user } = useAuth(); // Removido: não utilizado
  // const { refresh: refreshPurchaseStatus } = usePurchaseStatus(); // Removido: não utilizado

  // useEffect removido pois não é mais necessário aqui após a refatoração
  // do handlePaymentSuccess para ser chamado diretamente no Dashboard.tsx
  // e a lógica de redirecionamento do Assessment.tsx.

  return (
    <>
      <Toaster />
      <SonnerToaster />
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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;