import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import EventBanner from "@/components/EventBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, FileText, Landmark, TrendingUp } from "lucide-react";
import { apiService } from "@/services/api";
import kaolackHero from "@/assets/kaolack-hero.jpg";
import kaolackMarche from "@/assets/kaolack-marche-vintage.jpg";
import kaolackMosquee from "@/assets/kaolack-mosquee-heritage.jpg";

// Slider simple (sans dépendance externe)
const slidesData = [
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
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slidesData.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      {slidesData.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-secondary/60 to-accent/60" />
          <div className="absolute left-8 top-1/3 text-white max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg mb-4">{slide.title}</h2>
            <p className="text-lg md:text-2xl drop-shadow mb-6">{slide.subtitle}</p>
            <Link to={slide.link} className="inline-block">
              <Button size="lg" className="bg-white/90 text-primary font-bold shadow-lg hover:bg-white">
                {slide.cta} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slidesData.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 ${idx === current ? 'bg-white border-primary' : 'bg-primary/30 border-white'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const MainHome = () => {
  const interventionAreas = [
    {
      icon: Building2,
      title: "Urbanisme et Infrastructure",
      description: "Développement et modernisation des infrastructures urbaines de Kaolack"
    },
    {
      icon: TrendingUp,
      title: "Développement Économique",
      description: "Promotion de l'économie locale et soutien aux entreprises"
    },
    {
      icon: Landmark,
      title: "Culture et Patrimoine",
      description: "Préservation et valorisation du patrimoine culturel kaolackois"
    },
    {
      icon: FileText,
      title: "Services aux Citoyens",
      description: "État civil, demandes de terrains et services administratifs"
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
      <EventBanner
        href="/kaolack-105"
        dismissible={true}
      />
      <main>
        {/* Hero Section with Slider */}
        <section className="relative h-[400px] overflow-hidden">
          <SimpleSlider />
        </section>

        <div className="container py-16 space-y-16">
          {/* Axes d'intervention */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos Axes d'Intervention
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                La Commune de Kaolack s'engage dans plusieurs domaines pour améliorer la vie des citoyens
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {interventionAreas.map((area, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <area.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{area.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Actualités récentes */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Actualités & Communiqués
              </h2>
              <p className="text-lg text-muted-foreground">
                Restez informé des dernières nouvelles de la commune
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {recentNews.map((news, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="text-sm text-primary font-semibold mb-2">{news.date}</div>
                    <CardTitle className="text-xl">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{news.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Actualités de la mairie */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Actualités de la Mairie
              </h2>
              <p className="text-lg text-muted-foreground">
                Restez informés des dernières nouvelles et annonces officielles
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <CardHeader>
                      <CardTitle className="text-lg">{newsItem.title}</CardTitle>
                      <CardDescription className={`text-sm ${
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
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {newsItem.excerpt || (newsItem.content.length > 100 
                          ? newsItem.content.substring(0, 100) + '...' 
                          : newsItem.content)}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/actualites/${newsItem.id}`}>
                          Lire l'article complet
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

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/actualites">
                  Voir toutes les actualités
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Réalisations phares */}
          <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Réalisations Phares
              </h2>
              <p className="text-lg text-muted-foreground">
                Nos projets qui transforment Kaolack
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">105</div>
                <div className="text-xl font-semibold mb-2">Ans d'Histoire</div>
                <div className="text-muted-foreground">Célébration de notre patrimoine</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-secondary mb-2">50+</div>
                <div className="text-xl font-semibold mb-2">Projets en Cours</div>
                <div className="text-muted-foreground">Développement et modernisation</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">100K+</div>
                <div className="text-xl font-semibold mb-2">Citoyens</div>
                <div className="text-muted-foreground">Au service de la communauté</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Participez à la vie de votre commune
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Découvrez le module "105 ans de Kaolack, ma fierté" - une plateforme participative 
                pour partager vos histoires, témoignages et participer à la valorisation de notre patrimoine commun.
              </p>
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/kaolack-105">
                  Accéder au module 105 ans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8 mt-16">
        <div className="container text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 Commune de Kaolack - Tous droits réservés
          </p>
          <p className="text-xs mt-2">
            "Une histoire à célébrer, une économie à développer, une fierté à exposer"
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainHome;
