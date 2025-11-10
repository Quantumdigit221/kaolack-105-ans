import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiService, Post } from '@/services/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import CommentsSection from '@/components/CommentsSection';
import SharePostDialog from '@/components/SharePostDialog';
import { useAuth } from '@/contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/feed');
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getPosts({ page: 1, limit: 100 });
        const foundPost = response.posts.find(p => p.id === parseInt(id));
        
        if (foundPost) {
          setPost(foundPost);
          setLikes(foundPost.likes_count || foundPost.likesCount || 0);
          setCommentsCount(foundPost.comments_count || foundPost.commentsCount || 0);
          setIsLiked(foundPost.isLiked || false);
        } else {
          toast.error('Post non trouvé');
          navigate('/feed');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du post:', error);
        toast.error('Erreur lors du chargement du post');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated || !post) {
      toast.error("Vous devez être connecté pour aimer un post");
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      await apiService.toggleLike(post.id);
      
      if (isLiked) {
        setLikes(prev => prev - 1);
        setIsLiked(false);
        toast.success("Like retiré !");
      } else {
        setLikes(prev => prev + 1);
        setIsLiked(true);
        toast.success("Post aimé !");
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
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'patrimoine':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'vie-quotidienne':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'evenements':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personnalites':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post non trouvé</h1>
            <Button onClick={() => navigate('/feed')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux histoires
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <Button 
            onClick={() => navigate('/feed')} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux histoires
          </Button>

          {/* Post principal */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              {/* Auteur et métadonnées */}
              <div className="flex items-center justify-between mb-4">
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
                    <p className="font-semibold">{post.author?.full_name || post.author_name || 'Anonyme'}</p>
                    <div className="flex items-center text-sm text-muted-foreground space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getCategoryColor(post.category)} variant="outline">
                  {post.category}
                </Badge>
              </div>

              {/* Titre */}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                {post.title}
              </h1>
            </CardHeader>

            <CardContent>
              {/* Image si présente */}
              {(post.image_url || post.imageUrl) && (
                <div className="mb-6">
                  <img 
                    src={post.image_url || post.imageUrl} 
                    alt={post.title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Contenu */}
              <div className="prose max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-4 mt-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`gap-2 ${isLiked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50' : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likes}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleToggleComments}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {commentsCount}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section des commentaires */}
          <CommentsSection 
            postId={post.id} 
            isOpen={showComments}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </main>

      {/* Dialog de partage */}
      <SharePostDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        postTitle={post.title}
        postContent={post.content}
        postId={post.id}
      />
    </div>
  );
};

export default PostDetail;