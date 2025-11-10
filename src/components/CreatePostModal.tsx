import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const CreatePostModal = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }
      
      setImageFile(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [CreatePost] Début de la soumission');
    console.log('🔍 [CreatePost] isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ [CreatePost] Utilisateur non authentifié');
      toast.error("Vous devez être connecté pour publier");
      return;
    }
    
    // Log des données avant validation
    console.log('🔍 [CreatePost] Données du formulaire:');
    console.log('- Titre:', `"${title}" (longueur: ${title.length})`);
    console.log('- Contenu:', `"${content.substring(0, 50)}..." (longueur: ${content.length})`);
    console.log('- Catégorie:', `"${category}"`);
    console.log('- Image:', imageFile ? imageFile.name : 'Aucune');
    
    if (!title || !content || !category) {
      console.log('❌ [CreatePost] Champs manquants');
      console.log('- Titre vide:', !title);
      console.log('- Contenu vide:', !content);
      console.log('- Catégorie vide:', !category);
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Validation côté client (même que le backend)
    if (title.length < 3) {
      console.log('❌ [CreatePost] Titre trop court:', title.length);
      toast.error("Le titre doit contenir au moins 3 caractères");
      return;
    }
    
    if (content.length < 10) {
      console.log('❌ [CreatePost] Contenu trop court:', content.length);
      toast.error("Le contenu doit contenir au moins 10 caractères");
      return;
    }
    
    const validCategories = ['patrimoine', 'vie-quotidienne', 'evenements', 'personnalites'];
    if (!validCategories.includes(category)) {
      console.log('❌ [CreatePost] Catégorie invalide:', category);
      toast.error("Catégorie invalide");
      return;
    }

    console.log('✅ [CreatePost] Validation réussie, envoi en cours...');
    setIsUploading(true);

    try {
      let imageUrl: string | null = null;

      // Upload de l'image si présente
      if (imageFile) {
        console.log('📤 [CreatePost] Upload d\'image en cours...');
        const uploadResponse = await apiService.uploadImage(imageFile);
        imageUrl = uploadResponse.imageUrl;
        console.log('✅ [CreatePost] Image uploadée:', imageUrl);
      }

      // Données finales à envoyer
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl || '',
      };
      
      console.log('📤 [CreatePost] Données finales envoyées:');
      console.log(JSON.stringify(postData, null, 2));

      // Créer le post
      const response = await apiService.createPost(postData);
      
      console.log('✅ [CreatePost] Post créé avec succès:', response);
      toast.success("Votre histoire a été partagée !");
      setOpen(false);
      setTitle("");
      setContent("");
      setCategory("");
      setImageFile(null);
      setImagePreview(null);
      
      // Optionnel : déclencher un refresh des posts
      window.dispatchEvent(new CustomEvent('postCreated'));
    } catch (error: any) {
      console.error('❌ [CreatePost] Erreur lors de la publication:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('❌ [CreatePost] Réponse d\'erreur:', error.response.status);
        console.error('❌ [CreatePost] Données d\'erreur:', error.response.data);
        
        // Afficher les détails de validation si disponibles
        if (error.response.data?.details) {
          console.error('❌ [CreatePost] Détails de validation:', error.response.data.details);
          toast.error(`Erreur de validation: ${error.response.data.details.join(', ')}`);
        } else {
          toast.error(error.response.data?.error || error.message || "Erreur lors de la publication");
        }
      } else {
        console.error('❌ [CreatePost] Erreur réseau:', error.message);
        toast.error(error.message || "Erreur lors de la publication");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Partager votre histoire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Partager votre histoire</DialogTitle>
          <DialogDescription>
            Racontez vos souvenirs, vos anecdotes et partagez vos photos de Kaolack avec la communauté.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patrimoine">Patrimoine</SelectItem>
                <SelectItem value="vie-quotidienne">Vie quotidienne</SelectItem>
                <SelectItem value="evenements">Événements</SelectItem>
                <SelectItem value="personnalites">Personnalités</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Donnez un titre à votre histoire"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Votre histoire</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Racontez votre histoire, vos souvenirs..."
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Photo (optionnel)</Label>
            {imagePreview ? (
              <div className="relative w-full rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Prévisualisation" className="w-full h-48 object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Cliquez pour ajouter une photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG, GIF, WebP)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication en cours...
              </>
            ) : (
              "Publier"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;