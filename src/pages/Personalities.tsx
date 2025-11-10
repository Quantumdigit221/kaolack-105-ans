import { useState } from "react";
import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Award, Heart, BookOpen } from "lucide-react";
import { toast } from "sonner";
import personnalite1 from "@/assets/personnalite-politique-1.jpg";
import personnalite2 from "@/assets/personnalite-politique-2.jpg";

const Personalities = () => {
  const [open, setOpen] = useState(false);

  const personalities = [
    {
      id: 1,
      name: "Moustapha Niasse",
      category: "Politique",
      role: "Ancien Premier Ministre et Président de l'Assemblée Nationale",
      description: "Figure politique majeure du Sénégal, né à Keur Madiabel (Kaolack) en 1939. A occupé les plus hautes fonctions de l'État sénégalais.",
      image: personnalite1,
      contributions: [
        "Premier Ministre (2000-2001, 2012-2013)",
        "Président de l'Assemblée nationale (2012-2022)",
        "Ambassadeur de l'Alliance des Civilisations de l'ONU",
      ],
      votes: 245,
    },
    {
      id: 2,
      name: "El Hadji Ibrahima Niasse",
      category: "Religion",
      role: "Guide religieux et fondateur du Faydha Tijaniyya",
      description: "Figure religieuse majeure (1900-1975), fondateur du mouvement Faydha Tijaniyya qui compte des millions d'adeptes à travers le monde.",
      image: personnalite2,
      contributions: [
        "Fondateur du Faydha Tijaniyya",
        "Rayonnement international de l'Islam soufi",
        "Influence spirituelle sur des millions de fidèles",
      ],
      votes: 312,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Merci pour votre proposition ! Elle sera examinée par nos équipes.");
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Kaolack105Navigation />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold mb-2">Galerie des Personnalités</h1>
            <p className="text-muted-foreground">
              Découvrez les figures qui ont marqué l'histoire de Kaolack
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Proposer une personnalité
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Proposer une personnalité à honorer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" required placeholder="Ex: Moustapha Niasse" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Domaine</Label>
                  <Input id="category" required placeholder="Ex: Politique, Religion, Culture..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Fonction principale</Label>
                  <Input id="role" required placeholder="Ex: Ancien Premier Ministre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Pourquoi mérite-t-elle d'être honorée ?</Label>
                  <Textarea 
                    id="description" 
                    required 
                    placeholder="Décrivez les contributions et l'impact de cette personnalité..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Soumettre la proposition
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {personalities.map((person) => (
            <Card key={person.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold">{person.category}</span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">{person.name}</CardTitle>
                <CardDescription className="text-base">{person.role}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{person.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Contributions principales</span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {person.contributions.map((contribution, index) => (
                      <li key={index} className="text-sm text-muted-foreground list-disc">
                        {contribution}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Voter ({person.votes})
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Lire plus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Box */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border">
          <h3 className="text-xl font-bold mb-3">Participez à la sélection</h3>
          <p className="text-muted-foreground mb-4">
            Dans le cadre des festivités des 105 ans de Kaolack, nous constituons une galerie des personnalités 
            qui ont marqué l'histoire de notre ville. Vous pouvez proposer des noms et voter pour les personnalités 
            que vous souhaitez voir honorées.
          </p>
          <p className="text-sm text-muted-foreground italic">
            "Une histoire à célébrer, une économie à développer, une fierté à exposer : 105 ans de Kaolack, ma fierté !"
          </p>
        </div>
      </main>
    </div>
  );
};

export default Personalities;