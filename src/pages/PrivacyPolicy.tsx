import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Mail } from "lucide-react"; // 'Shield', 'Lock', 'Server', 'UserCheck' removidos

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="container-legal max-w-4xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
            Política de Privacidade
          </h1>

          <div className="prose prose-invert max-w-none text-muted-foreground">
            <p>
              A sua privacidade é de extrema importância para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos as suas informações pessoais ao utilizar a nossa plataforma de conformidade com o EU AI Act.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
              Coletamos informações para fornecer e melhorar os nossos serviços. As informações podem incluir:
            </p>
            <ul>
              <li><strong>Informações de Identificação Pessoal:</strong> Nome, endereço de e-mail, informações de pagamento (processadas por terceiros como Stripe).</li>
              <li><strong>Dados de Utilização:</strong> Informações sobre como você interage com a plataforma, como páginas visitadas, tempo gasto e funcionalidades utilizadas.</li>
              <li><strong>Dados de Diagnóstico:</strong> Respostas aos questionários de avaliação de risco de IA, que são utilizados para gerar relatórios de conformidade.</li>
            </ul>

            <h2>2. Como Usamos as Suas Informações</h2>
            <p>
              Utilizamos as informações coletadas para:
            </p>
            <ul>
              <li>Fornecer e manter o nosso serviço.</li>
              <li>Personalizar a sua experiência e fornecer conteúdo relevante.</li>
              <li>Processar transações e gerenciar assinaturas.</li>
              <li>Comunicar consigo sobre atualizações, segurança e suporte.</li>
              <li>Melhorar a nossa plataforma e desenvolver novas funcionalidades.</li>
              <li>Garantir a conformidade com as obrigações legais e regulamentares.</li>
            </ul>

            <h2>3. Partilha de Informações</h2>
            <p>
              Não vendemos, trocamos ou alugamos as suas informações pessoais a terceiros. Podemos partilhar informações com:
            </p>
            <ul>
              <li><strong>Fornecedores de Serviços:</strong> Terceiros que nos ajudam a operar a plataforma (ex: processadores de pagamento, serviços de hospedagem).</li>
              <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou para responder a processos legais.</li>
            </ul>

            <h2>4. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança robustas para proteger as suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet ou armazenamento eletrónico é 100% seguro.
            </p>

            <h2>5. Os Seus Direitos</h2>
            <p>
              Você tem o direito de aceder, corrigir, atualizar ou solicitar a exclusão das suas informações pessoais. Para exercer esses direitos, entre em contato connosco através do e-mail fornecido.
            </p>

            <h2>6. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar a nossa Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações publicando a nova política nesta página.
            </p>

            <h2>7. Contacto</h2>
            <p>
              Se tiver alguma dúvida sobre esta Política de Privacidade, entre em contato connosco:
            </p>
            <p>
              <Mail className="inline-block h-4 w-4 mr-2" /> support@aiact-master.eu
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;