import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Price IDs for TEST MODE - must match create-checkout
const PRICE_IDS = {
  oneTime: "price_1Snqs8IV86RXPoUIDO9x8pWp",
  subscription: "price_1Snqs8IV86RXPoUIUHrXN5fI",
};

const plans = [
  {
    name: "Pacote Único",
    subtitle: "Conformidade Completa",
    price: "499",
    period: "único",
    description: "Tudo que você precisa para estar em conformidade com o EU AI Act",
    features: [
      "Diagnóstico completo de risco",
      "Classificação oficial do sistema",
      "Templates de documentação",
      "Política de Transparência",
      "Registro de Logs de Auditoria",
      "Guia de Literacia em IA (Art. 4)",
      "Suporte por email (30 dias)",
      "Certificado de Conformidade",
    ],
    popular: false,
    icon: Zap,
    cta: "Começar Agora",
    priceId: PRICE_IDS.oneTime,
  },
  {
    name: "Monitoramento",
    subtitle: "Conformidade Contínua",
    price: "99",
    period: "/mês",
    description: "Mantenha-se atualizado com as mudanças regulatórias",
    features: [
      "Tudo do Pacote Único",
      "Monitoramento contínuo",
      "Alertas de mudanças regulatórias",
      "Atualizações de templates",
      "Dashboard de conformidade",
      "Relatórios mensais",
      "Suporte prioritário",
      "Consultoria trimestral (1h)",
    ],
    popular: true,
    icon: Crown,
    cta: "Assinar Plano",
    priceId: PRICE_IDS.subscription,
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    // If user is not logged in, redirect to login
    if (!user) {
      toast.info("Faça login para continuar com a compra");
      navigate("/login");
      return;
    }

    setLoadingPriceId(priceId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Erro ao iniciar checkout. Tente novamente.");
        return;
      }

      if (data?.url) {
        // Open checkout in same tab for better UX
        window.location.href = data.url;
      } else {
        toast.error("Erro: URL de checkout não recebida");
      }
    } catch (err) {
      console.error("Checkout exception:", err);
      toast.error("Erro ao conectar com o serviço de pagamento");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <section className="section-padding bg-background" id="pricing">
      <div className="container-legal">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">Preços Transparentes</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Invista na <span className="text-gradient-gold">Conformidade</span> do Seu Negócio
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para sua empresa. Multas podem chegar a 7% do faturamento 
            — nossos planos custam uma fração disso.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPriceId === plan.priceId;
            
            return (
              <div
                key={plan.name}
                className={`relative legal-card p-8 ${
                  plan.popular ? "border-2 border-gold shadow-gold" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-gradient text-primary text-sm font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </div>
                )}

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl ${plan.popular ? 'bg-gold-gradient' : 'bg-primary'} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${plan.popular ? 'text-primary' : 'text-primary-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">€{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full ${plan.popular ? 'bg-gold/20' : 'bg-accent/20'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-gold' : 'text-accent'}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA - Checkout Button */}
                <Button
                  variant={plan.popular ? "gold" : "default"}
                  size="lg"
                  className="w-full"
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            <span>Garantia de satisfação de 30 dias ou seu dinheiro de volta</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
