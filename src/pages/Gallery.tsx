import { useState, useEffect } from "react";
import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { apiService } from "@/services/api";
import { Link } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  author?: {
    full_name: string;
  };
  created_at: string;
}

interface GalleryImage {
  id: number;
  url: string;
  category: string;
  title: string;
  author?: string;
  postId?: number;
}

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "Tout" },
    { id: "patrimoine", label: "Patrimoine" },
    { id: "vie-quotidienne", label: "Vie quotidienne" },
    { id: "evenements", label: "Événements" },
    { id: "personnalites", label: "Personnalités" },
  ];

  // Fonction pour catégoriser un post basé sur son contenu
  const categorizePost = (post: Post): string => {
    const content = (post.title + " " + post.content).toLowerCase();
    
    if (content.includes("patrimoine") || content.includes("historique") || content.includes("archive") || content.includes("monument")) {
      return "patrimoine";
    }
    if (content.includes("personnalité") || content.includes("leader") || content.includes("politique") || content.includes("religieux")) {
      return "personnalites";
    }
    if (content.includes("événement") || content.includes("célébration") || content.includes("festival") || content.includes("rassemblement")) {
      return "evenements";
    }
    if (content.includes("quotidien") || content.includes("cuisine") || content.includes("marché") || content.includes("famille")) {
      return "vie-quotidienne";
    }
    
    return "vie-quotidienne"; // Catégorie par défaut
  };

  // Charger les posts avec images
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPosts();
        // Filtrer seulement les posts qui ont des images
        const postsWithImages = response.posts.filter((post: Post) => post.imageUrl);
        setPosts(postsWithImages);
      } catch (error) {
        console.error("Erreur lors du chargement des posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Images statiques
  const staticImages: GalleryImage[] = [
    {
      id: 1001,
      url: new URL("../assets/kaolack-port-archive.jpg", import.meta.url).href,
      category: "patrimoine",
      title: "Port arachidier - Archives années 50",
    },
    {
      id: 1002,
      url: new URL("../assets/kaolack-marche-vintage.jpg", import.meta.url).href,
      category: "patrimoine",
      title: "Marché central - Années 60",
    },
    {
      id: 1003,
      url: new URL("../assets/kaolack-rue-archive.jpg", import.meta.url).href,
      category: "patrimoine",
      title: "Rues de Kaolack - Époque coloniale",
    },
    {
      id: 1004,
      url: new URL("../assets/kaolack-mosquee-heritage.jpg", import.meta.url).href,
      category: "evenements",
      title: "Rassemblement religieux",
    },
    {
      id: 1005,
      url: new URL("../assets/personnalite-politique-1.jpg", import.meta.url).href,
      category: "personnalites",
      title: "Leader politique de Kaolack",
    },
    {
      id: 1006,
      url: new URL("../assets/personnalite-politique-2.jpg", import.meta.url).href,
      category: "personnalites",
      title: "Figure religieuse et politique",
    },
  ];

  // Convertir les posts en images de galerie
  const postsAsImages: GalleryImage[] = posts.map(post => ({
    id: post.id,
    url: post.imageUrl!,
    category: categorizePost(post),
    title: post.title,
    author: post.author?.full_name,
    postId: post.id
  }));

  // Combiner images statiques et posts
  const allImages = [...staticImages, ...postsAsImages];

  const filteredImages = selectedCategory === "all" 
    ? allImages 
    : allImages.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Kaolack105Navigation />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Galerie</h1>
          <p className="text-muted-foreground">Explorez les photos par catégorie</p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => {
              const ImageCard = (
                <Card key={image.id} className="overflow-hidden group cursor-pointer">
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="text-white">
                        <p className="font-semibold">{image.title}</p>
                        {image.author && (
                          <p className="text-sm text-white/80">Par {image.author}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );

              // Si c'est un post, créer un lien vers le détail du post
              return image.postId ? (
                <Link key={image.id} to={`/post/${image.postId}`}>
                  {ImageCard}
                </Link>
              ) : (
                ImageCard
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;