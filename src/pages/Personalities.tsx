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
  const [proposals, setProposals] = useState<Personality[]>([]);
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

  useEffect(() => {
    const saved = localStorage.getItem("personality_proposals");
    if (saved) {
      try {
        setProposals(JSON.parse(saved));
      } catch (err) {
        console.error("Erreur lors du chargement des propositions", err);
      }
    }
    
    // Charger les personnalités aimées
    const savedLikes = localStorage.getItem("personality_likes");
    if (savedLikes) {
      try {
        setLikedPersonalities(new Set(JSON.parse(savedLikes)));
      } catch (err) {
        console.error("Erreur lors du chargement des likes", err);
      }
    }
  }, []);

  // Afficher toutes les personnalités : approuvées + propositions de l'utilisateur
  const allPersonalities = [
    // Personnalités approuvées (non-propositions)
    ...proposals.filter(p => p.status === 'approved' && !p.isProposal),
    // Propositions en attente (uniquement celles créées)
    ...proposals.filter(p => p.isProposal)
  ];

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
      const newProposal: Personality = {
        id: `proposal_${Date.now()}`,
        name: formData.name,
        category: formData.category,
        role: formData.role,
        description: formData.description,
        image: imagePreview,
        contributions: formData.contributions
          .split("\n")
          .filter(line => line.trim())
          .map(line => line.trim()),
        votes: 1,
        status: 'pending',
        isProposal: true,
        proposedBy: "Anonyme",
      };

      const updatedProposals = [...proposals, newProposal];
      setProposals(updatedProposals);

      localStorage.setItem("personality_proposals", JSON.stringify(updatedProposals));

      setFormData({
        name: "",
        category: "",
        role: "",
        description: "",
        contributions: "",
      });
      setImagePreview("");
      setOpen(false);

      toast.success("🎉 Personnalité proposée avec succès ! Elle figure maintenant dans la liste.");
    } catch (error) {
      console.error("Erreur lors de la soumission", error);
      toast.error("Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const removeProposal = (id: number | string) => {
    const updated = proposals.filter(p => p.id !== id);
    setProposals(updated);
    localStorage.setItem("personality_proposals", JSON.stringify(updated));
    toast.success("Proposition supprimée");
  };

  const handleLike = (person: Personality) => {
    const isLiked = likedPersonalities.has(person.id);
    const newLikedSet = new Set(likedPersonalities);
    
    if (isLiked) {
      newLikedSet.delete(person.id);
      // Décrémenter les votes
      const updated = proposals.map(p => 
        p.id === person.id ? { ...p, votes: Math.max(0, p.votes - 1) } : p
      );
      setProposals(updated);
      localStorage.setItem("personality_proposals", JSON.stringify(updated));
      toast.success("Vous n'aimez plus cette personnalité");
    } else {
      newLikedSet.add(person.id);
      // Incrémenter les votes
      const updated = proposals.map(p => 
        p.id === person.id ? { ...p, votes: p.votes + 1 } : p
      );
      setProposals(updated);
      localStorage.setItem("personality_proposals", JSON.stringify(updated));
      toast.success("Vous aimez cette personnalité !");
    }
    
    setLikedPersonalities(newLikedSet);
    localStorage.setItem("personality_likes", JSON.stringify(Array.from(newLikedSet)));
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

        {proposals.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✨ <strong>{proposals.length}</strong> personnalité{proposals.length > 1 ? "s" : ""} proposée{proposals.length > 1 ? "s" : ""} figurent dans la liste ci-dessous
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {allPersonalities.map((person) => (
            <Card 
              key={person.id} 
              className={`overflow-hidden hover:shadow-xl transition-shadow ${
                person.isProposal ? "border-blue-200 bg-blue-50/30" : ""
              }`}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold">{person.category}</span>
                </div>
                {person.isProposal && (
                  <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold">✨ PROPOSITION</span>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">{person.name}</CardTitle>
                <CardDescription className="text-base">{person.role}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{person.description}</p>
                
                {person.contributions.length > 0 && (
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
                    {person.isProposal && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeProposal(person.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
                    src={selectedPersonality.image}
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

                {selectedPersonality.contributions.length > 0 && (
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