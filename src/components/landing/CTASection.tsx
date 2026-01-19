import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-[20%] w-32 h-32 border border-gold rounded-full" />
        <div className="absolute bottom-10 right-[20%] w-48 h-48 border border-gold rounded-full" />
      </div>

      <div className="container-legal relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-risk-high/20 border border-risk-high/30 rounded-full px-4 py-2 mb-8">
            <Clock className="w-4 h-4 text-risk-high" />
            <span className="text-sm font-medium text-primary-foreground">
              Tempo limitado: Prazo de adequação em 2026
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            Não Espere Até Ser{" "}
            <span className="text-gradient-gold">Tarde Demais</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Empresas que se antecipam à regulamentação têm vantagem competitiva. 
            Comece agora e transforme conformidade em diferencial de mercado.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" asChild>
              <Link to="/assessment">
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              <span>Resultado imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              <span>100% confidencial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
