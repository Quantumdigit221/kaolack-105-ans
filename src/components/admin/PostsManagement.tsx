import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trash2, Ban, CheckCircle, Eye, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const PostsManagement = () => {
  const queryClient = useQueryClient();

  // Mutation pour approuver un post
  const approvePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiService.approvePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Publication approuvée !');
    },
    onError: (error: Error) => {
      console.error('Erreur approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  });

  const { data: response = { posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }, isLoading, error } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => apiService.getAdminPosts(),
  });

  // Extraire le tableau des posts de la réponse
  const posts = response?.posts || [];

  // Séparer les posts en attente et publiés
  const pendingPosts = posts.filter((post: any) => post.status !== 'published');
  const publishedPosts = posts.filter((post: any) => post.status === 'published');

  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

  const handleApprove = (postId: number) => {
    approvePostMutation.mutate(postId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des publications...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des publications</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          À approuver ({pendingPosts.length})
        </Button>
        <Button
          variant={activeTab === 'published' ? 'default' : 'outline'}
          onClick={() => setActiveTab('published')}
        >
          Publiés ({publishedPosts.length})
        </Button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image */}
                <div className="md:col-span-1">
                  <div className="relative h-48 md:h-full bg-gray-100">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl.startsWith('http') ? post.imageUrl : `https://portail.kaolackcommune.sn${post.imageUrl}`}
                        alt={post.title}
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

                {/* Contenu */}
                <div className="md:col-span-2 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{post.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                        <span>Catégorie: {post.category}</span>
                        <span>Auteur: {post.author?.full_name || 'Inconnu'}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-700 line-clamp-3">{post.content}</p>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>Date: {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(post.id)}
                        disabled={approvePostMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {approvePostMutation.isPending ? 'Approbation...' : 'Approuver'}
                      </Button>
                      
                      {post.imageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(post.imageUrl.startsWith('http') ? post.imageUrl : `https://portail.kaolackcommune.sn${post.imageUrl}`, '_blank')}
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
          {pendingPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <h4 className="text-lg font-medium text-green-800 mb-2">
                  ✅ Tout est à jour !
                </h4>
                <p className="text-green-600">
                  Aucune publication en attente d'approbation
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'published' && (
        <div className="space-y-6">
          {publishedPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image */}
                <div className="md:col-span-1">
                  <div className="relative h-48 md:h-full bg-gray-100">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl.startsWith('http') ? post.imageUrl : `https://portail.kaolackcommune.sn${post.imageUrl}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        Publié
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="md:col-span-2 p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{post.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                        <span>Catégorie: {post.category}</span>
                        <span>Auteur: {post.author?.full_name || 'Inconnu'}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-700 line-clamp-3">{post.content}</p>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>Date: {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {post.imageUrl && (
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(post.imageUrl.startsWith('http') ? post.imageUrl : `https://portail.kaolackcommune.sn${post.imageUrl}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir l'image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {publishedPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  📄 Aucune publication publiée
                </h4>
                <p className="text-gray-600">
                  Aucune publication n'a encore été approuvée
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
