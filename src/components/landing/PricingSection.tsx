import PricingCards from "@/components/PricingCards";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container-legal text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Planos Flexíveis para Sua Necessidade
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Escolha o plano que melhor se adapta à sua jornada de conformidade com o EU AI Act.
        </p>

        <PricingCards hasCompliancePack={false} />

        <p className="text-sm text-muted-foreground mt-8">
          Pagamento seguro via Stripe. Acesso imediato após confirmação.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;