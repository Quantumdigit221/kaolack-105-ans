import * as React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo105 from '@/components/Logo105';

const LOCAL_STORAGE_KEY = 'mainHomeContent';

const defaultContent = {
  title: 'Bienvenue à Kaolack Stories Connect',
  subtitle: 'Découvrez, partagez et connectez-vous autour des histoires de Kaolack.',
  image: '',
  logo: '',
  menu: [
    { path: '/', label: 'Accueil', icon: 'Home' },
    { path: '/feed', label: 'Histoires', icon: 'FileText' },
    { path: '/etat-civil', label: 'État civil', icon: 'Landmark' },
    { path: '/kaolack-105', label: '105 de Kaolack', icon: 'Building2' },
  ],
  slides: [
    {
      image: '',
      title: 'Célébration des 105 ans de Kaolack',
      subtitle: 'Lancement de la plateforme participative pour célébrer notre histoire collective',
      cta: "Découvrir l'histoire",
      link: '/feed',
    },
    {
      image: '',
      title: 'Modernisation du marché central',
      subtitle: 'Projet de rénovation et d\'amélioration des infrastructures commerciales',
      cta: 'Voir les projets',
      link: '/kaolack-105',
    },
    {
      image: '',
      title: 'Patrimoine religieux valorisé',
      subtitle: 'Programme de restauration des sites historiques et religieux',
      cta: 'Explorer le patrimoine',
      link: '/kaolack-105/gallery',
    },
  ],
};
  // Gestion des slides du slider d'accueil
  const handleSlideChange = (idx: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => i === idx ? { ...slide, [field]: value } : slide),
    }));
  };
  const handleSlideImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({
          ...prev,
          slides: prev.slides.map((slide, i) => i === idx ? { ...slide, image: reader.result as string } : slide),
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSlideAdd = () => {
    setContent(prev => ({
      ...prev,
      slides: [
        ...prev.slides,
        { image: '', title: '', subtitle: '', cta: '', link: '' },
      ],
    }));
  };
  const handleSlideRemove = (idx: number) => {
    setContent(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== idx),
    }));
  };

export const ContentEditor: React.FC = () => {
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultContent;
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(content.image || '');
  const [logoPreview, setLogoPreview] = useState(content.logo || '');

  const handleMenuChange = (idx: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      menu: prev.menu.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };
  const handleMenuAdd = () => {
    setContent(prev => ({
      ...prev,
      menu: [...prev.menu, { path: '', label: '', icon: 'Home' }],
    }));
  };
  const handleMenuRemove = (idx: number) => {
    setContent(prev => ({
      ...prev,
      menu: prev.menu.filter((_, i) => i !== idx),
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, logo: reader.result as string }));
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, image: reader.result as string }));
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Édition de la page d'accueil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre principal</label>
          <Input name="title" value={content.title} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sous-titre</label>
          <Input name="subtitle" value={content.subtitle} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image d'accueil (optionnelle)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img src={imagePreview} alt="Aperçu" className="mt-2 rounded shadow max-h-40" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo (optionnel)</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && (
            <img src={logoPreview} alt="Logo" className="mt-2 rounded shadow max-h-20 bg-white p-2" />
          )}
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Prévisualisation du logo 105 ANS :</p>
            <Logo105 size="md" variant="white-bg" className="rounded shadow" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Menu de navigation</label>
          <div className="space-y-2">
            {content.menu.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  className="w-32"
                  placeholder="Label"
                  value={item.label}
                  onChange={e => handleMenuChange(idx, 'label', e.target.value)}
                />
                <Input
                  className="w-40"
                  placeholder="Lien (path)"
                  value={item.path}
                  onChange={e => handleMenuChange(idx, 'path', e.target.value)}
                />
                <select
                  className="border rounded px-2 py-1"
                  value={item.icon}
                  onChange={e => handleMenuChange(idx, 'icon', e.target.value)}
                >
                  <option value="Home">🏠 Home</option>
                  <option value="FileText">📝 FileText</option>
                  <option value="Landmark">🏛️ Landmark</option>
                  <option value="Building2">🏢 Building2</option>
                </select>
                <Button type="button" variant="destructive" size="sm" onClick={() => handleMenuRemove(idx)}>-</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleMenuAdd}>Ajouter un lien</Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slides du slider d'accueil</label>
          <div className="space-y-4">
            {content.slides.map((slide, idx) => (
              <div key={idx} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex gap-2 items-center">
                  <input type="file" accept="image/*" onChange={e => handleSlideImageChange(idx, e)} />
                  {slide.image && <img src={slide.image} alt="slide" className="h-16 w-24 object-cover rounded" />}
                </div>
                <Input className="w-full" placeholder="Titre" value={slide.title} onChange={e => handleSlideChange(idx, 'title', e.target.value)} />
                <Input className="w-full" placeholder="Sous-titre" value={slide.subtitle} onChange={e => handleSlideChange(idx, 'subtitle', e.target.value)} />
                <Input className="w-full" placeholder="Texte du bouton" value={slide.cta} onChange={e => handleSlideChange(idx, 'cta', e.target.value)} />
                <Input className="w-full" placeholder="Lien du bouton" value={slide.link} onChange={e => handleSlideChange(idx, 'link', e.target.value)} />
                <Button type="button" variant="destructive" size="sm" onClick={() => handleSlideRemove(idx)}>- Supprimer ce slide</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleSlideAdd}>Ajouter un slide</Button>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </CardContent>
    </Card>
  );
};