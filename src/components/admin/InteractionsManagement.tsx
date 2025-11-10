import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  MessageCircle, 
  Heart, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Trash2,
  Edit,
  Flag,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  post_title: string;
  status: 'approved' | 'pending' | 'rejected';
  likes_count: number;
}

interface InteractionStats {
  totalComments: number;
  totalLikes: number;
  pendingComments: number;
  activeUsers: number;
  topPosts: Array<{
    id: number;
    title: string;
    likes_count: number;
    comments_count: number;
  }>;
}

const InteractionsManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const { toast } = useToast();

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Données de démonstration si l'API n'est pas disponible
      const mockComments: Comment[] = [
        {
          id: 1,
          post_id: 1,
          user_id: 2,
          content: 'Excellente initiative ! Merci pour cette plateforme qui permet de valoriser notre patrimoine local.',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author_name: 'Aminata Diallo',
          author_avatar: undefined,
          post_title: 'Bienvenue sur Kaolack Stories Connect',
          status: 'approved',
          likes_count: 5
        },
        {
          id: 2,
          post_id: 2,
          user_id: 3,
          content: 'Le marché de Kaolack est vraiment un joyau de notre ville. J\'y vais tous les matins.',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author_name: 'Mamadou Sow',
          post_title: 'Le marché central de Kaolack',
          status: 'approved',
          likes_count: 8
        },
        {
          id: 3,
          post_id: 3,
          user_id: 4,
          content: 'Commentaire inapproprié qui devrait être modéré...',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          author_name: 'Utilisateur Suspect',
          post_title: 'Festival culturel de Kaolack',
          status: 'pending',
          likes_count: 0
        },
        {
          id: 4,
          post_id: 1,
          user_id: 5,
          content: 'Super idée ! Ça va aider à préserver nos histoires pour les générations futures.',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          author_name: 'Fatou Ndoye',
          post_title: 'Bienvenue sur Kaolack Stories Connect',
          status: 'approved',
          likes_count: 12
        }
      ];

      const mockStats: InteractionStats = {
        totalComments: 25,
        totalLikes: 156,
        pendingComments: 3,
        activeUsers: 18,
        topPosts: [
          { id: 1, title: 'Bienvenue sur Kaolack Stories Connect', likes_count: 23, comments_count: 8 },
          { id: 2, title: 'Le marché central de Kaolack', likes_count: 19, comments_count: 5 },
          { id: 3, title: 'Festival culturel de Kaolack', likes_count: 15, comments_count: 7 }
        ]
      };

      setComments(mockComments);
      setStats(mockStats);

      toast({
        title: "Mode démo",
        description: "Affichage des données d'exemple (API non disponible)",
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les commentaires
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.post_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Approuver un commentaire
  const handleApproveComment = async (commentId: number) => {
    try {
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, status: 'approved' as const } : comment
      ));
      toast({
        title: "Succès",
        description: "Commentaire approuvé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le commentaire",
        variant: "destructive",
      });
    }
  };

  // Rejeter un commentaire
  const handleRejectComment = async (commentId: number) => {
    try {
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, status: 'rejected' as const } : comment
      ));
      toast({
        title: "Succès",
        description: "Commentaire rejeté",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le commentaire",
        variant: "destructive",
      });
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId: number) => {
    try {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Succès",
        description: "Commentaire supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  };

  // Modifier un commentaire
  const handleEditComment = (comment: Comment) => {
    setSelectedComment(comment);
    setEditContent(comment.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComment) return;
    
    try {
      setComments(prev => prev.map(comment => 
        comment.id === selectedComment.id ? { ...comment, content: editContent } : comment
      ));
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "Commentaire modifié",
      });
    } catch (error) {
      toast({
        title: "Erreur", 
        description: "Impossible de modifier le commentaire",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des Interactions</h2>
        <p className="text-gray-600">Gérer les commentaires et likes sur les publications</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commentaires</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.pendingComments} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Toutes publications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Modération</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingComments}</div>
              <p className="text-xs text-muted-foreground">
                Nécessitent une action
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Publications populaires */}
      {stats && stats.topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Publications les plus populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les commentaires..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <Card key={comment.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author_avatar} />
                    <AvatarFallback>
                      {comment.author_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{comment.author_name}</p>
                    <p className="text-xs text-gray-500">
                      Sur: {comment.post_title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(comment.status)}
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm mb-4">{comment.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span>{comment.likes_count} likes</span>
                </div>

                <div className="flex items-center gap-2">
                  {comment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveComment(comment.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectComment(comment.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditComment(comment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le commentaire</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
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

      {filteredComments.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucun commentaire ne correspond aux critères de recherche'
                  : 'Aucun commentaire à modérer'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le commentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              placeholder="Contenu du commentaire..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractionsManagement;