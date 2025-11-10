import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PostsManagement = () => {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => apiService.getAllPostsForAdmin(),
  });

  // Mutation pour changer le statut d'un post
  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: number; status: 'published' | 'blocked' | 'archived' }) => {
      return await apiService.updatePostStatus(postId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Statut mis à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Erreur modification statut:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  });

  // Mutation pour supprimer un post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiService.deletePost(postId);
    },
    onSuccess: () => {
      toast.success('Publication supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  const handleStatusChange = (postId: number, status: 'published' | 'blocked' | 'archived') => {
    updateStatusMutation.mutate({ postId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Bloqué</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des posts</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gestion des Publications ({posts.length})</h3>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{post.title}</h4>
              {getStatusBadge(post.status || 'published')}
            </div>
            <p className="text-gray-600 mb-2">{post.content.substring(0, 150)}...</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
              <span>Catégorie: {post.category}</span>
              <span>Auteur: {post.author.full_name}</span>
              <span>Date: {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t">
              {post.status !== 'published' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(post.id, 'published')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              )}
              
              {post.status !== 'blocked' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(post.id, 'blocked')}
                  disabled={updateStatusMutation.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquer
                </Button>
              )}

              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeletePost(post.id)}
                disabled={deletePostMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletePostMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune publication trouvée
          </div>
        )}
      </div>
    </div>
  );
};
