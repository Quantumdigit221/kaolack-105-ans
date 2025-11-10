import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthEventHandler } from "@/components/auth/AuthEventHandler";
import { useEffect } from "react";
import MainHome from "./pages/MainHome";
import Kaolack105Home from "./pages/Kaolack105Home";
import Feed from "./pages/Feed";
import Gallery from "./pages/Gallery";
import Timeline from "./pages/Timeline";
import Personalities from "./pages/Personalities";
import Economy from "./pages/Economy";
import Auth from "./pages/Auth";
import Auth105 from "./pages/Auth105";
import Register105 from "./pages/Register105";
import Maintenance from "./pages/Maintenance";
import Admin from "./pages/Admin";
import Actualites from "./pages/Actualites";
import PostDetail from "./pages/PostDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import MobileMenuDemo from "./components/MobileMenuDemo";
const queryClient = new QueryClient();

const App = () => {
  // Enregistrement du service worker pour PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré pour PWA "105 ans de Kaolack":', registration);
          })
          .catch((registrationError) => {
            console.log('❌ Échec d\'enregistrement du Service Worker:', registrationError);
          });
      });
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthEventHandler />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainHome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth105" element={<Auth105 />} />
            <Route path="/register105" element={<Register105 />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/actualites/:id" element={<Actualites />} />
            <Route path="/etat-civil" element={<Maintenance />} />
            <Route path="/mobile-demo" element={<MobileMenuDemo />} />
            
            {/* Module 105 de Kaolack - Protected routes */}
            <Route path="/kaolack-105" element={<ProtectedRoute><Kaolack105Home /></ProtectedRoute>} />
            <Route path="/kaolack-105/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/kaolack-105/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
            <Route path="/kaolack-105/personalities" element={<ProtectedRoute><Personalities /></ProtectedRoute>} />
            <Route path="/kaolack-105/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/kaolack-105/economy" element={<ProtectedRoute><Economy /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
