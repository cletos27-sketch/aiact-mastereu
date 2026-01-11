import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Scale, AlertTriangle, BookOpen, Shield } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-legal section-padding pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Termos de Serviço
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
                  <Scale className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Natureza do Serviço
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O EU AI-Compliance fornece ferramentas de suporte à conformidade regulatória. 
                    O uso da plataforma não substitui o aconselhamento jurídico formal.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Aviso Legal Importante
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Os dossiês gerados são baseados nas interpretações atuais do AI Act de 2026 e devem 
                    ser revisados pelo departamento jurídico da empresa contratante. A plataforma serve 
                    como ferramenta de apoio e não como substituto de consultoria jurídica profissional.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Uso Aceitável
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Ao utilizar o EU AI-Compliance, você concorda em:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Fornecer informações precisas sobre sua empresa e uso de IA
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Não utilizar a plataforma para fins ilegais ou fraudulentos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Manter a confidencialidade das suas credenciais de acesso
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Respeitar os direitos de propriedade intelectual da plataforma
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Limitação de Responsabilidade
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    O EU AI-Compliance não se responsabiliza por decisões empresariais tomadas com base 
                    exclusivamente nas análises geradas pela plataforma. Recomendamos sempre a validação 
                    por profissionais jurídicos qualificados antes de implementar mudanças significativas 
                    nos processos de conformidade da sua organização.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Alterações aos Termos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
                    serão comunicadas através da plataforma e por e-mail aos utilizadores registados. 
                    O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
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

export default TermsOfService;
