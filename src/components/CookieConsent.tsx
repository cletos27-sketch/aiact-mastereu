import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="container-legal">
        <div className="bg-primary text-primary-foreground rounded-2xl p-4 md:p-6 shadow-2xl border border-gold/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex w-12 h-12 rounded-xl bg-gold/20 items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-gold" />
              </div>
              <p className="text-sm md:text-base text-center md:text-left">
                Usamos cookies para garantir que você tenha a melhor experiência em nossa plataforma de conformidade.{" "}
                <Link 
                  to="/cookies" 
                  className="text-gold hover:text-gold/80 underline underline-offset-2 transition-colors"
                >
                  Saiba mais
                </Link>
              </p>
            </div>
            <Button
              onClick={handleAccept}
              className="bg-gold text-primary hover:bg-gold/90 font-semibold px-8 whitespace-nowrap"
            >
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
