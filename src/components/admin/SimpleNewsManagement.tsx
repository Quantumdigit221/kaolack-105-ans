import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const NewsManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des actualités</h2>
          <p className="text-gray-600">Administrer les actualités et annonces de la mairie</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle actualité
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actualités de la mairie</CardTitle>
          <CardDescription>
            Interface de gestion des actualités et annonces municipales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-600 mb-4">Interface complète de gestion des actualités</p>
            <div className="text-sm text-gray-500 mb-4 space-y-1">
              <p>• Créer et éditer les actualités de la mairie</p>
              <p>• Gérer les annonces publiques</p>
              <p>• Programmer la publication</p>
              <p>• Mettre en avant sur la page d'accueil</p>
            </div>
            <p className="text-sm text-blue-600">(Interface fonctionnelle en développement...)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManagement;