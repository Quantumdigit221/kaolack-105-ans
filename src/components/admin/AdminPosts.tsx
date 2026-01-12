import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const AdminPosts = () => {
  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const response = await apiService.getAdminPosts();
      return response;
    }
  });

  const posts = Array.isArray(postsData) ? postsData : postsData?.posts || [];

  const deletePost = useMutation({
    mutationFn: async (postId: number) => {
      await apiService.deleteAdminPost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Publication supprimée avec succès");
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("Erreur lors de la suppression");
    }
  });

  const updatePostStatus = useMutation({
    mutationFn: async ({ postId, status }: { postId: number; status: 'published' | 'blocked' | 'archived' | 'pending' }) => {
      await apiService.updatePostStatus(postId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      
      const statusMessages = {
        published: "approuvée",
        blocked: "bloquée", 
        pending: "mise en attente",
        archived: "archivée"
      };
      
      toast.success(`Publication ${statusMessages[variables.status as keyof typeof statusMessages]} avec succès`);
    },
    onError: (error) => {
      console.error("Error updating post status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des publications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant="secondary">{post.category}</Badge>
                      <Badge 
                        variant={
                          post.status === 'published' ? 'default' : 
                          post.status === 'pending' ? 'secondary' :
                          post.status === 'blocked' ? 'destructive' : 'outline'
                        }
                      >
                        {post.status === 'published' ? 'Approuvé' : 
                         post.status === 'pending' ? 'En attente' :
                         post.status === 'blocked' ? 'Bloqué' : 'Archivé'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Par {post.User?.full_name || post.User?.email || "Utilisateur"}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.likes_count || 0} j'aime
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updatePostStatus.mutate({ postId: post.id, status: 'published' })}
                          disabled={updatePostStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updatePostStatus.mutate({ postId: post.id, status: 'blocked' })}
                          disabled={updatePostStatus.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'published' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updatePostStatus.mutate({ postId: post.id, status: 'pending' })}
                        disabled={updatePostStatus.isPending}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Mettre en attente
                      </Button>
                    )}
                    
                    {post.status === 'blocked' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updatePostStatus.mutate({ postId: post.id, status: 'published' })}
                        disabled={updatePostStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePost.mutate(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPosts;
export { AdminPosts };
