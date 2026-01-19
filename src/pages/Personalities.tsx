import { useState, useEffect } from "react";
import Kaolack105Navigation from "@/components/Kaolack105Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Award, Heart, BookOpen, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import personnalite1 from "@/assets/personnalite-politique-1.jpg";
import personnalite2 from "@/assets/personnalite-politique-2.jpg";

interface Personality {
  id: number | string;
  name: string;
  category: string;
  role: string;
  description: string;
  image: string;
  contributions: string[];
  votes: number;
  status: 'pending' | 'approved';
  isProposal?: boolean;
  proposedBy?: string;
}

const Personalities = () => {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [likedPersonalities, setLikedPersonalities] = useState<Set<number | string>>(new Set());
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    role: "",
    description: "",
    contributions: "",
  });

  // Récupérer les personnalités depuis l'API
  const { data: personalitiesData, isLoading, error } = useQuery({
    queryKey: ['personalities'],
    queryFn: () => apiService.getPersonalities(),
  });

  const personalities = personalitiesData?.data || [];

  // Charger les personnalités aimées depuis localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem("personality_likes");
    if (savedLikes) {
      try {
        setLikedPersonalities(new Set(JSON.parse(savedLikes)));
      } catch (err) {
        console.error("Erreur lors du chargement des likes", err);
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== SUBMIT START ===');
    console.log('Form data:', formData);
    console.log('Image preview exists:', !!imagePreview);
    console.log('Image preview length:', imagePreview.length);

    if (!formData.name || !formData.category || !formData.role || !formData.description) {
      toast.error("Tous les champs texte sont obligatoires");
      return;
    }

    if (!imagePreview) {
      toast.error("Une image est obligatoire");
      return;
    }

    setSubmitting(true);

    try {
      // Test upload SANS conversion blob
      console.log('=== UPLOAD TEST ===');
      
      const imageFormData = new FormData();
      
      // Créer un fichier depuis l'URL data
      const response_img = await fetch(imagePreview);
      const blob = await response_img.blob();
      const file = new File([blob], 'personality.jpg', { type: 'image/jpeg' });
      
      imageFormData.append('image', file);
      
      console.log('FormData created, file size:', file.size);
      console.log('File type:', file.type);
      
      const uploadResponse = await fetch('https://portail.kaolackcommune.sn/api/upload/image', {
        method: 'POST',
        body: imageFormData,
      });

      console.log('Upload status:', uploadResponse.status);
      console.log('Upload ok:', uploadResponse.ok);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload success:', uploadResult);
      
      const imageUrl = uploadResult.imageUrl;
      console.log('Final image URL:', imageUrl);

      if (!imageUrl) {
        throw new Error("Image URL non reçue du serveur");
      }

      // Création de la personnalité
      const personalityData = {
        name: formData.name,
        category: formData.category,
        role: formData.role,
        description: formData.description,
        image: imageUrl,
        contributions: formData.contributions
          .split("\n")
          .filter(line => line.trim())
          .map(line => line.trim()),
        status: 'pending',
        proposedBy: "Anonyme",
      };

      console.log('Personality data:', personalityData);

      const response = await fetch('https://portail.kaolackcommune.sn/api/personalities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalityData),
      });

      if (response.ok) {
        toast.success("🎉 Personnalité proposée avec succès ! En attente d'approbation.");
        setFormData({
          name: "",
          category: "",
          role: "",
          description: "",
          contributions: "",
        });
        setImagePreview("");
        setOpen(false);
      } else {
        toast.error("Erreur lors de la soumission");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission", error);
      toast.error("Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (person: Personality) => {
    try {
      const response = await fetch(`https://portail.kaolackcommune.sn/api/personalities/${person.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const isLiked = likedPersonalities.has(person.id);
        const newLikedSet = new Set(likedPersonalities);
        
        if (isLiked) {
          newLikedSet.delete(person.id);
          toast.success("Vous n'aimez plus cette personnalité");
        } else {
          newLikedSet.add(person.id);
          toast.success("Vous aimez cette personnalité !");
        }
        
        setLikedPersonalities(newLikedSet);
        localStorage.setItem("personality_likes", JSON.stringify(Array.from(newLikedSet)));
        
        // Rafraîchir les données
        window.location.reload();
      } else {
        toast.error("Erreur lors du vote");
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      toast.error("Erreur lors du vote");
    }
  };

  const handleReadMore = (person: Personality) => {
    setSelectedPersonality(person);
    setReadMoreOpen(true);
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
                <DialogDescription>
                  Proposez une personnalité qui a marqué l'histoire de Kaolack. 
                  Votre proposition sera examinée par l'administrateur avant d'être publiée.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    required 
                    placeholder="Ex: Moustapha Niasse" 
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image de la personnalité * (max 5 MB)</Label>
                  <div className="border-2 border-dashed border-primary rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-48 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span>Cliquez pour télécharger une image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Domaine *</Label>
                    <Input 
                      id="category" 
                      name="category"
                      required 
                      placeholder="Ex: Politique" 
                      value={formData.category}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Fonction principale *</Label>
                    <Input 
                      id="role" 
                      name="role"
                      required 
                      placeholder="Ex: Ministre" 
                      value={formData.role}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Pourquoi mérite-t-elle d'être honorée ? *</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    required 
                    placeholder="Décrivez les contributions et l'impact de cette personnalité..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributions">Contributions principales (une par ligne)</Label>
                  <Textarea 
                    id="contributions" 
                    name="contributions"
                    placeholder="Ex: Premier Ministre 2000-2001..."
                    className="min-h-[80px]"
                    value={formData.contributions}
                    onChange={handleFormChange}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Soumission en cours..." : "Soumettre la proposition"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <p>Chargement des personnalités...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>Erreur lors du chargement des personnalités</p>
          </div>
        )}

        {personalities.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✨ <strong>{personalities.length}</strong> personnalité{personalities.length > 1 ? "s" : ""} approuvée{personalities.length > 1 ? "s" : ""} disponible{personalities.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {personalities.map((person) => (
            <Card 
              key={person.id} 
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={person.image.startsWith('http') ? person.image : `https://portail.kaolackcommune.sn${person.image}`}
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
                
                {person.contributions && person.contributions.length > 0 && (
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
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className={`gap-2 ${likedPersonalities.has(person.id) ? 'text-red-500 border-red-500' : ''}`}
                    onClick={() => handleLike(person)}
                  >
                    <Heart className={`h-4 w-4 ${likedPersonalities.has(person.id) ? 'fill-current' : ''}`} />
                    Aimer ({person.votes})
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => handleReadMore(person)}
                    >
                      <BookOpen className="h-4 w-4" />
                      Lire plus
                    </Button>
                  </div>
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
            qui ont marqué l'histoire de notre ville. Vous pouvez proposer des noms et aimer les personnalités 
            que vous souhaitez voir honorées.
          </p>
          <p className="text-sm text-muted-foreground italic">
            "Une histoire à célébrer, une économie à développer, une fierté à exposer : 105 ans de Kaolack, ma fierté !"
          </p>
        </div>
      </main>

      {/* Dialog "Lire plus" */}
      <Dialog open={readMoreOpen} onOpenChange={setReadMoreOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedPersonality && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPersonality.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="relative h-64 overflow-hidden rounded-lg">
                  <img
                    src={selectedPersonality.image.startsWith('http') ? selectedPersonality.image : `https://portail.kaolackcommune.sn${selectedPersonality.image}`}
                    alt={selectedPersonality.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">{selectedPersonality.category}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedPersonality.role}</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedPersonality.description}</p>
                </div>

                {selectedPersonality.contributions && selectedPersonality.contributions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Contributions principales</span>
                    </div>
                    <ul className="space-y-2 ml-6">
                      {selectedPersonality.contributions.map((contribution, index) => (
                        <li key={index} className="text-muted-foreground list-disc">
                          {contribution}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className={`gap-2 ${likedPersonalities.has(selectedPersonality.id) ? 'text-red-500 border-red-500' : ''}`}
                    onClick={() => {
                      handleLike(selectedPersonality);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${likedPersonalities.has(selectedPersonality.id) ? 'fill-current' : ''}`} />
                    Aimer ({selectedPersonality.votes})
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personalities;
