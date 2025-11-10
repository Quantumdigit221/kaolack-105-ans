import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    city?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    full_name: string;
    city?: string;
    avatar_url?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erreur de vérification auth:', error);
        // Token invalide, on le supprime
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      setUser(response.user);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    city?: string;
    address?: string;
    bio?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      setUser(response.user);
      toast.success('Inscription réussie !');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      // Même en cas d'erreur, on déconnecte localement
      setUser(null);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const updateProfile = async (profileData: {
    full_name: string;
    city?: string;
    avatar_url?: string;
  }) => {
    try {
      await apiService.updateProfile(profileData);
      // Mettre à jour les données utilisateur localement
      if (user) {
        setUser({
          ...user,
          ...profileData,
        });
      }
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error('Erreur de rafraîchissement:', error);
      // Si le token est invalide, on déconnecte
      if (error.message.includes('Token')) {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
