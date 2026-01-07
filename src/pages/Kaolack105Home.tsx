import { Link } from "react-router-dom";
import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import Kaolack105Slides from "@/components/Kaolack105Slides";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Image, TrendingUp, MessageSquare, Calendar } from "lucide-react";
import kaolackHero from "@/assets/kaolack-hero.jpg";
import community from "@/assets/community.jpg";
import { KaolackHistoryBot } from "@/components/KaolackHistoryBot";

const Kaolack105Home = () => {
  const modules = [
    {
      icon: Clock,
      title: "Chronologie Historique",
      description: "Découvrez les moments clés qui ont façonné l'identité de Kaolack depuis 1920",
      link: "/kaolack-105/timeline",
      color: "from-primary to-primary/80"
    },
    {
      icon: Users,
      title: "Galerie des Personnalités",
      description: "Honorez les figures qui ont marqué l'histoire de notre ville",
      link: "/kaolack-105/personalities",
      color: "from-secondary to-secondary/80"
    },
    {
      icon: MessageSquare,
      title: "Fil d'Actualité",
      description: "Partagez vos témoignages, photos et anecdotes avec la communauté",
      link: "/kaolack-105/feed",
      color: "from-accent to-accent/80"
    },
    {
      icon: Image,
      title: "Galerie Photos",
      description: "Explorez les images d'archives et contemporaines de Kaolack",
      link: "/kaolack-105/gallery",
      color: "from-primary to-secondary"
    },
    {
      icon: TrendingUp,
      title: "Économie Locale",
      description: "Découvrez les opportunités et le dynamisme économique de Kaolack",
      link: "/kaolack-105/economy",
      color: "from-secondary to-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Kaolack105Navigation />
      <div className="container py-8">
        <Kaolack105Slides />
      </div>
      <main>

        <div className="container py-16 space-y-16">
          {/* Introduction */}
          <section className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bienvenue sur la plateforme participative
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Dans le cadre de la célébration des 105 ans de Kaolack, nous vous invitons à participer 
              activement à la valorisation de notre patrimoine commun. Partagez vos témoignages, 
              découvrez notre histoire, et contribuez à l'écriture de notre avenir.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="text-3xl font-bold text-primary mb-2">Participez</div>
                <p className="text-muted-foreground">Partagez vos histoires et photos</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="text-3xl font-bold text-secondary mb-2">Découvrez</div>
                <p className="text-muted-foreground">Explorez notre riche patrimoine</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5">
                <div className="text-3xl font-bold text-accent mb-2">Connectez</div>
                <p className="text-muted-foreground">Rejoignez la communauté</p>
              </div>
            </div>
          </section>

          {/* Modules */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explorez les Différents Modules
              </h2>
              <p className="text-lg text-muted-foreground">
                Chaque module vous permet de découvrir un aspect de Kaolack
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <Link key={index} to={module.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                        <module.icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Community Section */}
          <section className="relative overflow-hidden rounded-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${community})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80" />
            </div>
            
            <div className="relative p-12 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Contribuez à l'Histoire de Kaolack
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
                Vous avez des photos, témoignages ou anecdotes sur l'histoire de Kaolack ? 
                Votre participation enrichit notre mémoire collective et permet aux générations futures 
                de découvrir notre patrimoine.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/kaolack-105/feed">
                  Partager Mon Histoire
                </Link>
              </Button>
            </div>
          </section>

          {/* Statistics */}
          <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ensemble, Célébrons Kaolack
              </h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">105</div>
                <div className="text-lg font-semibold">Années d'Histoire</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-secondary mb-2">1000+</div>
                <div className="text-lg font-semibold">Photos d'Archives</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">50+</div>
                <div className="text-lg font-semibold">Personnalités Honorées</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">∞</div>
                <div className="text-lg font-semibold">Fierté Collective</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Bot d'histoire de Kaolack */}
      <KaolackHistoryBot />
    </div>
  );
};

export default Kaolack105Home;
