import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoKaolack from "@/assets/logo-kaolack.jpg";
import Logo105 from "@/components/Logo105";
import { Home, FileText, Landmark, Building2, Newspaper, Menu, X, Shield, ChevronDown, MessageSquare, Calendar, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DEFAULT_MENU = [
  { path: "/", label: "Accueil", icon: "Home" },
  { path: "/actualites", label: "Actualités", icon: "Newspaper" },
  { path: "/kaolack-105", label: "105 de Kaolack", icon: "Building2" },
];

// Éléments du menu "LA COMMUNE"
const COMMUNE_MENU_ITEMS = [
  { 
    path: "/mot-du-maire", 
    label: "Mot du Maire", 
    icon: "MessageSquare"
  },
  { 
    path: "/affaires-domaniales", 
    label: "Affaires Domoniales", 
    icon: "MapPin",
    external: false
  },
  { 
    path: "/etat-civil", 
    label: "État civil", 
    icon: "Landmark"
  },
  {
    path: "/deposer-courrier",
    label: "Déposer un courrier",
    icon: "FileText",
    description: "Accédez rapidement aux services administratifs de la commune"
  },
  { 
    path: "#", 
    label: "Rendez-vous", 
    icon: "Calendar",
    onClick: () => {
      alert("📅 Prise de rendez-vous\n\nPour prendre rendez-vous avec les services municipaux :\n\n• Appelez la mairie au : (En cours)\n• Visitez nos bureaux : Lundi-Vendredi 8h-17h\n• Ou utilisez bientôt notre système de rendez-vous en ligne\n\nService en cours de développement...");
    }
  }
];

const ICONS = { Home, FileText, Landmark, Building2, Newspaper, Menu, X, Shield, ChevronDown, MessageSquare, Calendar, MapPin };

const Navigation = () => {
  const [customLogo, setCustomLogo] = useState<string>("");
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user info to console
  useEffect(() => {
    console.log("Navigation Debug:", { isAuthenticated, user: user ? { email: user.email, role: user.role } : null });
  }, [isAuthenticated, user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mainHomeContent");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logo) setCustomLogo(parsed.logo);
        if (parsed.menu && Array.isArray(parsed.menu)) setMenu(parsed.menu);
      }
    } catch (e) {}
  }, []);

  const dynamicMenu = menu;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-kaolack-soft">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <div className="relative">
              <img
                src={customLogo || logoKaolack}
                alt="Logo Commune de Kaolack"
                className="h-12 w-12 object-contain bg-white rounded"
              />
            </div>
            <span className="hidden sm:block font-bold text-lg">Commune de Kaolack</span>
          </a>
          
          {/* Logo 105 ANS */}
          <div className="hidden md:flex items-center">
            <div className="h-8 w-px bg-border mx-2" />
            <a href="/kaolack-105" className="transition-transform hover:scale-105">
              <Logo105 size="sm" variant="white-bg" className="rounded shadow-sm" />
            </a>
          </div>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-2 items-center">
          {dynamicMenu.map((item, idx) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS] || Home;
            if ((item as any).external) {
              return (
                <a 
                  key={idx} 
                  href={item.path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center px-3 py-2 rounded hover:bg-muted transition"
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                </a>
              );
            }
            return (
              <a 
                key={idx} 
                href={item.path} 
                className="flex items-center px-3 py-2 rounded hover:bg-muted transition"
              >
                <Icon className="h-5 w-5 mr-2" />
                <span>{item.label}</span>
              </a>
            );
          })}

          {/* Menu déroulant LA COMMUNE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center px-3 py-2 rounded hover:bg-muted transition">
                <Landmark className="h-5 w-5 mr-2" />
                <span>LA COMMUNE</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {COMMUNE_MENU_ITEMS.map((item, idx) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS] || Landmark;
                
                if (item.external) {
                  return (
                    <DropdownMenuItem key={idx} asChild>
                      <a 
                        href={item.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.label}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                }
                
                if (item.onClick) {
                  return (
                    <DropdownMenuItem key={idx} onClick={item.onClick} className="cursor-pointer">
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                }
                
                return (
                  <DropdownMenuItem key={idx} asChild>
                    <a href={item.path} className="flex items-center w-full cursor-pointer">
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.label}</span>
                    </a>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton Administration pour admin */}
          {isAuthenticated && user?.role === 'admin' && (
            <a 
              href="/admin" 
              className="flex items-center px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
            >
              <Shield className="h-5 w-5 mr-2" />
              Administration
            </a>
          )}
          
          {isAuthenticated && (
            <button
              className="ml-4 px-4 py-2 rounded bg-destructive text-white hover:bg-destructive/80 transition font-semibold"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-muted transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-card/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-2">
            {dynamicMenu.map((item, idx) => {
              const Icon = ICONS[item.icon as keyof typeof ICONS] || Home;
              if ((item as any).external) {
                return (
                  <a
                    key={idx}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-3 rounded hover:bg-muted transition w-full"
                    onClick={closeMobileMenu}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </a>
                );
              }
              return (
                <a
                  key={idx}
                  href={item.path}
                  className="flex items-center px-3 py-3 rounded hover:bg-muted transition w-full"
                  onClick={closeMobileMenu}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </a>
              );
            })}

            {/* Menu LA COMMUNE pour mobile */}
            <div className="border-t pt-2 mt-2">
              <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                LA COMMUNE
              </div>
              {COMMUNE_MENU_ITEMS.map((item, idx) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS] || Landmark;
                
                if (item.external) {
                  return (
                    <a
                      key={idx}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-6 py-3 rounded hover:bg-muted transition w-full"
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </a>
                  );
                }
                
                if (item.onClick) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        item.onClick!();
                        closeMobileMenu();
                      }}
                      className="flex items-center px-6 py-3 rounded hover:bg-muted transition w-full text-left"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                }
                
                return (
                  <a
                    key={idx}
                    href={item.path}
                    className="flex items-center px-6 py-3 rounded hover:bg-muted transition w-full"
                    onClick={closeMobileMenu}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
            
            {/* Bouton Administration mobile pour admin */}
            {isAuthenticated && user?.role === 'admin' && (
              <a
                href="/admin"
                className="flex items-center px-3 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition w-full"
                onClick={closeMobileMenu}
              >
                <Shield className="h-5 w-5 mr-3" />
                <span>Administration</span>
              </a>
            )}
            
            {isAuthenticated && (
              <button
                className="flex items-center px-3 py-3 rounded bg-destructive text-white hover:bg-destructive/80 transition w-full"
                onClick={handleLogout}
              >
                <span>Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;