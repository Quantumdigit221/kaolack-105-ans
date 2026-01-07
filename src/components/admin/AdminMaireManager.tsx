import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface MaireData {
  name: string;
  role: string;
  message: string;
  imageUrl: string;
}

export const AdminMaireManager = () => {
  const [formData, setFormData] = useState<MaireData>({
    name: 'Mamadou Ndiaye',
    role: 'Maire de la Commune de Kaolack',
    message: `"Chères Kaolackoises, chers Kaolackois,
c'est un honneur de servir notre magnifique commune et d'accompagner sa transformation au quotidien. Ensemble, faisons rayonner Kaolack haut et fort !"`,
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les données sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem('maire_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData(data);
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du maire:', error);
      }
    }
  }, []);

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
      setIsUploading(true);

      // Créer un aperçu local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload via l'API
      const uploadResponse = await apiService.uploadImage(file);
      
      setFormData(prev => ({ ...prev, imageUrl: uploadResponse.imageUrl }));
      setImagePreview(uploadResponse.imageUrl);
      toast.success('Image uploadée avec succès');

    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setImagePreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    try {
      setIsSaving(true);
      localStorage.setItem('maire_data', JSON.stringify(formData));
      toast.success('Informations du maire sauvegardées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du Maire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image */}
          <div>
            <Label>Photo du Maire</Label>
            
            {/* Aperçu de l'image */}
            {imagePreview && (
              <div className="mt-2 relative">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Photo du maire" 
                    className="h-32 w-32 object-cover rounded-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
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
                id="maire-image-upload"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('maire-image-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {imagePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>

          {/* Nom */}
          <div>
            <Label htmlFor="maire-name">Nom complet *</Label>
            <Input
              id="maire-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mamadou Ndiaye"
              required
            />
          </div>

          {/* Rôle/Fonction */}
          <div>
            <Label htmlFor="maire-role">Fonction *</Label>
            <Input
              id="maire-role"
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex: Maire de la Commune de Kaolack"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="maire-message">Message d'accueil *</Label>
            <Textarea
              id="maire-message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              placeholder="Message du maire..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez utiliser des sauts de ligne pour formater le message
            </p>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.role || !formData.message}
              size="lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl mx-auto py-10 px-6 rounded-3xl shadow-lg bg-gradient-to-br from-blue-50 via-white to-accent/10 border flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 flex flex-col items-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Maire de Kaolack"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-primary"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Aucune image</span>
                </div>
              )}
              <span className="font-semibold text-primary mt-4 px-4 py-1 bg-primary/10 rounded-full text-center">Le Maire</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{formData.name || 'Nom du maire'}</h2>
              <p className="text-muted-foreground mb-4 font-medium">{formData.role || 'Fonction'}</p>
              <p className="mb-6 text-lg whitespace-pre-line">
                {formData.message || 'Message du maire...'}
              </p>
              <Button size="lg" className="text-base px-7" disabled>
                Voir le mot du maire
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

