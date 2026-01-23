import { useState, useEffect } from 'react';
import { Building2, TrendingUp, Building, Users, Plus, Edit, Trash2, Save, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { axesInterventionService, ItemData } from '@/services/axesInterventionService';

const AxesInterventionManager = () => {
  const [activeAxe, setActiveAxe] = useState('urbanisme');
  const [axeData, setAxeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const axes = [
    { id: 'urbanisme', name: 'Urbanisme & Infrastructure', icon: Building2 },
    { id: 'economie', name: 'Développement Économique', icon: TrendingUp },
    { id: 'culture', name: 'Culture & Patrimoine', icon: Building },
    { id: 'services', name: 'Services aux Citoyens', icon: Users }
  ];

  const getSectionsForAxe = (axe: string) => {
    switch (axe) {
      case 'urbanisme':
        return [
          { id: 'projets', name: 'Projets' },
          { id: 'services', name: 'Services' },
          { id: 'actualites', name: 'Actualités' }
        ];
      case 'economie':
        return [
          { id: 'initiatives', name: 'Initiatives' },
          { id: 'statistiques', name: 'Statistiques' },
          { id: 'secteurs', name: 'Secteurs' },
          { id: 'opportunites', name: 'Opportunités' }
        ];
      case 'culture':
        return [
          { id: 'sitesPatrimoniaux', name: 'Sites Patrimoniaux' },
          { id: 'evenements', name: 'Événements' },
          { id: 'artistes', name: 'Artistes' }
        ];
      case 'services':
        return [
          { id: 'servicesAdministratifs', name: 'Services Administratifs' },
          { id: 'servicesSociaux', name: 'Services Sociaux' },
          { id: 'servicesTechniques', name: 'Services Techniques' }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    loadAxeData();
  }, [activeAxe]);

  const loadAxeData = async () => {
    try {
      setLoading(true);
      const data = await axesInterventionService.getAxeData(activeAxe);
      setAxeData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (sectionId: string) => {
    if (!editingItem) return;

    try {
      setSaving(true);
      
      if (editingItem.id) {
        await axesInterventionService.updateItem(activeAxe, sectionId, editingItem.id, editingItem, imageFile || undefined);
      } else {
        await axesInterventionService.addItem(activeAxe, sectionId, editingItem, imageFile || undefined);
      }
      
      await loadAxeData();
      setIsDialogOpen(false);
      setEditingItem(null);
      setImageFile(null);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (sectionId: string, itemId: number) => {
    if (!confirm('Supprimer cet élément ?')) return;

    try {
      await axesInterventionService.deleteItem(activeAxe, sectionId, itemId);
      await loadAxeData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  const sections = getSectionsForAxe(activeAxe);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Axes d'Intervention</h1>

      {/* Sélection de l'axe */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {axes.map((axe) => (
          <Button
            key={axe.id}
            variant={activeAxe === axe.id ? "default" : "outline"}
            onClick={() => setActiveAxe(axe.id)}
            className="flex items-center gap-2"
          >
            <axe.icon className="h-4 w-4" />
            {axe.name}
          </Button>
        ))}
      </div>

      {/* Informations générales de l'axe */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input
              value={axeData?.titre || ''}
              onChange={(e) => setAxeData({...axeData, titre: e.target.value})}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={axeData?.description || ''}
              onChange={(e) => setAxeData({...axeData, description: e.target.value})}
            />
          </div>
          <div>
            <Label>Contenu</Label>
            <Textarea
              value={axeData?.contenu || ''}
              onChange={(e) => setAxeData({...axeData, contenu: e.target.value})}
              rows={4}
            />
          </div>
          <Button onClick={() => axesInterventionService.updateAxeData(activeAxe, axeData)}>
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Sections de l'axe */}
      <Tabs defaultValue={sections[0]?.id}>
        <TabsList>
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{section.name}</h2>
              <Button onClick={() => {
                setEditingItem(axesInterventionService.createItemData({}));
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="grid gap-4">
              {axeData?.[section.id]?.map((item: ItemData) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.titre}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingItem(item);
                          setIsDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteItem(section.id, item.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog pour éditer/ajouter un élément */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Modifier' : 'Ajouter'} un élément
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={editingItem?.titre || ''}
                onChange={(e) => setEditingItem({...editingItem!, titre: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={editingItem?.description || ''}
                onChange={(e) => setEditingItem({...editingItem!, description: e.target.value})}
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={editingItem?.statut || 'actif'} onValueChange={(value) => setEditingItem({...editingItem!, statut: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => handleSaveItem(sections.find(s => axeData?.[s.id])?.id || '')} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AxesInterventionManager;
