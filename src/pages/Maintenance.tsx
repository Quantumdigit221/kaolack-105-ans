import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                <Construction className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">Service en Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Le service d'état civil est actuellement en cours de modernisation.
              </p>
              <p className="text-muted-foreground">
                Nous mettons tout en œuvre pour vous offrir une meilleure expérience. 
                Ce service sera bientôt disponible avec de nouvelles fonctionnalités.
              </p>
              <div className="pt-4">
                <p className="text-sm font-semibold mb-2">En attendant, vous pouvez :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vous rendre directement à la mairie</li>
                  <li>• Appeler nos services au : +221 XX XXX XX XX</li>
                  <li>• Envoyer un email à : etatcivil@kaolack.sn</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;
