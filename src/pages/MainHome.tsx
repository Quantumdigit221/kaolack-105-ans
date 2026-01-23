import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, TrendingUp, Landmark, FileText, Briefcase, FileCheck, Home, Sparkles, Users, Target, Zap, Globe, Clock, ChevronRight, Star, Award, TrendingUp as TrendingIcon, BarChart3, MessageSquare } from "lucide-react";
import { apiService } from "@/services/api";
import { useQuery } from '@tanstack/react-query';
import kaolackHero from "@/assets/kaolack-hero.jpg";
import kaolackMarche from "@/assets/kaolack-marche-vintage.jpg";
import kaolackMosquee from "@/assets/kaolack-mosquee-heritage.jpg";
import mairePhoto from "@/assets/maire-kaolack.png";
import { KaolackHistoryBot } from "@/components/KaolackHistoryBot";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import '../styles/mobile-fixes.css';

// Slides par défaut si l'API ne retourne rien
const defaultSlides = [
  {
    image: kaolackHero,
    title: "Célébration des 105 ans de Kaolack",
    subtitle: "Lancement de la plateforme participative pour célébrer notre histoire collective",
    cta: "Découvrir l'histoire",
    link: "/feed"
  },
  {
    image: kaolackMarche,
    title: "Modernisation du marché central",
    subtitle: "Projet de rénovation et d'amélioration des infrastructures commerciales",
    cta: "Voir les projets",
    link: "/kaolack-105"
  },
  {
    image: kaolackMosquee,
    title: "Patrimoine religieux valorisé",
    subtitle: "Programme de restauration des sites historiques et religieux",
    cta: "Explorer le patrimoine",
    link: "/kaolack-105/gallery"
  }
];

