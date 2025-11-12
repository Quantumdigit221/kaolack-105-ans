// EXEMPLES D'UTILISATION - AnnouncementBanner

// ============================================
// EXEMPLE 1: Bannière sur la page Kaolack105Home
// ============================================

import AnnouncementBanner from "@/components/AnnouncementBanner";

export function Kaolack105HomeWithBanner() {
  return (
    <div>
      <Navigation />
      
      {/* Bannière d'information sur le projet */}
      <AnnouncementBanner
        title="📚 Galerie des Personnalités Kaolackoise"
        message="Découvrez les figures qui ont marqué l'histoire de notre ville. Vous pouvez proposer des personnalités à honorer avec une photo."
        type="info"
        action={{
          label: "Proposer une personnalité",
          href: "/kaolack-105/personalities#form"
        }}
      />
      
      {/* Contenu de la page */}
      <main>
        {/* ... */}
      </main>
    </div>
  );
}

// ============================================
// EXEMPLE 2: Bannière d'avertissement
// ============================================

export function PageWithWarning() {
  return (
    <div>
      <Navigation />
      
      {/* Bannière d'avertissement */}
      <AnnouncementBanner
        title="⚠️ Maintenance en cours"
        message="Certaines fonctionnalités seront indisponibles demain de 22h à 23h pour maintenance. Nous nous excusons pour le désagrément."
        type="warning"
        dismissible={true}
      />
      
      <main>{/* ... */}</main>
    </div>
  );
}

// ============================================
// EXEMPLE 3: Bannière de succès
// ============================================

export function PageWithSuccess() {
  return (
    <div>
      <Navigation />
      
      {/* Bannière de succès */}
      <AnnouncementBanner
        title="✅ Opération réussie"
        message="Votre demande de terrain a été enregistrée. Vous recevrez une confirmation par email dans les 24h."
        type="success"
        action={{
          label: "Voir ma demande",
          href: "/my-requests"
        }}
      />
      
      <main>{/* ... */}</main>
    </div>
  );
}

// ============================================
// EXEMPLE 4: Bannière avec callback
// ============================================

export function PageWithCallback() {
  const handleActionClick = () => {
    console.log("Action clicked!");
    // Redirection custom ou action
  };

  const handleDismiss = () => {
    console.log("Banner dismissed");
    // Log ou analytics
  };

  return (
    <div>
      <Navigation />
      
      <AnnouncementBanner
        title="🎟️ Billets disponibles"
        message="Les billets pour la cérémonie du 105ème anniversaire sont maintenant disponibles!"
        type="announcement"
        dismissible={true}
        onDismiss={handleDismiss}
        action={{
          label: "Réserver maintenant",
          onClick: handleActionClick
        }}
      />
      
      <main>{/* ... */}</main>
    </div>
  );
}

// ============================================
// EXEMPLE 5: Sans action (juste information)
// ============================================

export function SimpleInfoBanner() {
  return (
    <div>
      <Navigation />
      
      <AnnouncementBanner
        title="ℹ️ Mise à jour système"
        message="Notre plateforme a été mise à jour avec de nouvelles fonctionnalités. Découvrez ce qui est nouveau!"
        type="info"
      />
      
      <main>{/* ... */}</main>
    </div>
  );
}

// ============================================
// EXEMPLE 6: Utiliser le Wrapper LayoutWithBanner
// ============================================

import LayoutWithBanner from "@/components/LayoutWithBanner";

export function PageUsingLayout() {
  return (
    <LayoutWithBanner
      showBanner={true}
      bannerTitle="🎉 Célébration des 105 ans"
      bannerMessage="Rejoignez-nous pour une celebration exceptionnelle!"
      bannerType="announcement"
    >
      <main className="container py-16">
        {/* Contenu de la page */}
      </main>
    </LayoutWithBanner>
  );
}

// ============================================
// VARIANTES DE TYPES & COULEURS
// ============================================

type BannerType = "info" | "warning" | "success" | "announcement";

const bannerExamples: Array<{
  type: BannerType;
  title: string;
  message: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = [
  {
    type: "info",
    title: "ℹ️ Information",
    message: "Fond bleu clair avec texte bleu foncé",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    iconColor: "text-blue-600"
  },
  {
    type: "warning",
    title: "⚠️ Avertissement",
    message: "Fond orange clair avec texte orange foncé",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    iconColor: "text-orange-600"
  },
  {
    type: "success",
    title: "✅ Succès",
    message: "Fond vert clair avec texte vert foncé",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    iconColor: "text-green-600"
  },
  {
    type: "announcement",
    title: "🔔 Annonce",
    message: "Fond dégradé avec accent primary",
    bgColor: "bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10",
    textColor: "text-foreground",
    iconColor: "text-primary"
  }
];

// ============================================
// INTÉGRATION DANS MULTIPLE PAGES
// ============================================

/**
 * Pour ajouter la bannière à plusieurs pages:
 * 
 * 1. ImporterAnnouncementBanner:
 *    import AnnouncementBanner from "@/components/AnnouncementBanner";
 * 
 * 2. L'ajouter après <Navigation /> dans le JSX:
 *    <Navigation />
 *    <AnnouncementBanner
 *      title="Votre titre"
 *      message="Votre message"
 *      type="announcement"
 *    />
 * 
 * 3. Options avancées:
 *    - dismissible: boolean (défaut: true)
 *    - onDismiss: () => void (callback pour analytics)
 *    - action: { label: string; href?: string; onClick?: () => void }
 * 
 * Pages suggérées pour ajouter la bannière:
 *    - /kaolack-105 (Kaolack105Home.tsx)
 *    - /kaolack-105/personalities (section Personalities)
 *    - /kaolack-105/gallery (ImageGallery)
 *    - /mots-du-maire (MaireMessage.tsx)
 *    - /feed (Feed/News page)
 *    - /admin (Admin panel)
 */

// ============================================
// STYLING PERSONNALISÉ
// ============================================

/**
 * Pour créer une bannière custom avec des couleurs personnalisées,
 * on peut étendre le composant AnnouncementBanner:
 * 
 * interface CustomBannerProps extends AnnouncementBannerProps {
 *   bgColor?: string;
 *   textColor?: string;
 *   borderColor?: string;
 * }
 * 
 * export function CustomBanner(props: CustomBannerProps) {
 *   return (
 *     <div className={`border ${props.borderColor || 'border-primary/30'}`}>
 *       <AnnouncementBanner {...props} />
 *     </div>
 *   );
 * }
 */
