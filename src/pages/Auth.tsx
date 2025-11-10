import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // États pour le formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // États pour le formulaire d'inscription
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    first_name: "",
    last_name: "",
    username: "",
    city: "",
    address: "",
    bio: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate("/feed");
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.email || !registerData.password || !registerData.full_name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        first_name: registerData.first_name || undefined,
        last_name: registerData.last_name || undefined,
        username: registerData.username || undefined,
        city: registerData.city || undefined,
        address: registerData.address || undefined,
        bio: registerData.bio || undefined,
      });
      navigate("/feed");
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kaolack-green/5 via-kaolack-gold/5 to-kaolack-orange/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-kaolack-green via-kaolack-gold to-kaolack-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-kaolack-green via-kaolack-gold to-kaolack-orange bg-clip-text text-transparent">
            Kaolack Stories Connect
          </CardTitle>
          <CardDescription>
            Rejoignez la communauté et partagez vos histoires
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-kaolack" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Section Informations personnelles */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Informations personnelles</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-first-name">Prénom</Label>
                      <Input
                        id="register-first-name"
                        type="text"
                        placeholder="Jean"
                        value={registerData.first_name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-last-name">Nom de famille</Label>
                      <Input
                        id="register-last-name"
                        type="text"
                        placeholder="Dupont"
                        value={registerData.last_name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nom complet *</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-username">Nom d'utilisateur</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="jean.dupont"
                      value={registerData.username}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Optionnel - Sera généré automatiquement si vide</p>
                  </div>
                </div>

                {/* Section Contact */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-city">Ville</Label>
                      <Input
                        id="register-city"
                        type="text"
                        placeholder="Kaolack"
                        value={registerData.city}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-address">Adresse</Label>
                      <Input
                        id="register-address"
                        type="text"
                        placeholder="Quartier, rue..."
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Bio */}
                <div className="space-y-2">
                  <Label htmlFor="register-bio">Bio (optionnel)</Label>
                  <Input
                    id="register-bio"
                    type="text"
                    placeholder="Parlez-nous de vous en quelques mots..."
                    value={registerData.bio}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Au moins 6 caractères"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmer le mot de passe *</Label>
                  <Input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-kaolack" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              En continuant, vous acceptez nos{" "}
              <Link to="/terms" className="text-kaolack-green hover:underline">
                conditions d'utilisation
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;