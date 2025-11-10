import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { apiService, Comment } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CommentsSectionProps {
  postId: number;
  isOpen: boolean;
  onCommentAdded?: () => void;
}

const CommentsSection = ({ postId, isOpen, onCommentAdded }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [postId, isOpen]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getComments(postId);
      setComments(response.comments);
    } catch (error: any) {
      console.error('Erreur lors du chargement des commentaires:', error);
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour commenter");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.createComment({
        post_id: postId,
        content: newComment.trim(),
      });

      toast.success("Commentaire ajouté !");
      setNewComment("");
      
      // Ajouter le nouveau commentaire à la liste
      setComments(prev => [response.comment, ...prev]);
      
      // Notifier le parent
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error(error.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Formulaire d'ajout de commentaire */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="min-h-[80px] resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Commenter
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucun commentaire pour le moment. Soyez le premier à commenter !
          </p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author_avatar || undefined} />
                  <AvatarFallback>
                    {comment.author_name?.slice(0, 2).toUpperCase() || 'AN'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {comment.author_name || 'Anonyme'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;

