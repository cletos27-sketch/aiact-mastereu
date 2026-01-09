import { Link } from "react-router-dom";
import { Shield, Mail, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-legal section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight">
                  EU AI-Compliance
                </span>
                <span className="text-xs text-primary-foreground/60">Master</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-md mb-6">
              Ajudamos micro e pequenas empresas a navegar as complexidades do EU AI Act 
              de 2026, garantindo conformidade total e evitando multas de até 7% do faturamento.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-primary transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-primary transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contato@euai-compliance.com"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-primary transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Recursos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/assessment" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Diagnóstico de Risco
                </Link>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Guia EU AI Act
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  RGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 EU AI-Compliance Master. Todos os direitos reservados.
          </p>
          <p className="text-xs text-primary-foreground/40">
            Este serviço não constitui aconselhamento jurídico. Consulte sempre um advogado qualificado.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
