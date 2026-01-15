/**
 * Utilitaires pour la gestion des URLs d'images
 */

/**
 * Normalise une URL d'image pour l'affichage
 * @param imageUrl - URL de l'image (peut être relative ou absolue)
 * @returns URL complète et valide pour l'affichage
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Si c'est déjà une URL complète (commence par http), la retourner telle quelle
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si c'est une URL relative, ajouter le domaine de production
  const baseUrl = 'https://portail.kaolackcommune.sn';
  
  // S'assurer que l'URL commence par /
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Gestionnaire d'erreur pour les images
 * @param event - Event de l'erreur
 * @param imageUrl - URL de l'image qui a échoué
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, imageUrl: string) => {
  console.error('Erreur de chargement image:', imageUrl);
  event.currentTarget.style.display = 'none';
};
