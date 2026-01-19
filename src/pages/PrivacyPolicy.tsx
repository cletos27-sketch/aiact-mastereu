import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Lock, Server, UserCheck, Mail, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-legal section-padding pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Compromisso com a Proteção de Dados
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O EU AI-Compliance está comprometido com a proteção de dados pessoais sob o RGPD (GDPR). 
                    Coletamos seu e-mail exclusivamente para fornecer acesso à nossa plataforma e atualizações 
                    sobre o AI Act.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Server className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Armazenamento Seguro
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Seus dados são armazenados de forma segura em servidores na União Europeia e nunca 
                    serão compartilhados com terceiros sem consentimento explícito.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Seus Direitos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Sob o RGPD, você tem os seguintes direitos:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Direito de acesso aos seus dados pessoais
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Direito de retificação de dados incorretos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Direito ao apagamento ("direito a ser esquecido")
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Direito à portabilidade dos dados
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Direito de oposição ao processamento
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Contacto
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Para exercer qualquer um dos seus direitos ou para questões relacionadas com a privacidade, 
                    entre em contacto connosco através do e-mail:{" "}
                    <a href="mailto:privacy@aiact-master.eu" className="text-primary hover:text-primary/80 transition-colors">
                      privacy@aiact-master.eu
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
