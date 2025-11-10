import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Award } from "lucide-react";

const Timeline = () => {
  const events = [
    {
      year: "1920",
      title: "Création de la Commune de Kaolack",
      description: "Naissance officielle de la Commune de Kaolack, marquant le début d'une histoire riche.",
      icon: MapPin,
      category: "Fondation",
    },
    {
      year: "1940-1960",
      title: "L'âge d'or du port arachidier",
      description: "Kaolack devient le premier port arachidier du Sénégal, pilier de l'économie nationale.",
      icon: Award,
      category: "Économie",
    },
    {
      year: "1950-1975",
      title: "El Hadji Ibrahima Niasse et le rayonnement religieux",
      description: "Fondation du mouvement Faydha Tijaniyya qui rayonne à travers le monde musulman.",
      icon: Users,
      category: "Religion",
    },
    {
      year: "1980-2000",
      title: "Moustapha Niasse et l'essor politique",
      description: "Kaolack produit des figures politiques majeures qui influencent la nation sénégalaise.",
      icon: Award,
      category: "Politique",
    },
    {
      year: "2000-2020",
      title: "Modernisation et développement urbain",
      description: "Transformation urbaine avec de nouvelles infrastructures et projets de développement.",
      icon: MapPin,
      category: "Développement",
    },
    {
      year: "2025",
      title: "105 ans de Kaolack, ma fierté !",
      description: "Célébration de 105 ans d'histoire, de culture et de fierté collective.",
      icon: Calendar,
      category: "Anniversaire",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Kaolack105Navigation />
      
      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-full">
            <span className="text-white font-semibold">1920 - 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            105 ans d'histoire
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les moments clés qui ont façonné l'identité de Kaolack
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={index} className="relative pl-20">
                    {/* Icon Circle */}
                    <div className="absolute left-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Event Card */}
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-primary">{event.year}</span>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/20 text-secondary-foreground">
                            {event.category}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <h2 className="text-3xl font-bold mb-4">
            Contribuez à l'histoire de Kaolack
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Vous avez des photos, témoignages ou anecdotes sur l'histoire de Kaolack ? 
            Partagez-les avec la communauté !
          </p>
          <a href="/feed" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Partager mon histoire
          </a>
        </div>
      </main>
    </div>
  );
};

export default Timeline;