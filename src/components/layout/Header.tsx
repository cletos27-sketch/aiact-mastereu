import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Diagnóstico", href: "/assessment" },
    { name: "Preços", href: "/#pricing" },
    { name: "Sobre", href: "/#about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-legal">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-hero-gradient flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-primary leading-tight">
                EU AI-Compliance
              </span>
              <span className="text-xs text-muted-foreground">Master</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link to="/assessment">Diagnóstico Gratuito</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <div className="flex flex-col gap-6 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="border-border" />
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button variant="gold" asChild>
                  <Link to="/assessment" onClick={() => setIsOpen(false)}>
                    Diagnóstico Gratuito
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
