import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users2, Briefcase, ExternalLink } from "lucide-react";

const Economy = () => {
  const sectors = [
    {
      icon: Building2,
      title: "Commerce et Agroalimentaire",
      description: "Leader dans la transformation et commercialisation de l'arachide",
      companies: ["SONACOS", "Diverses usines de transformation"],
    },
    {
      icon: TrendingUp,
      title: "Port et Logistique",
      description: "Infrastructure portuaire majeure pour le commerce fluvial",
      companies: ["Port autonome de Kaolack", "Sociétés de transport"],
    },
    {
      icon: Users2,
      title: "Artisanat et Culture",
      description: "Production artisanale et textile traditionnelle",
      companies: ["Coopératives artisanales", "Ateliers de tissage"],
    },
  ];

  const initiatives = [
    {
      title: "Zone industrielle de Kaolack",
      description: "Développement d'une zone industrielle moderne pour attirer les investissements",
      status: "En cours",
    },
    {
      title: "Marché central rénové",
      description: "Modernisation du marché central pour améliorer les conditions de commerce",
      status: "Planifié",
    },
    {
      title: "Incubateur d'entreprises",
      description: "Soutien aux jeunes entrepreneurs et startups locales",
      status: "En développement",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Kaolack105Navigation />
      
      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Économie Locale
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Vitrine des entreprises, initiatives et projets qui font la fierté économique de Kaolack
          </p>
        </div>

        {/* Key Sectors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Secteurs clés</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sectors.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle>{sector.title}</CardTitle>
                    <CardDescription>{sector.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Acteurs principaux :</p>
                      <ul className="space-y-1">
                        {sector.companies.map((company, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {company}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Initiatives */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Projets et Initiatives</h2>
          <div className="space-y-4">
            {initiatives.map((initiative, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{initiative.title}</CardTitle>
                    <CardDescription className="mt-2">{initiative.description}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    initiative.status === "En cours" 
                      ? "bg-green-100 text-green-800" 
                      : initiative.status === "Planifié"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {initiative.status}
                  </span>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Investment Opportunities */}
        <section className="mb-16">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Opportunités d'investissement</CardTitle>
              </div>
              <CardDescription>
                Kaolack offre un potentiel économique important dans plusieurs secteurs stratégiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Agroalimentaire</h4>
                  <p className="text-sm text-muted-foreground">
                    Transformation et valorisation des produits agricoles locaux
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Logistique</h4>
                  <p className="text-sm text-muted-foreground">
                    Infrastructure portuaire et transport fluvial
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Tourisme culturel</h4>
                  <p className="text-sm text-muted-foreground">
                    Valorisation du patrimoine historique et religieux
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Technologies</h4>
                  <p className="text-sm text-muted-foreground">
                    Digitalisation et innovation pour le développement local
                  </p>
                </div>
              </div>
              <Button className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Contactez-nous pour plus d'informations
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes entrepreneur à Kaolack ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Faites connaître votre entreprise ou projet sur cette plateforme et bénéficiez d'une visibilité 
            auprès de la diaspora et des investisseurs potentiels.
          </p>
          <Button size="lg">
            Inscrire mon entreprise
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Economy;