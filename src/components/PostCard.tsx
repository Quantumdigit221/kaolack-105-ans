import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import CommentsSection from "./CommentsSection";
import SharePostDialog from "./SharePostDialog";
import { apiService, Post } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  // Debug: Force recompilation to clear cache
  console.log('🔄 PostCard render with post:', post?.id, post?.author?.full_name);
  
  const [likes, setLikes] = useState(post.likes_count || post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || post.commentsCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour aimer un post");
      return;
    }

    if (isLiking) return; // Éviter les clics multiples

    setIsLiking(true);

    try {
      const response = await apiService.likePost(post.id);
      
      if (response.liked) {
        setLikes(prev => prev + 1);
        setIsLiked(true);
      } else {
        setLikes(prev => prev - 1);
        setIsLiked(false);
      }

      // Notifier le parent pour mettre à jour la liste
      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast.error("Erreur lors de l'action");
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
    if (onPostUpdate) {
      onPostUpdate();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  const handleReadMore = () => {
    window.location.href = `/post/${post.id}`;
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback>
                  {(() => {
                    try {
                      const name = post.author?.full_name || post.author_name || 'Anonyme';
                      return typeof name === 'string' && name.length >= 2 
                        ? name.slice(0, 2).toUpperCase()
                        : 'AN';
                    } catch {
                      return 'AN';
                    }
                  })()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.author?.full_name || 'Anonyme'}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary-foreground">
              {post.category}
            </span>
          </div>
          <div>
            <h3 
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={handleReadMore}
            >
              {post.title}
            </h3>
          </div>
        </CardHeader>
        
        {(post.image_url || post.imageUrl) && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={post.image_url || post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}

        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-0 p-0">
          <div className="flex items-center justify-between border-t px-6 py-3">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`gap-2 ${isLiked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`gap-2 ${showComments ? 'text-primary' : ''}`}
                onClick={handleToggleComments}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{commentsCount}</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReadMore}
                className="text-xs"
              >
                Lire plus
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <CommentsSection 
              postId={post.id} 
              isOpen={showComments}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </CardFooter>
      </Card>

      <SharePostDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        postTitle={post.title}
        postContent={post.content}
        postId={post.id}
      />
    </>
  );
};

export default PostCard;