import { LucideIcon, ShieldCheck, Zap, Lightbulb, Scale, Users, BookOpen } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Diagnóstico de Risco",
    description: "Avalie o nível de risco do seu sistema de IA conforme o EU AI Act.",
    icon: ShieldCheck,
  },
  {
    title: "Templates de Documentos",
    description: "Acesse modelos de documentos essenciais para conformidade.",
    icon: BookOpen,
  },
  {
    title: "Literacia em IA",
    description: "Capacite sua equipe com conhecimento fundamental sobre IA e regulamentação.",
    icon: Lightbulb,
  },
  {
    title: "Ações Prioritárias",
    description: "Receba um plano de ação claro para alcançar a conformidade.",
    icon: Zap,
  },
  {
    title: "Supervisão Humana",
    description: "Diretrizes para garantir o controle humano sobre sistemas de IA.",
    icon: Users,
  },
  {
    title: "Conformidade Contínua",
    description: "Mantenha-se atualizado com as mudanças regulatórias e melhores práticas.",
    icon: Scale,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container-legal text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Recursos Essenciais para Sua Conformidade
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Nossa plataforma oferece as ferramentas necessárias para navegar pelo complexo cenário do EU AI Act.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => { // 'index' removido
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="legal-card p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;