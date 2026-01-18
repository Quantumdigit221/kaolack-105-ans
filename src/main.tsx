import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enregistrement du Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                console.log('🔄 Nouvelle version disponible');
                if (confirm('Une nouvelle version de l\'application est disponible. Voulez-vous la charger ?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Erreur d\'enregistrement du Service Worker:', error);
      });
  });
}

// Gestion de l'installation PWA
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Afficher un bouton d'installation personnalisé
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Installer l\'application';
  installButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  installButton.style.cssText = 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999;';
  
  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Application installée');
        }
        deferredPrompt = null;
        installButton.remove();
      });
    }
  });
  
  document.body.appendChild(installButton);
});

createRoot(document.getElementById("root")!).render(<App />);
