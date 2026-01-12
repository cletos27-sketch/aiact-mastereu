import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, CreditCard, Loader2, RefreshCw } from "lucide-react";

interface PricingCardsProps {
  hasCompliancePack: boolean;
}

// TEST Mode Price IDs
const PRICING_OPTIONS = [
  {
    id: "one-time",
    name: "Pacote Único",
    price: "499€",
    priceId: "price_1Snqs8IV86RXPoUIDO9x8pWp",
    description: "pagamento único",
    features: [
      "Todos os templates de conformidade",
      "Documentação técnica completa",
      "Guia de Literacia em IA (Art. 4)",
      "Política de Transparência",
      "Avaliação de Impacto",
      "Acesso vitalício aos documentos",
    ],
    popular: false,
  },
  {
    id: "subscription",
    name: "Monitoramento Mensal",
    price: "99€",
    priceId: "price_1Snqs8IV86RXPoUIUHrXN5fI",
    description: "/mês",
    features: [
      "Tudo do Pacote Único",
      "Atualizações regulatórias mensais",
      "Alertas de prazos importantes",
      "Suporte prioritário",
      "Templates atualizados automaticamente",
      "Cancele quando quiser",
    ],
    popular: true,
  },
];

const PricingCards = ({ hasCompliancePack }: PricingCardsProps) => {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
      });
      if (error) throw error;
      if (data?.url) {
        // Use window.location.href to avoid popup blockers
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  if (hasCompliancePack) {
    return (
      <div className="legal-card p-6 mb-8 bg-gradient-to-r from-green-500/10 to-accent/10 border-green-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Dossiê de Conformidade Ativo</h3>
            <p className="text-sm text-muted-foreground">
              Você tem acesso completo a todos os documentos e templates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {PRICING_OPTIONS.map((option) => (
        <div
          key={option.id}
          className={`legal-card p-6 relative ${
            option.popular
              ? "border-gold/50 bg-gradient-to-b from-gold/5 to-transparent"
              : ""
          }`}
        >
          {option.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gold text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Recomendado
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {option.name}
            </h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gold">{option.price}</span>
              <span className="text-sm text-muted-foreground">{option.description}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {option.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant={option.popular ? "gold" : "outline"}
            className="w-full"
            onClick={() => handleCheckout(option.priceId)}
            disabled={loadingPriceId !== null}
          >
            {loadingPriceId === option.priceId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : option.id === "subscription" ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {loadingPriceId === option.priceId
              ? "Processando..."
              : option.id === "subscription"
              ? "Assinar Agora"
              : "Comprar Agora"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;
