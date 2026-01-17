import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
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
        <div className="space-y-4">
          {pendingPosts.map((post: any) => (
            <div key={post.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-lg">{post.title}</h4>
              </div>
              <p className="text-gray-600 mb-2">{post.content.substring(0, 150)}...</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span>Catégorie: {post.category}</span>
                <span>Auteur: {post.author.full_name}</span>
                <span>Date: {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleApprove(post.id)}
                  disabled={approvePostMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              </div>
            </div>
          ))}
          {pendingPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune publication à approuver
            </div>
          )}
        </div>
      )}

      {activeTab === 'published' && (
        <div className="space-y-4">
          {publishedPosts.map((post: any) => (
            <div key={post.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-lg">{post.title}</h4>
              </div>
              <p className="text-gray-600 mb-2">{post.content.substring(0, 150)}...</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span>Catégorie: {post.category}</span>
                <span>Auteur: {post.author.full_name}</span>
                <span>Date: {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))}
          {publishedPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune publication publiée
            </div>
          )}
        </div>
      )}
    </div>
  );
};
