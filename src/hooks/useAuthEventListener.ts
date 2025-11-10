import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour écouter les événements d'authentification globaux
 * et réagir en conséquence (toast + redirection)
 */
export const useAuthEventListener = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Gestionnaire pour token expiré
    const handleTokenExpired = (event: CustomEvent) => {
      const message = event.detail?.message || 'Votre session a expiré';
      
      toast.error(message, {
        description: 'Vous allez être redirigé vers la page de connexion.',
        duration: 4000,
      });

      // Déconnexion via le contexte auth pour nettoyer l'état
      logout().finally(() => {
        // Redirection après un court délai
        setTimeout(() => {
          navigate('/auth105', { replace: true });
        }, 2000);
      });
    };

    // Gestionnaire pour accès non autorisé
    const handleUnauthorized = (event: CustomEvent) => {
      const message = event.detail?.message || 'Accès non autorisé';
      
      toast.error(message, {
        description: 'Veuillez vous connecter pour continuer.',
        duration: 4000,
      });

      // Déconnexion et redirection
      logout().finally(() => {
        setTimeout(() => {
          navigate('/auth105', { replace: true });
        }, 2000);
      });
    };

    // Écouter les événements personnalisés
    window.addEventListener('auth:token-expired', handleTokenExpired as EventListener);
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);

    // Nettoyage
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired as EventListener);
      window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    };
  }, [navigate, logout]);
};