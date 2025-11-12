import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const MaireMessage = () => {
  // Vous pouvez remplacer ces données avec une vraie photo et discours du maire
  const maireData = {
    nom: "Honorable Maire de Kaolack",
    titre: "Maire de la Commune de Kaolack",
    photo: "https://via.placeholder.com/400x500/1f2937/ffffff?text=Photo+du+Maire",
    discours: `Chères et chers concitoyens de Kaolack,

C'est avec une immense fierté et une profonde émotion que je m'adresse à vous aujourd'hui, en ce moment historique où notre belle ville de Kaolack célèbre ses 105 ans d'existence.

105 ans ! Une histoire riche, dense et mouvementée. 105 ans de luttes, de résilience, de progrès et de solidarité. 105 ans qui ont façonné l'identité de notre communauté et posé les fondations d'un avenir prometteur.

Kaolack, c'est bien plus qu'une simple localité. C'est le cœur battant du commerce sénégalais, un carrefour où se rencontrent les cultures, un symbole de l'entrepreneuriat africain. Du port aux marchés, des usines de transformation aux champs d'arachides, notre économie a toujours été le moteur du développement régional et national.

Mais Kaolack, c'est surtout ses hommes et ses femmes. C'est vous ! C'est votre travail acharné, votre créativité, votre esprit d'initiative qui font la grandeur de notre ville. C'est votre solidarité communautaire et votre engagement envers l'intérêt général.

Cette plateforme digitale que nous lançons aujourd'hui est un symbole de cette transition que nous amorcez. Elle est un espace où nous pouvons tous contribuer à valoriser notre patrimoine, à partager nos témoignages et à construire ensemble l'histoire de demain.

Je vous invite donc à participer activement à cette belle initiative. Partagez vos histoires, vos photos, vos aspirations. Connectez-vous avec vos concitoyens. Ensemble, faisons de ces 105 ans un moment de réflexion et de projection vers un avenir encore plus brillant.

Que Kaolack continue à être un lieu d'excellence, d'innovation et de progrès.

Vive Kaolack ! Vive le Sénégal !

Respectueusement vôtre,

Le Maire de Kaolack
Kaolack, novembre 2025`,
    citations: [
      {
        texte: "Une histoire à célébrer, une économie à développer, une fierté à exposer",
        auteur: "105 ans de Kaolack"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-8">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Mots du Maire</h1>
          <p className="text-xl text-muted-foreground">
            Un message de nos autorités pour la célébration des 105 ans de Kaolack
          </p>
        </div>

        {/* Contenu Principal */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Photo et Infos */}
            <div className="md:col-span-1">
              <Card className="overflow-hidden sticky top-20">
                <div className="relative">
                  <img 
                    src={maireData.photo} 
                    alt={maireData.nom}
                    className="w-full h-96 object-cover"
                  />
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{maireData.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{maireData.titre}</p>
                </CardHeader>
              </Card>
            </div>

            {/* Discours */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Quote className="h-6 w-6 text-primary flex-shrink-0 mt-2" />
                    <CardTitle>Message du Maire</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose prose-sm max-w-none">
                    {maireData.discours.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-base leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Citations */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Notre Devise</h2>
            {maireData.citations.map((citation, index) => (
              <Card key={index} className="border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Quote className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">
                        "{citation.texte}"
                      </p>
                      <p className="text-sm text-muted-foreground">— {citation.auteur}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mt-16 p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Rejoignez le Mouvement</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Participez activement à la célébration des 105 ans de Kaolack en partageant vos histoires et vos contributions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/feed">
                  Partager mon histoire
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaireMessage;
