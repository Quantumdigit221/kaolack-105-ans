import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Eye, Check, X, Image as ImageIcon } from 'lucide-react';

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

const PersonalitiesManagement = () => {
  const queryClient = useQueryClient();

  // Récupérer toutes les personnalités depuis l'API
  const { data: personalitiesData, isLoading, error } = useQuery({
    queryKey: ['admin-personalities'],
    queryFn: () => apiService.getPersonalities(),
  });

  const personalities = personalitiesData?.data || [];

  // Mutation pour approuver
  const approveMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const response = await fetch(`https://portail.kaolackcommune.sn/api/personalities/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'approbation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Personnalité approuvée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['admin-personalities'] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'approbation');
    },
  });

  // Mutation pour supprimer
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const response = await fetch(`https://portail.kaolackcommune.sn/api/personalities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Personnalité supprimée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['admin-personalities'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const pending = personalities.filter(p => p.status === 'pending');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Approbation des Personnalités</h3>
        <div className="text-center py-8">
          <p>Chargement des propositions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Approbation des Personnalités</h3>
        <div className="text-center py-8 text-red-600">
          <p>Erreur lors du chargement des propositions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Approbation des Personnalités ({pending.length})
        </h3>
        <Badge variant="secondary">
          {pending.length} en attente
        </Badge>
      </div>
      
      <div className="space-y-6">
        {pending.map(person => (
          <Card key={person.id} className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image */}
              <div className="md:col-span-1">
                <div className="relative h-48 md:h-full bg-gray-100">
                  {person.image ? (
                    <img
                      src={person.image.startsWith('http') ? person.image : `https://portail.kaolackcommune.sn${person.image}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      En attente
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations */}
              <div className="md:col-span-2 p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{person.name}</h4>
                    <p className="text-gray-600">{person.role} • {person.category}</p>
                    {person.proposedBy && (
                      <p className="text-sm text-gray-500">Proposé par: {person.proposedBy}</p>
                    )}
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-700 text-sm line-clamp-3">{person.description}</p>
                  </div>

                  {person.contributions && person.contributions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contributions</h5>
                      <ul className="space-y-1">
                        {person.contributions.slice(0, 3).map((contribution, index) => (
                          <li key={index} className="text-sm text-gray-700 list-disc ml-4">
                            {contribution}
                          </li>
                        ))}
                        {person.contributions.length > 3 && (
                          <li className="text-sm text-gray-500 italic">
                            ...et {person.contributions.length - 3} autres
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      onClick={() => approveMutation.mutate(person.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {approveMutation.isPending ? 'Approbation...' : 'Approuver'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(person.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                    </Button>

                    {person.image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(person.image.startsWith('http') ? person.image : `https://portail.kaolackcommune.sn${person.image}`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Voir l'image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {pending.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <h4 className="text-lg font-medium text-green-800 mb-2">
                ✅ Tout est à jour !
              </h4>
              <p className="text-green-600">
                Aucune personnalité en attente d'approbation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalitiesManagement;
