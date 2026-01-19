import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Calendar, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-gold rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-gold rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/30 rounded-full" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 right-[15%] animate-float hidden lg:block">
        <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-4 border border-gold/20">
          <Shield className="w-8 h-8 text-gold" />
        </div>
      </div>
      <div className="absolute bottom-32 left-[10%] animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
        <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-4 border border-accent/20">
          <TrendingUp className="w-8 h-8 text-accent" />
        </div>
      </div>

      <div className="container-legal relative z-10 px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-risk-high/20 border border-risk-high/30 rounded-full px-4 py-2 mb-8 animate-pulse-slow">
            <AlertTriangle className="w-4 h-4 text-risk-high" />
            <span className="text-sm font-medium text-primary-foreground">
              Prazo: Agosto 2026 - Multas até 7% do faturamento
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in">
            Sua empresa está preparada para o{" "}
            <span className="text-gradient-gold">EU AI Act</span>?
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Descubra em minutos se seus sistemas de IA estão em conformidade com a nova 
            regulamentação europeia. Evite multas devastadoras e proteja seu negócio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/assessment">
                Diagnóstico de Risco Gratuito
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl" 
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver Planos
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gold mb-1">500+</div>
              <div className="text-sm text-primary-foreground/60">Empresas Avaliadas</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">100%</div>
              <div className="text-sm text-primary-foreground/60">Taxa de Conformidade</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gold mb-1">
                <Calendar className="w-5 h-5" />
                <span>2026</span>
              </div>
              <div className="text-sm text-primary-foreground/60">Prazo Final</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
