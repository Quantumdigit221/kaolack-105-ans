import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, TrendingUp, Landmark, FileText, Briefcase, FileCheck, Home } from "lucide-react";
import { apiService } from "@/services/api";
import { useQuery } from '@tanstack/react-query';
import kaolackHero from "@/assets/kaolack-hero.jpg";
import kaolackMarche from "@/assets/kaolack-marche-vintage.jpg";
import kaolackMosquee from "@/assets/kaolack-mosquee-heritage.jpg";
import { KaolackHistoryBot } from "@/components/KaolackHistoryBot";

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
      <div className="relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-sm sm:text-base md:text-lg text-gray-600">Chargement des slides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] w-full overflow-hidden">
      {slides.map((slide: any, idx: number) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-700 ${slide.bg || ''} ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Image d'arrière-plan */}
          {slide.image && (
            <img 
              src={slide.image.startsWith('http') ? slide.image : `https://portail.kaolackcommune.sn${slide.image}`}
              alt={slide.title} 
              className="w-full h-full object-cover object-center" 
              onError={(e) => {
                console.error('Erreur de chargement image slide:', slide.image);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {/* Overlay gradient si pas d'image ou pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-secondary/60 to-accent/60" />
          
          {/* Contenu du slide - Responsive */}
          <div className="absolute left-4 sm:left-6 md:left-8 lg:left-12 top-1/4 sm:top-1/3 md:top-1/3 text-white max-w-[90%] sm:max-w-md md:max-w-xl lg:max-w-2xl z-10 px-2 sm:px-0">
            {/* Logo 105 ans si activé (pour les slides de l'API) */}
            {slide.logo && !('cta' in slide) && (
              <div className="mb-3 sm:mb-4 md:mb-6 flex justify-start">
                <div className="rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm p-2 sm:p-2.5 md:p-3">
                  <Logo105 size="xl" variant="white-bg" className="drop-shadow-lg h-16 w-auto sm:h-20 md:h-24 lg:h-28" animate={false} />
                </div>
              </div>
            )}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold drop-shadow-lg mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ textShadow: '0 2px 8px #000' }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl drop-shadow mb-3 sm:mb-4 md:mb-6 leading-relaxed" style={{ textShadow: '0 2px 8px #000' }}>
                {slide.subtitle}
              </p>
            )}
            {/* CTA seulement pour les slides par défaut (qui ont une propriété cta) */}
            {'cta' in slide && slide.cta && slide.link && (
              <Link to={slide.link} className="inline-block">
                <Button size="sm" className="sm:size-default md:size-lg bg-white/90 text-primary font-bold shadow-lg hover:bg-white text-xs sm:text-sm md:text-base">
                  <span className="hidden sm:inline">{slide.cta}</span>
                  <span className="sm:hidden">Voir</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ))}
      {/* Navigation dots - Responsive */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all ${idx === current ? 'bg-white border-primary scale-110' : 'bg-primary/30 border-white'}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const MainHome = () => {
  const interventionAreas = [
    {
      icon: Building2,
      title: "Urbanisme et Infrastructure",
      description: "Développement et modernisation des infrastructures urbaines de Kaolack",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Développement Économique",
      description: "Promotion de l'économie locale et soutien aux entreprises",
      color: "yellow"
    },
    {
      icon: Landmark,
      title: "Culture et Patrimoine",
      description: "Préservation et valorisation du patrimoine culturel kaolackois",
      color: "red"
    },
    {
      icon: FileText,
      title: "Services aux Citoyens",
      description: "État civil, demandes de terrains et services administratifs",
      color: "green"
    }
  ];

  const recentNews = [
    {
      title: "Célébration des 105 ans de Kaolack",
      date: "Décembre 2025",
      description: "Lancement de la plateforme participative pour célébrer notre histoire collective",
      image: kaolackHero
    },
    {
      title: "Modernisation du marché central",
      date: "Novembre 2025",
      description: "Projet de rénovation et d'amélioration des infrastructures commerciales",
      image: kaolackMarche
    },
    {
      title: "Patrimoine religieux valorisé",
      date: "Octobre 2025",
      description: "Programme de restauration des sites historiques et religieux",
      image: kaolackMosquee
    }
  ];

  // État pour les actualités dynamiques
  const [dynamicNews, setDynamicNews] = useState([]);
  
  // État pour les données du maire
  const [maireData, setMaireData] = useState({
    name: 'Mamadou Ndiaye',
    role: 'Maire de la Commune de Kaolack',
    message: `"Chères Kaolackoises, chers Kaolackois,
c'est un honneur de servir notre magnifique commune et d'accompagner sa transformation au quotidien. Ensemble, faisons rayonner Kaolack haut et fort !"`,
    imageUrl: ''
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

  // Charger les actualités depuis l'API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiService.getNews();
        // Prendre les 3 premières actualités publiées pour l'affichage
        setDynamicNews(response.news.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        // En cas d'erreur, garder un tableau vide
        setDynamicNews([]);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero Section with Slider */}
        <section className="relative overflow-hidden">
          <SimpleSlider />
        </section>

        <div className="container py-8 sm:py-12 md:py-16 space-y-8 sm:space-y-12 md:space-y-16 px-4 sm:px-6">
          {/* Axes d'intervention */}
          <section>
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
                Nos Axes d'Intervention
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                La Commune de Kaolack s'engage dans plusieurs domaines pour améliorer la vie des citoyens
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {interventionAreas.map((area, index) => {
                const colorClasses = {
                  green: "bg-green-500 text-white",
                  yellow: "bg-yellow-500 text-white",
                  red: "bg-red-500 text-white"
                };
                const iconColor = colorClasses[area.color as keyof typeof colorClasses] || "bg-green-500 text-white";
                
                return (
                  <Link to="/catalogue-numerique">
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="p-4 sm:p-6">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${iconColor} flex items-center justify-center mb-3 sm:mb-4`}>
                          <area.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl">{area.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <p className="text-muted-foreground text-sm sm:text-base">{area.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Services de la Mairie */}
          <section>
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
                Services de la Mairie
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Accédez rapidement aux services administratifs de la commune
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Bureau économique local */}
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2">Bureau Économique Local</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base mb-3 sm:mb-4">
                    Accompagnement et soutien aux entreprises locales, promotion de l'économie de Kaolack
                  </CardDescription>
                  <Button variant="outline" size="sm" className="sm:size-default w-full group-hover:bg-primary group-hover:text-white transition-colors text-xs sm:text-sm" asChild>
                    <Link to="/bureau-economique">
                      <span className="hidden sm:inline">Accéder au service</span>
                      <span className="sm:hidden">Accéder</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* État civil */}
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <FileCheck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2">État Civil</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base mb-3 sm:mb-4">
                    Actes de naissance, mariage, décès. Déclarations et copies d'actes d'état civil
                  </CardDescription>
                  <Button variant="outline" size="sm" className="sm:size-default w-full group-hover:bg-primary group-hover:text-white transition-colors text-xs sm:text-sm" asChild>
                    <Link to="/etat-civil">
                      <span className="hidden sm:inline">Accéder au service</span>
                      <span className="sm:hidden">Accéder</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Déposer un courrier */}
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2">Déposer un courrier</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base mb-3 sm:mb-4">
                    Accédez rapidement aux services administratifs de la commune
                  </CardDescription>
                  <Button variant="outline" size="sm" className="sm:size-default w-full group-hover:bg-primary group-hover:text-white transition-colors text-xs sm:text-sm" asChild>
                    <Link to="/deposer-courrier">
                      <span className="hidden sm:inline">Accéder au service</span>
                      <span className="sm:hidden">Accéder</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Affaires domaniales */}
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group sm:col-span-2 md:col-span-1">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-red-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Home className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2">Affaires Domaniales</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base mb-3 sm:mb-4">
                    Gestion du domaine public, demandes de terrains, autorisations d'occupation
                  </CardDescription>
                  <Button variant="outline" size="sm" className="sm:size-default w-full group-hover:bg-primary group-hover:text-white transition-colors text-xs sm:text-sm" asChild>
                    <Link to="/affaires-domaniales">
                      <span className="hidden sm:inline">Accéder au service</span>
                      <span className="sm:hidden">Accéder</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Carte de présentation du Maire */}
          <section>
            <div className="max-w-3xl mx-auto my-4 sm:my-6 md:my-8 py-6 sm:py-8 md:py-10 lg:py-14 px-4 sm:px-6 md:px-10 rounded-2xl sm:rounded-3xl shadow-lg bg-gradient-to-br from-blue-50 via-white to-accent/10 border flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
              <div className="flex-shrink-0 flex flex-col items-center">
                {maireData.imageUrl && (
                  <img
                    src={maireData.imageUrl}
                    alt="Maire de Kaolack"
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-lg border-2 sm:border-4 border-primary"
                    onError={(e) => {
                      // Masquer l'image si elle ne charge pas
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                {!maireData.imageUrl && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gray-200 flex items-center justify-center shadow-lg border-2 sm:border-4 border-primary">
                    <span className="text-gray-400 text-xs sm:text-sm">Photo</span>
                  </div>
                )}
                <span className="font-semibold text-primary mt-2 sm:mt-3 md:mt-4 px-3 sm:px-4 py-1 bg-primary/10 rounded-full text-center text-xs sm:text-sm">Le Maire</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-gray-900">{maireData.name}</h2>
                <p className="text-muted-foreground mb-2 sm:mb-3 md:mb-4 font-medium text-sm sm:text-base">{maireData.role}</p>
                <p className="mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg whitespace-pre-line">
                  {maireData.message}
                </p>
                <Button asChild size="sm" className="sm:size-default md:size-lg text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-7">
                  <Link to="/mots-du-maire">Voir le mot du maire</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Actualités & Communiqués */}
          <section className="mb-8 sm:mb-10 md:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
                Actualités & Communiqués
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Restez informé des dernières nouvelles de la commune
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {dynamicNews.length > 0 ? (
                dynamicNews.map((newsItem) => (
                  <Card key={newsItem.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {newsItem.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={newsItem.image_url} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">{newsItem.title}</CardTitle>
                      <CardDescription className={`text-xs sm:text-sm ${
                        newsItem.category === 'urgence' ? 'text-red-600' :
                        newsItem.category === 'evenement' ? 'text-purple-600' :
                        newsItem.category === 'annonce' ? 'text-blue-600' :
                        newsItem.category === 'culture' ? 'text-pink-600' :
                        newsItem.category === 'economie' ? 'text-yellow-600' :
                        newsItem.category === 'social' ? 'text-cyan-600' :
                        'text-green-600'
                      }`}>
                        {newsItem.category || 'Actualité'} • {new Date(newsItem.created_at).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">
                        {newsItem.excerpt || (newsItem.content.length > 100 
                          ? newsItem.content.substring(0, 100) + '...' 
                          : newsItem.content)}
                      </p>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                        <Link to={`/actualites/${newsItem.id}`}>
                          Lire l'article
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Fallback si aucune actualité n'est disponible
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Aucune actualité disponible pour le moment.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Les actualités seront publiées ici dès qu'elles seront disponibles.
                  </p>
                </div>
              )}
            </div>
            <div className="text-center mt-6 sm:mt-8">
              <Button variant="outline" size="sm" className="sm:size-default text-xs sm:text-sm md:text-base" asChild>
                <Link to="/actualites">
                  Voir toutes les actualités
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Réalisations phares */}
          <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
                Réalisations Phares
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Nos projets qui transforment Kaolack
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">105</div>
                <div className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Ans d'Histoire</div>
                <div className="text-muted-foreground text-sm sm:text-base">Célébration de notre patrimoine</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-secondary mb-1 sm:mb-2">50+</div>
                <div className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Projets en Cours</div>
                <div className="text-muted-foreground text-sm sm:text-base">Développement et modernisation</div>
              </div>
              <div className="p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-1 sm:mb-2">100K+</div>
                <div className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Citoyens</div>
                <div className="text-muted-foreground text-sm sm:text-base">Au service de la communauté</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-8 sm:py-10 md:py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6">
                Participez à la vie de votre commune
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-7 md:mb-8">
                Découvrez le module "105 ans de Kaolack, ma fierté" - une plateforme participative 
                pour partager vos histoires, témoignages et participer à la valorisation de notre patrimoine commun.
              </p>
              <Button size="sm" className="sm:size-default md:size-lg text-xs sm:text-sm md:text-lg px-4 sm:px-6 md:px-8" asChild>
                <Link to="/kaolack-105">
                  Accéder au module 105 ans
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-6 sm:py-8 mt-8 sm:mt-12 md:mt-16">
        <div className="container text-center text-muted-foreground px-4">
          <p className="text-xs sm:text-sm">
            © 2025 Commune de Kaolack - Tous droits réservés
          </p>
          <p className="text-xs mt-2 px-2">
            "Une histoire à célébrer, une économie à développer, une fierté à exposer"
          </p>
        </div>
      </footer>
      
      {/* Bot d'histoire de Kaolack */}
      <KaolackHistoryBot />
    </div>
  );
};

export default MainHome;
