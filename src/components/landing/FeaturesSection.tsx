import { BookOpen, ClipboardCheck, FileText, Lock, Scale, Users } from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Diagnóstico Automatizado",
    description: "Questionário inteligente baseado nos Anexos III e IV do EU AI Act para classificar seu sistema em minutos.",
  },
  {
    icon: FileText,
    title: "Documentação Completa",
    description: "Templates prontos para Política de Transparência, Registro de Logs e demais documentos exigidos.",
  },
  {
    icon: BookOpen,
    title: "Literacia em IA (Art. 4)",
    description: "Material de treinamento para garantir que sua equipe entenda e cumpra as obrigações da lei.",
  },
  {
    icon: Lock,
    title: "Logs Imutáveis",
    description: "Sistema de auditoria que armazena registros de forma segura e imutável, conforme exigido pela regulamentação.",
  },
  {
    icon: Scale,
    title: "Conformidade Legal",
    description: "Metodologia desenvolvida por especialistas em regulamentação europeia de tecnologia.",
  },
  {
    icon: Users,
    title: "Feito para PMEs",
    description: "Solução acessível e simplificada, pensada especialmente para micro e pequenas empresas.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-legal">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que Você Precisa para a <span className="text-gradient-trust">Conformidade</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma plataforma completa que guia sua empresa em cada etapa do processo de adequação ao EU AI Act.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
