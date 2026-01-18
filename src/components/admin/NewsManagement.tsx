import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { News } from '@/models/news';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  priority: number;
  featured: boolean;
  image_url?: string;
  publication_date?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    full_name: string;
  };
}

const categories = [
  { value: 'annonce-officielle', label: 'Annonce officielle' },
  { value: 'communique-municipal', label: 'Communiqué municipal' },
  { value: 'evenement-officiel', label: 'Événement officiel' },
  { value: 'service-public', label: 'Service public' },
  { value: 'projet-municipal', label: 'Projet municipal' },
  { value: 'information-citoyen', label: 'Information citoyen' },
];

export const NewsManagement = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'actualite',
    status: 'draft' as 'draft' | 'published' | 'archived',
    priority: 0,
    featured: false,
    image_url: '',
    publication_date: '',
  });
  
  // États pour l'upload d'image
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Récupération des actualités
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => apiService.getAllNewsForAdmin(),
  });
  
  const news = newsData?.news || [];

  // Mutations
  const createNewsMutation = useMutation({
    mutationFn: (data: typeof formData) => apiService.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Actualité créée avec succès');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Erreur création actualité:', error);
      toast.error('Erreur lors de la création de l\'actualité');
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> }) => 
      apiService.updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Actualité mise à jour avec succès');
      setIsEditDialogOpen(false);
      setEditingNews(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Erreur modification actualité:', error);
      toast.error('Erreur lors de la modification de l\'actualité');
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Actualité supprimée avec succès');
    },
    onError: (error: Error) => {
      console.error('Erreur suppression actualité:', error);
      toast.error('Erreur lors de la suppression de l\'actualité');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'actualite',
      status: 'draft',
      priority: 0,
      featured: false,
      image_url: '',
      publication_date: '',
    });
    setImagePreview('');
  };

  // Fonction d'upload d'image
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Créer un aperçu local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Préparer FormData pour l'upload
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      // Upload via fetch
      const token = localStorage.getItem('auth_token');
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      // Mettre à jour le formData avec l'URL de l'image
      setFormData(prev => ({ ...prev, image_url: result.imageUrl }));
      setImagePreview(result.imageUrl);
      toast.success('Image uploadée avec succès');

    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setImagePreview('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      excerpt: newsItem.excerpt || '',
      category: newsItem.category,
      status: newsItem.status,
      priority: newsItem.priority,
      featured: newsItem.featured,
      image_url: newsItem.image_url || '',
      publication_date: newsItem.publication_date ? 
        new Date(newsItem.publication_date).toISOString().slice(0, 16) : '',
    });
    setImagePreview(newsItem.image_url || '');
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation avant envoi
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      toast.error('Le titre doit contenir au moins 5 caractères');
      return;
    }
    
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      toast.error('Le contenu doit contenir au moins 10 caractères');
      return;
    }
    
    // Validation de l'URL si fournie
    if (formData.image_url && formData.image_url.trim() && 
        !formData.image_url.startsWith('http://') && 
        !formData.image_url.startsWith('https://')) {
      toast.error('L\'URL de l\'image doit commencer par http:// ou https://');
      return;
    }
    
    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return <Badge variant="outline">{categoryConfig?.label || category}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des actualités...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des actualités</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Actualités ({news.length})</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle actualité
        </Button>
      </div>

      <div className="space-y-4">
        {news.map(newsItem => (
          <div key={newsItem.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              {/* Affichage de la vignette image si présente */}
              {newsItem.image_url && (
                <div className="mr-4 min-w-[90px]">
                  <img 
                    src={newsItem.image_url}
                    alt={newsItem.title}
                    className="h-20 w-28 object-cover object-center rounded-md border"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{newsItem.title}</h4>
                  {newsItem.featured && <Star className="h-4 w-4 text-yellow-500" />}
                  {getStatusBadge(newsItem.status)}
                  {getCategoryBadge(newsItem.category)}
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">{newsItem.excerpt || newsItem.content.substring(0, 150) + '...'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Par: {newsItem.author.full_name}</span>
                  <span>Vues: {newsItem.views_count === 0 ? 'Aucune vue' : newsItem.views_count + (newsItem.views_count === 1 ? ' vue' : ' vues')}</span>
                  <span>Créé: {new Date(newsItem.created_at).toLocaleDateString('fr-FR')}</span>
                  {newsItem.publication_date && (
                    <span>Publication: {new Date(newsItem.publication_date).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button size="sm" variant="outline" onClick={() => handleEdit(newsItem)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => deleteNewsMutation.mutate(newsItem.id)}
                disabled={deleteNewsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        
        {news.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune actualité trouvée
          </div>
        )}
      </div>

      {/* Dialog de création/modification */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingNews(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Résumé</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
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
            </div>

            <div>
              <Label>Image de l'actualité</Label>
              
              {/* Zone d'aperçu de l'image */}
              {(imagePreview || formData.image_url) && (
                <div className="mt-2 relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    <img 
                      src={imagePreview || formData.image_url} 
                      alt="Aperçu" 
                      className="max-w-full h-32 object-cover rounded mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}

              {/* Bouton d'upload */}
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploadingImage}
                  className="w-full"
                >
                  {isUploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      {(imagePreview || formData.image_url) ? 'Changer l\'image' : 'Sélectionner une image'}
                    </>
                  )}
                </Button>
              </div>

              {/* Info sur les formats */}
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priorité (0-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="publication_date">Date de publication</Label>
                <Input
                  id="publication_date"
                  type="datetime-local"
                  value={formData.publication_date}
                  onChange={(e) => setFormData({...formData, publication_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="featured">Mettre en avant sur la page d'accueil</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingNews(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
              >
                {editingNews ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};