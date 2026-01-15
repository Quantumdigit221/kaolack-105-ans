import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogueApiService } from "@/services/api-catalogue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Eye, Plus, Search, FileText, Upload, Edit } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CatalogueItem {
  id: number;
  title: string;
  personality: string;
  description: string;
  pdf_url: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    full_name: string;
  };
}

const AdminCatalogueManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    personality: "",
    description: "",
    status: "draft" as 'draft' | 'published' | 'archived',
    featured: false
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const { data: cataloguesData, isLoading } = useQuery({
    queryKey: ["admin-catalogues", statusFilter, searchTerm],
    queryFn: async () => {
      const response = await catalogueApiService.getAdminCatalogues(statusFilter, searchTerm);
      return response;
    }
  });

  const catalogues = Array.isArray(cataloguesData) ? cataloguesData : cataloguesData?.catalogues || [];

  const createCatalogue = useMutation({
    mutationFn: async (data: FormData) => {
      return await catalogueApiService.createCatalogue(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-catalogues"] });
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        personality: "",
        description: "",
        status: "draft",
        featured: false
      });
      setPdfFile(null);
      toast.success("Catalogue créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating catalogue:", error);
      toast.error("Erreur lors de la création");
    }
  });

  const updateCatalogue = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      return await catalogueApiService.updateCatalogue(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-catalogues"] });
      setEditingItem(null);
      setFormData({
        title: "",
        personality: "",
        description: "",
        status: "draft",
        featured: false
      });
      setPdfFile(null);
      toast.success("Catalogue mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Error updating catalogue:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  });

  const deleteCatalogue = useMutation({
    mutationFn: async (id: number) => {
      await catalogueApiService.deleteCatalogue(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-catalogues"] });
      toast.success("Catalogue supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting catalogue:", error);
      toast.error("Erreur lors de la suppression");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('personality', formData.personality);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('featured', formData.featured.toString());
    
    if (pdfFile) {
      data.append('pdf', pdfFile);
    }

    if (editingItem) {
      updateCatalogue.mutate({ id: editingItem.id, data });
    } else {
      createCatalogue.mutate(data);
    }
  };

  const openEditModal = (item: CatalogueItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      personality: item.personality,
      description: item.description,
      status: item.status,
      featured: item.featured
    });
    setIsCreateModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "destructive"
    } as const;
    
    const labels = {
      draft: "Brouillon",
      published: "Publié",
      archived: "Archivé"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Catalogue Numérique</h2>
          <p className="text-muted-foreground">
            Bibliothèque des personnalités de Kaolack
          </p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau catalogue
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des catalogues */}
      <div className="grid gap-4">
        {catalogues.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun catalogue"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Essayez d'autres termes de recherche" : "Commencez par ajouter votre premier catalogue"}
            </p>
          </div>
        ) : (
          catalogues.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Personnalité: {item.personality}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(item.status)}
                    {item.featured && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        Vedette
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {item.views_count || 0}
                    </span>
                    {item.pdf_url && (
                      <a 
                        href={item.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Voir PDF
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{item.title}" ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCatalogue.mutate(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingItem ? "Modifier le catalogue" : "Nouveau catalogue"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editingItem ? "Modifiez les informations du catalogue" : "Ajoutez une nouvelle personnalité au catalogue numérique"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Mamadou Ndiaye"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personality">Personnalité *</Label>
                <Input
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="Nom complet de la personnalité"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Biographie ou description de la personnalité..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">Fichier PDF</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {pdfFile && (
                    <span className="text-sm text-muted-foreground">
                      {pdfFile.name}
                    </span>
                  )}
                </div>
                {!editingItem && (
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour conserver le fichier actuel
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked === true }))}
              />
              <Label htmlFor="featured">Mettre en vedette</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </AlertDialogCancel>
              <Button type="submit" disabled={createCatalogue.isPending || updateCatalogue.isPending}>
                {createCatalogue.isPending || updateCatalogue.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                {editingItem ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCatalogueManager;