function SimpleSlider() {
  const [current, setCurrent] = useState(0);
  
  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Charger les slides depuis l'API
  const { data: apiSlides = [], isLoading } = useQuery({
    queryKey: ['home-slides'],
    queryFn: () => apiService.getSlides(),
  });

  // Utiliser les slides de l'API s'ils existent, sinon les slides par défaut
  const useApiSlides = apiSlides.length > 0;
  const slides = useApiSlides
    ? apiSlides.map((slide: any) => ({
        id: slide.id,
        image: slide.image || '',
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        bg: slide.bg || '',
        logo: slide.logo || false
      }))
    : defaultSlides;

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="relative h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] w-full overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-sm sm:text-base md:text-lg text-gray-600">Chargement des slides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] xl:h-[500px] w-full overflow-hidden group">
      {/* Background moderne avec dégradé animé */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-kaolack-green via-kaolack-green-light to-kaolack-orange opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Pattern moderne subtil - optimisé mobile */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Formes géométriques modernes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Particules animées optimisées */}
        <div className="absolute inset-0">
          {[...Array(isMobile ? 6 : 15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {slides.map((slide: any, idx: number) => (
        <motion.div
          key={slide.id || idx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: idx === current ? 1 : 0, 
            scale: idx === current ? 1 : 1.1 
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 ${idx === current ? 'z-10' : 'z-0'}`}
        >
          {/* Image d'arrière-plan avec effet moderne */}
          {slide.image && (
            <img 
              src={slide.image.startsWith('http') ? slide.image : `https://portail.kaolackcommune.sn${slide.image}`}
              alt={slide.title} 
              className="w-full h-full object-cover object-center opacity-85 mix-blend-overlay filter brightness-110" 
              onError={(e) => {
                console.error('Erreur de chargement image slide:', slide.image);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {/* Overlay gradient moderne */}
          <div className="absolute inset-0 bg-gradient-to-r from-kaolack-green/75 via-kaolack-green-light/55 to-transparent" />
          
          {/* Ajout d'un overlay moderne avec effet de verre */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          
          {/* Contenu du slide - Design moderne responsive */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: idx === current ? 0 : -50, opacity: idx === current ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute left-3 sm:left-4 md:left-6 lg:left-8 top-1/3 sm:top-1/3 md:top-1/3 text-white max-w-[95%] sm:max-w-md md:max-w-xl lg:max-w-2xl z-10"
          >
            {/* Logo 105 ans si activé */}
            {slide.logo && !('cta' in slide) && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-2 sm:mb-3 md:mb-4 flex justify-start"
              >
                <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md p-2 sm:p-3 md:p-4 border border-white/30 shadow-2xl ring-2 ring-white/10">
                  <Logo105 size="lg" variant="white-bg" className="drop-shadow-2xl h-12 w-auto sm:h-16 md:h-20 lg:h-24" animate={false} />
                </div>
              </motion.div>
            )}
            
            <motion.div className="space-y-1 sm:space-y-2 md:space-y-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black drop-shadow-2xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/95">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl drop-shadow-lg leading-relaxed text-white/90 max-w-lg"
                >
                  {slide.subtitle}
                </motion.p>
              )}
            </motion.div>
            
            {/* CTA moderne seulement pour les slides par défaut */}
            {'cta' in slide && slide.cta && slide.link && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-3 sm:mt-4 md:mt-6"
              >
                <Link to={slide.link} className="inline-block group">
                  <Button 
                    size={isMobile ? "sm" : "lg"} 
                    className="bg-white/95 backdrop-blur-sm text-kaolack-green font-bold shadow-2xl hover:bg-white hover:shadow-3xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg px-3 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 rounded-full border-2 border-white/40 ring-2 ring-white/20"
                  >
                    <span className="flex items-center gap-1 sm:gap-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      <span className="hidden xs:inline sm:inline">{slide.cta}</span>
                      <span className="xs:hidden sm:hidden">{isMobile ? "Voir" : "Découvrir"}</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ))}
      
      {/* Navigation dots modernes */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 md:gap-2 z-20">
          {slides.map((_: any, idx: number) => (
            <motion.button
              key={idx}
              whileHover={{ scale: isMobile ? 1.05 : 1.1 }}
              whileTap={{ scale: isMobile ? 0.95 : 0.9 }}
              onClick={() => setCurrent(idx)}
              className={cn(
                "w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 rounded-full border transition-all duration-300",
                idx === current 
                  ? "bg-white border-white shadow-lg shadow-white/50 scale-150" 
                  : "bg-white/20 border-white/40 hover:bg-white/40"
              )}
              aria-label={`Aller au slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Progress bar moderne */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-white to-white/80"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

const MainHome = () => {
  const interventionAreas = [
    {
      icon: Building2,
      title: "Urbanisme et Infrastructure",
      description: "Développement et modernisation des infrastructures urbaines de Kaolack",
      color: "green",
      gradient: "from-kaolack-green to-kaolack-green-light",
      stats: "15+ Projets",
      key: 1
    },
    {
      icon: TrendingUp,
      title: "Développement Économique",
      description: "Promotion de l'économie locale et soutien aux entreprises",
      color: "yellow",
      gradient: "from-kaolack-orange to-kaolack-gold",
      stats: "200+ Entreprises",
      key: 2
    },
    {
      icon: Landmark,
      title: "Culture et Patrimoine",
      description: "Préservation et valorisation du patrimoine culturel kaolackois",
      color: "red",
      gradient: "from-kaolack-gold to-kaolack-orange",
      stats: "105 Ans d'Histoire",
      key: 3
    },
    {
      icon: FileText,
      title: "Services aux Citoyens",
      description: "État civil, demandes de terrains et services administratifs",
      color: "green",
      gradient: "from-kaolack-green-light to-kaolack-green",
      stats: "24/7 Disponibilité",
      key: 4
    }
  ];

  const recentNews = [
    {
      id: 1,
      title: "Célébration des 105 ans de Kaolack",
      date: "Décembre 2025",
      description: "Lancement de la plateforme participative pour célébrer notre histoire collective",
      content: "Lancement de la plateforme participative pour célébrer notre histoire collective",
      excerpt: "Lancement de la plateforme participative pour célébrer notre histoire collective",
      category: "evenement",
      status: "published",
      image_url: kaolackHero,
      created_at: "2025-12-01T10:00:00Z",
      author: { id: 1, full_name: "Mairie de Kaolack" }
    },
    {
      id: 2,
      title: "Modernisation du marché central",
      date: "Novembre 2025",
      description: "Projet de rénovation et d'amélioration des infrastructures commerciales",
      content: "Projet de rénovation et d'amélioration des infrastructures commerciales",
      excerpt: "Projet de rénovation et d'amélioration des infrastructures commerciales",
      category: "economie",
      status: "published",
      image_url: kaolackMarche,
      created_at: "2025-11-15T14:30:00Z",
      author: { id: 1, full_name: "Mairie de Kaolack" }
    },
    {
      id: 3,
      title: "Patrimoine religieux valorisé",
      date: "Octobre 2025",
      description: "Programme de restauration des sites historiques et religieux",
      content: "Programme de restauration des sites historiques et religieux",
      excerpt: "Programme de restauration des sites historiques et religieux",
      category: "culture",
      status: "published",
      image_url: kaolackMosquee,
      created_at: "2025-10-20T09:15:00Z",
      author: { id: 1, full_name: "Mairie de Kaolack" }
    }
  ];

  // État pour les actualités dynamiques
  const [dynamicNews, setDynamicNews] = useState([]);
  const [newsError, setNewsError] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  
  // État pour les données du maire
  const [maireData, setMaireData] = useState({
    name: 'Serigne MBOUP',
    role: 'Maire de la Commune de Kaolack',
    message: `"Chères Kaolackoises, chers Kaolackois,
c'est un honneur de servir notre magnifique commune et d'accompagner sa transformation au quotidien. Ensemble, faisons rayonner Kaolack haut et fort !"`,
    imageUrl: mairePhoto
  });
  
  // Récupérer le contenu édité (titre/sous-titre) depuis le localStorage (CMS demo)
  const [homeContent, setHomeContent] = useState({
    title: "Commune de Kaolack",
    subtitle: "Au service des citoyens depuis 1920",
    image: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem('mainHomeContent');
    if (saved) {
      setHomeContent((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  // Charger les données du maire depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maire_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMaireData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données du maire:', error);
      }
    }
  }, []);

  // Charger les actualités depuis l'API avec retry
  useEffect(() => {
    const fetchNewsWithRetry = async (retries = 2) => {
      setIsLoadingNews(true);
      setNewsError(false);
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await apiService.getNews();
          // Prendre les 3 premières actualités publiées pour l'affichage
          setDynamicNews(response.news?.slice(0, 3) || []);
          setNewsError(false);
          break; // Success, exit retry loop
        } catch (error) {
          console.error(`Tentative ${attempt}/${retries} - Erreur lors du chargement des actualités:`, error);
          
          if (attempt === retries) {
            // Last attempt failed - utiliser les actualités par défaut
            console.log('📰 Utilisation des actualités par défaut');
            setDynamicNews(recentNews);
            setNewsError(false); // Ne pas montrer l'erreur, utiliser les défauts
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      setIsLoadingNews(false);
    };

    fetchNewsWithRetry();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero Section with Slider */}
        <section className="relative overflow-hidden">
          <SimpleSlider />
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 space-y-8 sm:space-y-12 md:space-y-16">
          {/* Axes d'intervention - Design moderne */}
          <section className="relative">
            {/* Background décoratif */}
            <div className="absolute inset-0 bg-gradient-to-br from-kaolack-green/5 via-transparent to-kaolack-orange/5 rounded-3xl" />
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-10 md:mb-14 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kaolack-green/10 border border-kaolack-green/20 mb-4">
                <Target className="h-4 w-4 text-kaolack-green" />
                <span className="text-sm font-semibold text-kaolack-green">Nos Priorités</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2 bg-gradient-to-r from-kaolack-green to-kaolack-orange bg-clip-text text-transparent">
                Nos Axes d'Intervention
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
                La Commune de Kaolack s'engage dans plusieurs domaines stratégiques pour améliorer la vie des citoyens et façonner l'avenir de notre ville
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {interventionAreas.map((area, index) => {
                // Définir les routes pour chaque axe d'intervention
                const getRouteForArea = (title: string) => {
                  switch (title) {
                    case "Urbanisme et Infrastructure":
                      return "/urbanisme-infrastructure";
                    case "Développement Économique":
                      return "/developpement-economique";
                    case "Culture et Patrimoine":
                      return "/culture-patrimoine";
                    case "Services aux Citoyens":
                      return "/services-citoyens";
                    default:
                      return "/catalogue-numerique";
                  }
                };

                return (
                  <motion.div
                    key={area.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={getRouteForArea(area.title)}>
                      <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 h-full">
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        
                        <CardHeader className="p-6 sm:p-8 relative z-10">
                          <div className="relative mb-4 sm:mb-6">
                            <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${area.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <area.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-kaolack-green transition-colors">
                              {area.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="h-px bg-gradient-to-r from-kaolack-green to-kaolack-orange flex-1" />
                              <span className="text-xs font-bold text-kaolack-green">{area.stats}</span>
                              <div className="h-px bg-gradient-to-r from-kaolack-orange to-kaolack-green flex-1" />
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 sm:p-8 pt-0 relative z-10">
                          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                            {area.description}
                          </p>
                          <div className="flex items-center text-kaolack-green font-semibold text-sm group-hover:text-kaolack-orange transition-colors">
                            <span>En savoir plus</span>
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                        
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-kaolack-green/10 rounded-bl-3xl" />
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Services de la Mairie - Design moderne */}
          <section className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-10 md:mb-14 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kaolack-orange/10 border border-kaolack-orange/20 mb-4">
                <Zap className="h-4 w-4 text-kaolack-orange" />
                <span className="text-sm font-semibold text-kaolack-orange">Services Essentiels</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2 bg-gradient-to-r from-kaolack-orange to-kaolack-gold bg-clip-text text-transparent">
                Services de la Mairie
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 leading-relaxed">
                Accédez rapidement aux services administratifs de la commune
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
              {/* Bureau économique local */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-3xl transition-all duration-400 bg-gradient-to-br from-white via-kaolack-green/5 to-kaolack-green/10 h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-kaolack-green/20 to-transparent rounded-full blur-2xl" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-kaolack-green to-kaolack-green-light opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-400" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-kaolack-green to-kaolack-green-light flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-400">
                        <Briefcase className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-kaolack-green transition-colors">Bureau Économique Local</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base mb-4 leading-relaxed">
                      Accompagnement et soutien aux entreprises locales, promotion de l'économie de Kaolack
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-kaolack-green group-hover:text-white group-hover:border-kaolack-green transition-all duration-400 font-semibold" 
                      asChild
                    >
                      <Link to="/bureau-economique" className="flex items-center justify-center gap-2">
                        <span>Accéder au service</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* État civil */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-3xl transition-all duration-400 bg-gradient-to-br from-white via-kaolack-orange/5 to-kaolack-orange/10 h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-kaolack-orange/20 to-transparent rounded-full blur-2xl" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-kaolack-orange to-kaolack-gold opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-400" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-kaolack-orange to-kaolack-gold flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-400">
                        <FileCheck className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-kaolack-orange transition-colors">État Civil</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base mb-4 leading-relaxed">
                      Actes de naissance, mariage, décès. Déclarations et copies d'actes d'état civil
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-kaolack-orange group-hover:text-white group-hover:border-kaolack-orange transition-all duration-400 font-semibold" 
                      asChild
                    >
                      <Link to="/etat-civil" className="flex items-center justify-center gap-2">
                        <span>Accéder au service</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Déposer un courrier */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-3xl transition-all duration-400 bg-gradient-to-br from-white via-blue-600/5 to-blue-600/10 h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-2xl" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-400" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-400">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Déposer un courrier</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base mb-4 leading-relaxed">
                      Accédez rapidement aux services administratifs de la commune
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-400 font-semibold" 
                      asChild
                    >
                      <Link to="/deposer-courrier" className="flex items-center justify-center gap-2">
                        <span>Accéder au service</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Affaires domaniales */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="sm:col-span-2 md:col-span-1"
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-3xl transition-all duration-400 bg-gradient-to-br from-white via-red-500/5 to-red-500/10 h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-400" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-400">
                        <Home className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">Affaires Domaniales</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base mb-4 leading-relaxed">
                      Gestion du domaine public, demandes de terrains, autorisations d'occupation
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all duration-400 font-semibold" 
                      asChild
                    >
                      <Link to="/affaires-domaniales" className="flex items-center justify-center gap-2">
                        <span>Accéder au service</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Carte de présentation du Maire - Design moderne */}
          <section className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-kaolack-green via-white to-kaolack-orange/20 border border-kaolack-green/20">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)`
                  }} />
                </div>
                
                <div className="relative p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 flex flex-col items-center"
                  >
                    <div className="relative">
                      {/* Badge décoratif */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-kaolack-orange rounded-full flex items-center justify-center shadow-lg">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      
                      {maireData.imageUrl ? (
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-kaolack-green to-kaolack-orange rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                          <img
                            src={maireData.imageUrl}
                            alt="Maire de Kaolack"
                            className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full object-cover shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-kaolack-green/20 to-kaolack-orange/20 flex items-center justify-center shadow-2xl border-4 border-white">
                          <span className="text-kaolack-green font-semibold text-sm">Photo</span>
                        </div>
                      )}
                    </div>
                    
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="mt-4 text-center"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-kaolack-green to-kaolack-orange text-white font-bold text-sm shadow-lg">
                        <Award className="h-4 w-4" />
                        Le Maire
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex-1 text-center md:text-left space-y-4"
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-kaolack-green to-kaolack-orange bg-clip-text text-transparent">
                        {maireData.name}
                      </h2>
                      <p className="text-kaolack-orange font-bold text-lg md:text-xl">
                        {maireData.role}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-kaolack-green/10 to-kaolack-orange/10 rounded-lg blur-xl" />
                      <p className="relative text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">
                        {maireData.message}
                      </p>
                    </div>
                    
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="pt-4"
                    >
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-gradient-to-r from-kaolack-green to-kaolack-orange text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-3 rounded-full"
                      >
                        <Link to="/mots-du-maire" className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Voir le mot du maire
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Actualités & Communiqués - Design moderne */}
          <section className="relative mb-8 sm:mb-10 md:mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-10 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kaolack-gold/10 border border-kaolack-gold/20 mb-4">
                <Globe className="h-4 w-4 text-kaolack-gold" />
                <span className="text-sm font-semibold text-kaolack-gold">Actualités</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2 bg-gradient-to-r from-kaolack-gold to-kaolack-orange bg-clip-text text-transparent">
                Actualités & Communiqués
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 leading-relaxed">
                Restez informé des dernières nouvelles de la commune
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {isLoadingNews ? (
                // Loading state moderne
                <>
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden border-0 shadow-lg">
                        <div className="aspect-video w-full bg-gradient-to-br from-kaolack-green/20 to-kaolack-orange/20 animate-pulse" />
                        <CardHeader className="p-6">
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </>
              ) : dynamicNews.length > 0 ? (
                dynamicNews.map((newsItem, index) => (
                  <motion.div
                    key={`news-${newsItem.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-400 bg-gradient-to-br from-white to-gray-50/50 h-full">
                      {/* Badge de catégorie */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                          newsItem.category === 'urgence' ? 'bg-red-500' :
                          newsItem.category === 'evenement' ? 'bg-purple-500' :
                          newsItem.category === 'annonce' ? 'bg-blue-500' :
                          newsItem.category === 'culture' ? 'bg-pink-500' :
                          newsItem.category === 'economie' ? 'bg-yellow-500' :
                          newsItem.category === 'social' ? 'bg-cyan-500' :
                          'bg-kaolack-green'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {newsItem.category || 'Actualité'}
                        </div>
                      </div>
                      
                      {newsItem.image_url && (
                        <div className="aspect-video w-full overflow-hidden relative">
                          <img 
                            src={newsItem.image_url} 
                            alt={newsItem.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                      )}
                      
                      <CardHeader className="p-6">
                        <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-kaolack-green transition-colors">
                          {newsItem.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                          {new Date(newsItem.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-0">
                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                          {newsItem.excerpt || (newsItem.content.length > 100 
                            ? newsItem.content.substring(0, 100) + '...' 
                            : newsItem.content)}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:bg-kaolack-green group-hover:text-white group-hover:border-kaolack-green transition-all duration-400 font-semibold" 
                          asChild
                        >
                          <Link to={`/actualites/${newsItem.id}`} className="flex items-center justify-center gap-2">
                            <span>Lire l'article</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                      
                      {/* Décoration coin */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-kaolack-green/10 rounded-bl-3xl" />
                    </Card>
                  </motion.div>
                ))
              ) : newsError ? (
                // Error state moderne
                <div className="col-span-full text-center py-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Impossible de charger les actualités
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Une erreur technique est survenue. Veuillez réessayer plus tard.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      Réessayer
                    </Button>
                  </motion.div>
                </div>
              ) : (
                // Empty state moderne
                <div className="col-span-full text-center py-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="w-16 h-16 bg-kaolack-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-kaolack-green" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Aucune actualité disponible
                    </h3>
                    <p className="text-muted-foreground">
                      Les actualités seront publiées ici dès qu'elles seront disponibles.
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-8 sm:mt-10 relative z-10"
            >
              <Button 
                variant="outline" 
                size="lg"
                className="group hover:bg-kaolack-orange hover:text-white hover:border-kaolack-orange transition-all duration-400 font-semibold px-8 py-3" 
                asChild
              >
                <Link to="/actualites" className="flex items-center gap-2">
                  <span>Voir toutes les actualités</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </section>

          {/* Réalisations phares - Design moderne */}
          <section className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-kaolack-green/10 via-kaolack-orange/5 to-kaolack-gold/10 border border-kaolack-green/20">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(251, 146, 60, 0.4) 0%, transparent 50%)`
                  }} />
                </div>
                
                <div className="relative p-8 sm:p-10 md:p-12 lg:p-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 sm:mb-12"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-kaolack-green/20 mb-4 shadow-lg">
                      <TrendingIcon className="h-4 w-4 text-kaolack-green" />
                      <span className="text-sm font-semibold text-kaolack-green">Réalisations</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2 bg-gradient-to-r from-kaolack-green via-kaolack-orange to-kaolack-gold bg-clip-text text-transparent">
                      Réalisations Phares
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 leading-relaxed max-w-2xl mx-auto">
                      Nos projets qui transforment Kaolack et façonnent l'avenir de notre commune
                    </p>
                  </motion.div>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className="group"
                    >
                      <div className="text-center p-6 sm:p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-kaolack-green/20 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-kaolack-green/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                          <div className="relative text-4xl sm:text-5xl md:text-6xl font-black text-kaolack-green">
                            105
                          </div>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ans d'Histoire</div>
                        <div className="text-muted-foreground text-sm sm:text-base font-medium">Célébration de notre patrimoine</div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className="group"
                    >
                      <div className="text-center p-6 sm:p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-kaolack-orange/20 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-kaolack-orange/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                          <div className="relative text-4xl sm:text-5xl md:text-6xl font-black text-kaolack-orange">
                            50+
                          </div>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Projets en Cours</div>
                        <div className="text-muted-foreground text-sm sm:text-base font-medium">Développement et modernisation</div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className="group sm:col-span-2 md:col-span-1"
                    >
                      <div className="text-center p-6 sm:p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-kaolack-gold/20 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-kaolack-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                          <div className="relative text-4xl sm:text-5xl md:text-6xl font-black text-kaolack-gold">
                            100K+
                          </div>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Citoyens</div>
                        <div className="text-muted-foreground text-sm sm:text-base font-medium">Au service de la communauté</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* CTA Section - Design moderne */}
          <section className="relative py-12 sm:py-16 md:py-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-kaolack-green via-kaolack-orange to-kaolack-gold shadow-2xl">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 4}s`
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative p-8 sm:p-12 md:p-16 lg:p-20 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
                      <Users className="h-4 w-4 text-white" />
                      <span className="text-sm font-bold text-white">Participatif</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                      Participez à la vie de votre commune
                    </h2>
                    
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto">
                      Découvrez le module "105 ans de Kaolack, ma fierté" - une plateforme participative 
                      pour partager vos histoires, témoignages et participer à la valorisation de notre patrimoine commun.
                    </p>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="pt-4"
                    >
                      <Button 
                        size="lg" 
                        className="bg-white text-kaolack-green font-black shadow-2xl hover:bg-white/90 hover:shadow-3xl hover:scale-105 transition-all duration-300 text-lg md:text-xl px-10 py-4 md:px-12 md:py-5 rounded-full"
                        asChild
                      >
                        <Link to="/kaolack-105" className="flex items-center gap-3">
                          <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
                          <span>Accéder au module 105 ans</span>
                          <ArrowRight className="h-6 w-6 md:h-7 md:w-7 group-hover:translate-x-2 transition-transform" />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer - Design moderne */}
      <footer className="relative bg-gradient-to-br from-kaolack-green via-kaolack-green-light to-kaolack-orange border-t border-kaolack-green/20 py-8 sm:py-10 md:py-12 mt-12 sm:mt-16 md:mt-20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative container text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-px bg-white/50" />
              <Star className="h-5 w-5 text-yellow-300" />
              <div className="w-8 h-px bg-white/50" />
            </div>
            
            <p className="text-white font-semibold text-sm sm:text-base">
              © 2025 Commune de Kaolack - Tous droits réservés
            </p>
            
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/10 blur-xl" />
              <p className="relative text-white/90 text-xs sm:text-sm italic px-4 py-2">
                "Une histoire à célébrer, une économie à développer, une fierté à exposer"
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <Globe className="h-3 w-3" />
                <span>Kaolack, Sénégal</span>
              </div>
              <div className="w-1 h-1 bg-white/30 rounded-full" />
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <Clock className="h-3 w-3" />
                <span>105 ans d'histoire</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
      
      {/* Bot d'histoire de Kaolack */}
      <KaolackHistoryBot />
    </div>
  );
};

export default MainHome;
