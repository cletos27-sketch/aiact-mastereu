import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SettingsModal from "@/components/dashboard/SettingsModal";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Início", href: "/", isHash: false },
    { name: "Diagnóstico", href: "/assessment", isHash: false },
    { name: "Preços", href: "/#pricing", isHash: true, hash: "pricing" },
    { name: "Sobre", href: "/#about", isHash: true, hash: "about" },
  ];

  const handleNavigation = useCallback((item: typeof navigation[0]) => {
    setIsOpen(false);
    
    if (item.isHash && item.hash) {
      if (location.pathname === "/") {
        const element = document.getElementById(item.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(item.hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      navigate(item.href);
    }
  }, [location.pathname, navigate]);

  const isActive = (item: typeof navigation[0]) => {
    if (item.isHash) {
      return location.pathname === "/" && location.hash === `#${item.hash}`;
    }
    return location.pathname === item.href;
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate("/");
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    setSettingsOpen(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-legal">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
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
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className={`text-sm font-medium transition-colors hover:text-accent cursor-pointer bg-transparent border-none ${
                  isActive(item)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA - Conditional based on auth state */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="gold" size="sm" asChild>
                  <Link to="/dashboard">Meu Painel</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleOpenSettings} className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant="gold" size="sm" asChild>
                  <Link to="/assessment">Diagnóstico Gratuito</Link>
                </Button>
              </>
            )}
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
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className="text-lg font-medium text-foreground hover:text-accent transition-colors text-left bg-transparent border-none cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
                <hr className="border-border" />
                {user ? (
                  <>
                    <Button variant="gold" asChild>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        Meu Painel
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleOpenSettings} className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
};

export default Header;
