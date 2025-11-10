import Logo105 from "@/components/Logo105";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Users, Image, TrendingUp, MessageSquare, LogOut, ArrowLeft, Shield } from "lucide-react";

import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const Kaolack105Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.full_name || user.email || "User";
    return name.charAt(0).toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/kaolack-105", icon: Home, label: "105 ans Kaolack" },
    { path: "/kaolack-105/timeline", icon: Clock, label: "Histoire" },
    { path: "/kaolack-105/personalities", icon: Users, label: "Personnalités" },
    { path: "/kaolack-105/feed", icon: MessageSquare, label: "Actualité" },
    { path: "/kaolack-105/gallery", icon: Image, label: "Galerie", className: "hidden md:inline-flex" },
    { path: "/kaolack-105/economy", icon: TrendingUp, label: "Économie", className: "hidden lg:inline-flex" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mairie</span>
            </Link>
          </Button>
          <div className="h-8 w-px bg-border" />
          <Logo105 size="md" variant="white-bg" className="rounded shadow" />
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              asChild
              className={item.className}
            >
              <Link to={item.path}>
                <item.icon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || "Utilisateur"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Administration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Kaolack105Navigation;
