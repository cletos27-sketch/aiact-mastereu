import { AlertCircle, Ban, Eye, Gauge, ShieldAlert } from "lucide-react";

const risks = [
  {
    level: "Risco Inaceitável",
    description: "Sistemas de IA proibidos pela legislação europeia",
    examples: ["Pontuação social", "Manipulação subliminar", "Exploração de vulnerabilidades"],
    color: "risk-prohibited",
    icon: Ban,
    penalty: "PROIBIDO",
  },
  {
    level: "Alto Risco",
    description: "Requer avaliação de conformidade antes da comercialização",
    examples: ["Recrutamento e RH", "Crédito e scoring", "Sistemas biométricos"],
    color: "risk-high",
    icon: ShieldAlert,
    penalty: "€35M ou 7%",
  },
  {
    level: "Risco Limitado",
    description: "Obrigações de transparência específicas",
    examples: ["Chatbots", "Deepfakes", "Sistemas de emoção"],
    color: "risk-limited",
    icon: Eye,
    penalty: "€15M ou 3%",
  },
  {
    level: "Risco Mínimo",
    description: "Sem obrigações regulatórias específicas",
    examples: ["Filtros de spam", "Jogos com IA", "Recomendações"],
    color: "risk-minimal",
    icon: Gauge,
    penalty: "Sem restrições",
  },
];

const RiskSection = () => {
  return (
    <section className="section-padding bg-muted" id="about">
      <div className="container-legal">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-6">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Classificação de Risco</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Entenda os Níveis de Risco do <span className="text-gradient-gold">EU AI Act</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A regulamentação europeia classifica sistemas de IA em quatro categorias, 
            cada uma com requisitos e penalidades específicas.
          </p>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {risks.map((risk, index) => {
            const Icon = risk.icon;
            return (
              <div
                key={risk.level}
                className="legal-card p-6 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon & Level */}
                <div className={`w-12 h-12 rounded-xl bg-${risk.color}/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${risk.color}`} />
                </div>
                
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {risk.level}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {risk.description}
                </p>

                {/* Examples */}
                <div className="space-y-2 mb-4">
                  {risk.examples.map((example) => (
                    <div key={example} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${risk.color}`} />
                      <span className="text-muted-foreground">{example}</span>
                    </div>
                  ))}
                </div>

                {/* Penalty Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${risk.color}/10 text-${risk.color}`}>
                  {risk.penalty}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Não sabe em qual categoria seu sistema se enquadra?
          </p>
          <a
            href="/assessment"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            Faça o diagnóstico gratuito
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default RiskSection;
