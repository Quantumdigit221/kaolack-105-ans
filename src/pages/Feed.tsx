import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PostCard from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
import { apiService, Post } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "patrimoine", label: "Patrimoine" },
    { value: "vie-quotidienne", label: "Vie quotidienne" },
    { value: "evenements", label: "Événements" },
    { value: "personnalites", label: "Personnalités" },
  ];

  const loadPosts = React.useCallback(async (page = 1, category = "all", reset = false) => {
    try {
      const response = await apiService.getPosts({
        page,
        limit: 10,
        category: category === "all" ? undefined : category,
      });

      // N'afficher que les posts approuvés (status 'published')
      const approvedPosts = response.posts.filter((p: any) => p.status === 'published');
      if (reset) {
        setPosts(approvedPosts);
      } else {
        setPosts(prev => [...prev, ...approvedPosts]);
      }

      setHasMore(response.pagination.page < response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch {
      toast.error("Erreur lors du chargement des posts");
    }
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await loadPosts(1, selectedCategory, true);
    setIsRefreshing(false);
  }, [selectedCategory, loadPosts]);

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoading(true);
    await loadPosts(1, category, true);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    await loadPosts(currentPage + 1, selectedCategory, false);
    setIsLoading(false);
  };

  const handlePostUpdate = () => {
    // Rafraîchir les posts après une action (like, commentaire, etc.)
    handleRefresh();
  };

  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true);
      await loadPosts(1, selectedCategory, true);
      setIsLoading(false);
    };

    loadInitialPosts();

    // Écouter les événements de création de post
    const handlePostCreated = () => {
      handleRefresh();
    };

    window.addEventListener('postCreated', handlePostCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [handleRefresh, selectedCategory, loadPosts]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Bouton de retour */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-kaolack-green via-kaolack-gold to-kaolack-orange bg-clip-text text-transparent">
            Histoires de Kaolack
          </h1>
          <p className="text-muted-foreground mt-2">
            Découvrez et partagez les histoires de notre belle ville
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
          </div>

      {/* Bouton de création de post */}
      {isAuthenticated && (
        <div className="mb-8">
          <CreatePostModal />
        </div>
      )}

      {/* Liste des posts */}
        <div className="space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune histoire trouvée
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory 
                ? `Aucune histoire dans la catégorie "${categories.find(c => c.value === selectedCategory)?.label}"`
                : "Il n'y a pas encore d'histoires partagées"
              }
            </p>
            {isAuthenticated && (
              <CreatePostModal />
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
            />
          ))
        )}
      </div>

      {/* Bouton "Charger plus" */}
      {hasMore && posts.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Charger plus d'histoires"
            )}
          </Button>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Vous avez vu toutes les histoires disponibles !
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;