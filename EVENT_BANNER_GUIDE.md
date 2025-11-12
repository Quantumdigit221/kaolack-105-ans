# EventBanner - Bannière Infographique pour l'Événement

## 📋 Vue d'Ensemble

Le composant **EventBanner** affiche une infographie attrayante pour annoncer l'événement du 105ème anniversaire de Kaolack. C'est une bannière sticky qui apparaît en haut de la page sous la Navigation.

## 🎨 Design

### Caractéristiques Visuelles
- **Gradient de fond**: Bleu (600) → Violet (600) → Rose (500)
- **Taille**: Responsive, hauteur maximale 300px
- **Position**: Sticky (reste visible au scroll)
- **Animation**: Hover scale (105% au survol)
- **Fermeture**: Bouton X en haut à droite (dismissible)

### Éléments de l'Infographie
```
┌──────────────────────────────────────────────────┐
│  105                🎉  CÉLÉBRATION DES 105 ANS │
│  (grands, 25% opacité)  DE KAOLACK              │
│                                                   │
│  Une Histoire • Une Fierté • Un Avenir          │
│  ✨ Participez à la plateforme participative...  │
│                                                   │
│              Passé | Présent | Avenir            │
│               •        •         •                │
│            [Découvrir →]                 [✕]    │
└──────────────────────────────────────────────────┘
```

## 🔧 Props

```typescript
interface EventBannerProps {
  dismissible?: boolean;      // Afficher bouton X (défaut: true)
  onDismiss?: () => void;     // Callback quand dismissed
  href?: string;              // URL de redirection (défaut: "/kaolack-105")
  onClick?: () => void;       // Callback au clic sur la bannière
}
```

## 📝 Utilisation

### Utilisation Basique (MainHome.tsx)
```tsx
import EventBanner from "@/components/EventBanner";

export default function MainHome() {
  return (
    <div>
      <Navigation />
      <EventBanner href="/kaolack-105" dismissible={true} />
      <main>
        {/* Contenu de la page */}
      </main>
    </div>
  );
}
```

### Utilisation Avancée avec Callbacks
```tsx
const handleEventBannerClick = () => {
  console.log("Banner clicked - scrolling to event details");
  document.getElementById("event-details")?.scrollIntoView({ behavior: "smooth" });
};

const handleDismiss = () => {
  // Envoyer une métrique d'analytics
  analytics.trackEvent("event_banner_dismissed");
  localStorage.setItem("event_banner_dismissed", "true");
};

<EventBanner
  href="/kaolack-105"
  dismissible={true}
  onClick={handleEventBannerClick}
  onDismiss={handleDismiss}
/>
```

### Cacher la Bannière si Déjà Dismissée
```tsx
const [showBanner, setShowBanner] = useState(
  !localStorage.getItem("event_banner_dismissed")
);

{showBanner && (
  <EventBanner
    href="/kaolack-105"
    dismissible={true}
    onDismiss={() => {
      localStorage.setItem("event_banner_dismissed", "true");
      setShowBanner(false);
    }}
  />
)}
```

## 📂 Fichiers

### Composant
- **Fichier**: `src/components/EventBanner.tsx`
- **Importe**: `src/assets/event-105-banner.svg`
- **Dépendances**: React (useState), lucide-react (X icon)

### Assets
- **Fichier SVG**: `src/assets/event-105-banner.svg`
- **Dimensions**: 1200x300px (viewport)
- **Format**: SVG (vectoriel, scalable)
- **Poids**: ~3KB (léger)

## 🎯 Pages Utilisant EventBanner

### Actuelles ✅
- `MainHome.tsx` (page d'accueil)

### Recommandées
- `Kaolack105Home.tsx` (page anniversaire)
- `Feed.tsx` (flux d'actualités)
- `Gallery.tsx` (galerie d'images)

## 🔄 Comportement Utilisateur

1. **Affichage Initial**: Bannière sticky visible immédiatement
2. **Au Survol**: Image se zoom légèrement (scale 105%)
3. **Au Clic**: Redirection vers `/kaolack-105` ou callback personnalisé
4. **Bouton X**: Masquer la bannière (state `isVisible = false`)
5. **Scroll**: Bannière reste visible grâce à `sticky` positioning

## 💾 État Local

Le composant utilise un état interne pour gérer la visibilité:

```typescript
const [isVisible, setIsVisible] = useState(true);

// Quand X est cliqué:
setIsVisible(false); // Bannière disparaît
onDismiss?.();      // Appel du callback optionnel
```

## 🎨 Personnalisation

### Changer le Lien de Redirection
```tsx
<EventBanner href="/event-details" />
```

### Désactiver la Fermeture
```tsx
<EventBanner dismissible={false} />
```

### Ajouter Une Redirection Personnalisée
```tsx
<EventBanner 
  onClick={() => {
    // Logique personnalisée
    navigateTo("/special-event-page");
  }}
/>
```

## 🌐 Responsive

- **Desktop**: Image pleine hauteur (300px)
- **Tablet**: Image adaptée au conteneur
- **Mobile**: Image responsive avec scrolling horizontal si nécessaire

Classes Tailwind utilisées:
- `max-w-7xl`: Limitation de largeur maximale
- `mx-auto px-4`: Centrage et padding
- `w-full h-auto`: Responsive image
- `sticky top-0 z-40`: Position sticky au-dessus du contenu

## 🔍 Optimisation

### Performance
- **SVG vectoriel**: Scalable sans perte de qualité
- **Lazy loading**: Image optimisée par le navigateur
- **Lightweight**: Taille minimale du composant

### Accessibilité
- **Alt text**: Description pour lecteurs d'écran
- **Aria label**: "Fermer la bannière" pour bouton X
- **Keyboard support**: Cliquable avec Tab + Enter

## 🚀 Déploiement

Fichiers à commiter:
- ✅ `src/components/EventBanner.tsx` (nouveau composant)
- ✅ `src/assets/event-105-banner.svg` (infographie)
- ✅ `src/pages/MainHome.tsx` (mise à jour imports + JSX)

```bash
git add src/components/EventBanner.tsx
git add src/assets/event-105-banner.svg
git add src/pages/MainHome.tsx
git commit -m "feat: Add EventBanner with SVG infographic for 105-year celebration"
git push origin main
```

## 📊 Données de la Bannière SVG

### Gradient
- `ID: bgGradient` - Bleu (1e40af) → Violet (7c3aed) → Rose (db2777)
- `ID: accentGradient` - Ambre (fbbf24) → Orange (f97316)

### Textes
- Titre principal: "CÉLÉBRATION DES 105 ANS"
- Sous-titre: "DE KAOLACK"
- Baseline: "Une Histoire • Une Fierté • Un Avenir"
- CTA: "✨ Participez à la plateforme participative et partagez vos histoires"

### Animations SVG
- Filtre d'ombre (drop shadow)
- Filtre de brillance (glow effect)
- Opacités dégradées pour profondeur

## 🎯 Prochaines Étapes

- [ ] Exporter SVG en PNG haute résolution (optionnel)
- [ ] Ajouter EventBanner à d'autres pages clés
- [ ] Créer variantes de bannière (autres langues, autres événements)
- [ ] Ajouter analytics pour tracker les clics/dismissals
- [ ] Créer bannière éditable via admin panel

---

**Création**: 12 Novembre 2025
**Statut**: ✅ Production Ready
**Accessibilité**: WCAG 2.1 Level AA
