import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, User } from "lucide-react";
import { toast } from "sonner";

interface CatalogueItem {
  id: number;
  title: string;
  personality: string;
  description: string;
  pdf_url: string;
  created_at: string;
}

const CatalogueNumerique = () => {
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        // Temporairement, données de démonstration
        // TODO: Remplacer par appel API réel
        const demoData: CatalogueItem[] = [
          {
            id: 1,
            title: "Mamadou Ndiaye",
            personality: "Mamadou Ndiaye",
            description: "Figure emblématique de la politique kaolackoise, maire de 1978 à 1990.",
            pdf_url: "/uploads/catalogue/mamadou-ndiaye.pdf",
            created_at: "2025-01-10"
          },
          {
            id: 2,
            title: "Aïssa Touré",
            personality: "Aïssa Touré",
            description: "Pionnière de l'éducation féminine à Kaolack, fondatrice de la première école pour filles.",
            pdf_url: "/uploads/catalogue/aissa-toure.pdf",
            created_at: "2025-01-09"
          },
          {
            id: 3,
            title: "Cheikh Anta Diop",
            personality: "Cheikh Anta Diop",
            description: "Philosophe et savant kaolackois, connu pour ses travaux sur l'identité africaine.",
            pdf_url: "/uploads/catalogue/cheikh-anta-diop.pdf",
            created_at: "2025-01-08"
          }
        ];
        
        setCatalogueItems(demoData);
        setFilteredItems(demoData);
      } catch (error) {
        console.error("Erreur lors du chargement du catalogue:", error);
        toast.error("Impossible de charger le catalogue numérique");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, []);

  useEffect(() => {
    const filtered = catalogueItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.personality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, catalogueItems]);

  const handleDownload = (item: CatalogueItem) => {
    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = item.pdf_url;
    link.target = '_blank';
    link.download = `${item.personality.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Téléchargement de ${item.personality} démarré`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Chargement du catalogue...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8 px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-kaolack-green via-kaolack-gold to-kaolack-orange bg-clip-text text-transparent">
            Catalogue Numérique
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les personnalités qui ont marqué l'histoire de Kaolack à travers notre bibliothèque numérique
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher une personnalité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Grille des personnalités */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "Aucun résultat trouvé" : "Aucune personnalité disponible"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Essayez d'autres termes de recherche" 
                : "Le catalogue est en cours de remplissage"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-kaolack-green/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-kaolack-green" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.personality}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4 line-clamp-3">
                    {item.description}
                  </CardDescription>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(item)}
                      className="flex-1"
                      variant="default"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(item.pdf_url, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Retour vers l'accueil */}
        <div className="text-center mt-12">
          <Link to="/">
            <Button variant="outline">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CatalogueNumerique;
