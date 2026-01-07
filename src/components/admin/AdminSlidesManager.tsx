import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import Logo105 from "@/components/Logo105";
import { Button } from "@/components/ui/button";

export interface KaolackSlide {
  title: string;
  subtitle: string;
  bg: string;
  logo: boolean;
  image?: string;
}

export const AdminSlidesManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState<{ [id: number]: Partial<KaolackSlide> }>({});
  const [newSlide, setNewSlide] = useState<KaolackSlide>({ title: '', subtitle: '', bg: '', logo: true });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({});

  // Query pour charger les slides
  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['admin-slides'],
    queryFn: () => apiService.getSlides(),
  });

  // Mutation pour créer un slide
  const createSlideMutation = useMutation({
    mutationFn: async (slide: KaolackSlide) => apiService.createSlide(slide),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
      setNewSlide({ title: '', subtitle: '', bg: '', logo: true });
    }
  });

  // Mutation pour supprimer un slide
  const deleteSlideMutation = useMutation({
    mutationFn: async (id: number) => apiService.deleteSlide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-slides'] })
  });

  // Mutation pour modifier un slide
  const updateSlideMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<KaolackSlide> }) => apiService.updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
      setEditing(null);
    }
  });

  const handleEdit = (id: number) => setEditing(id);
  const handleDelete = (id: number) => deleteSlideMutation.mutate(id);
  const handleChange = (id: number, field: keyof KaolackSlide, value: any) => {
    setEditBuffer(buf => ({ ...buf, [id]: { ...buf[id], [field]: value } }));
  };
  const handleEditValidate = async (id: number) => {
    try {
      const dataToUpdate = { ...editBuffer[id] };
      
      // Si une nouvelle image a été sélectionnée, l'uploader d'abord
      if (imageFiles[`edit-${id}`]) {
        setUploadingImage(true);
        try {
          const uploadResult = await apiService.uploadImage(imageFiles[`edit-${id}`]);
          dataToUpdate.image = uploadResult.imageUrl || uploadResult.url;
          setImageFiles(files => {
            const { [`edit-${id}`]: _, ...rest } = files;
            return rest;
          });
        } finally {
          setUploadingImage(false);
        }
      }
      
      updateSlideMutation.mutate({ id, data: dataToUpdate });
      setEditBuffer(buf => {
        const { [id]: _, ...rest } = buf;
        return rest;
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      setUploadingImage(false);
    }
  };
  
  const handleNewSlide = async () => {
    if (!newSlide.title) return;
    
    try {
      const slideData = { ...newSlide };
      
      // Si une image a été sélectionnée, l'uploader d'abord
      if (imageFiles['new']) {
        setUploadingImage(true);
        try {
          const uploadResult = await apiService.uploadImage(imageFiles['new']);
          slideData.image = uploadResult.imageUrl || uploadResult.url;
          setImageFiles(files => {
            const { 'new': _, ...rest } = files;
            return rest;
          });
        } finally {
          setUploadingImage(false);
        }
      }
      
      createSlideMutation.mutate(slideData);
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des slides...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des slides</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Gestion des Slides d'Accueil</h2>
      <div className="space-y-6">
        {slides.map((slide: any) => (
          <div key={slide.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className={`relative flex-1 ${slide.bg} p-4 rounded-lg flex flex-col items-center justify-center overflow-hidden`} style={{ minHeight: 180 }}>
              {/* Image d'arrière-plan en full cover */}
              {slide.image && (
                <img
                  src={slide.image}
                  alt="bannière"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  style={{ borderRadius: 'inherit' }}
                />
              )}
              {/* Contenu du slide */}
              <div className="relative z-10 w-full flex flex-col items-center">
                {slide.logo && <Logo105 size="md" variant="white-bg" className="mb-2" />}
                <>
                  {editing === slide.id ? (
                    <>
                      <input className="input mb-2" value={editBuffer[slide.id]?.title ?? slide.title} onChange={e => handleChange(slide.id, 'title', e.target.value)} placeholder="Titre" />
                      <input className="input mb-2" value={editBuffer[slide.id]?.subtitle ?? slide.subtitle} onChange={e => handleChange(slide.id, 'subtitle', e.target.value)} placeholder="Sous-titre" />
                      <input className="input mb-2" value={editBuffer[slide.id]?.bg ?? slide.bg} onChange={e => handleChange(slide.id, 'bg', e.target.value)} placeholder="Classe CSS fond (bg...)" />
                      {/* Champ d'upload d'image d'arrière-plan */}
                      <input
                        className="input mb-2"
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFiles(files => ({ ...files, [`edit-${slide.id}`]: file }));
                            // Prévisualisation locale
                            const reader = new FileReader();
                            reader.onload = ev => {
                              handleChange(slide.id, 'image', ev.target?.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {/* Prévisualisation de l'image uploadée (miniature) */}
                      {editBuffer[slide.id]?.image ? (
                        <img src={editBuffer[slide.id]?.image as string} alt="bannière" className="h-16 w-32 object-cover rounded mb-2 border border-gray-300" />
                      ) : slide.image && (
                        <img src={slide.image} alt="bannière" className="h-16 w-32 object-cover rounded mb-2 border border-gray-300" />
                      )}
                      <label className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={editBuffer[slide.id]?.logo ?? slide.logo} onChange={e => handleChange(slide.id, 'logo', e.target.checked)} />
                        Afficher le logo 105 ans
                      </label>
                      <Button size="sm" onClick={() => handleEditValidate(slide.id)} disabled={uploadingImage}>
                        {uploadingImage ? 'Upload en cours...' : 'Valider'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white drop-shadow mb-1 text-center" style={{ textShadow: '0 2px 8px #000' }}>{slide.title}</h3>
                      <p className="text-white/90 mb-2 text-center" style={{ textShadow: '0 2px 8px #000' }}>{slide.subtitle}</p>
                      <div className="flex gap-2 mt-2 justify-center">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(slide.id)}>Modifier</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(slide.id)}>Supprimer</Button>
                      </div>
                    </>
                  )}
                </>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">Créer un nouveau slide</h3>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input className="input mb-2" value={newSlide.title} onChange={e => setNewSlide(s => ({ ...s, title: e.target.value }))} placeholder="Titre" />
          <input className="input mb-2" value={newSlide.subtitle} onChange={e => setNewSlide(s => ({ ...s, subtitle: e.target.value }))} placeholder="Sous-titre" />
          <input className="input mb-2" value={newSlide.bg} onChange={e => setNewSlide(s => ({ ...s, bg: e.target.value }))} placeholder="Classe CSS fond (bg...)" />
          {/* Champ d'upload d'image d'arrière-plan pour nouveau slide */}
          <input
            className="input mb-2"
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFiles(files => ({ ...files, 'new': file }));
                // Prévisualisation locale
                const reader = new FileReader();
                reader.onload = ev => {
                  setNewSlide(s => ({ ...s, image: ev.target?.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {/* Prévisualisation de l'image uploadée */}
          {newSlide.image && (
            <img src={newSlide.image} alt="bannière" className="h-24 object-cover rounded mb-2" />
          )}
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={newSlide.logo} onChange={e => setNewSlide(s => ({ ...s, logo: e.target.checked }))} />
            Afficher le logo 105 ans
          </label>
          <Button size="sm" onClick={handleNewSlide} disabled={uploadingImage}>
            {uploadingImage ? 'Upload en cours...' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
