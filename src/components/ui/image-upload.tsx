import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onClear,
  label = "Image",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de base
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    try {
      setIsUploading(true);

      // Créer un aperçu local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Préparer FormData pour l'upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload via fetch directement car apiService peut ne pas supporter FormData
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      // Utiliser l'URL retournée par le serveur
      onChange(result.imageUrl);
      setPreview(result.imageUrl);
      toast.success('Image uploadée avec succès');

    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setPreview(value || '');
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      
      {/* Zone d'aperçu */}
      {preview && (
        <div className="mt-2 relative">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
            <img 
              src={preview} 
              alt="Aperçu" 
              className="max-w-full h-32 object-cover rounded mx-auto"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      <div className="mt-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
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
              {preview ? (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  Changer l'image
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner une image
                </>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Info sur les formats acceptés */}
      <p className="text-xs text-gray-500 mt-1">
        Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
      </p>
    </div>
  );
};

export default ImageUpload;