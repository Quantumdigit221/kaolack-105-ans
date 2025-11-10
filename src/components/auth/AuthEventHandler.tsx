import { useAuthEventListener } from '@/hooks/useAuthEventListener';

/**
 * Composant pour gérer les événements d'authentification globaux
 * Doit être placé dans l'arbre des composants avec un Router parent
 */
export const AuthEventHandler = () => {
  useAuthEventListener();
  return null; // Ce composant ne rend rien visuellement
};