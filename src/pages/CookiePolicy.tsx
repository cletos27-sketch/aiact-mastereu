import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Cookie, Settings, BarChart3, Shield } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-legal section-padding pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Política de Cookies
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
                  <Cookie className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    O que são Cookies?
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita 
                    o nosso website. Utilizamos cookies para garantir que tenha a melhor experiência na 
                    nossa plataforma de conformidade.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Cookies Essenciais
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Estes cookies são necessários para o funcionamento básico da plataforma:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Autenticação e sessão do utilizador
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Preferências de idioma e região
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Segurança e proteção contra fraude
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Cookies de Análise
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizamos cookies de análise para compreender como os utilizadores interagem com a 
                    plataforma, permitindo-nos melhorar continuamente a experiência. Estes dados são 
                    agregados e anonimizados.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-trust" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Gerir os seus Cookies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Pode controlar e gerir cookies através das definições do seu navegador. Note que 
                    desativar certos cookies pode afetar a funcionalidade da plataforma. Para mais 
                    informações sobre como gerir cookies, consulte a documentação do seu navegador.
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

export default CookiePolicy;
