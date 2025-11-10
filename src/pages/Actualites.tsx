import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import { Calendar, Eye, Search, Filter } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  status: string;
  priority: number;
  featured: boolean;
  image_url?: string;
  publication_date?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    full_name: string;
  };
}

const categories = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'actualite', label: 'Actualité' },
  { value: 'evenement', label: 'Événement' },
  { value: 'annonce', label: 'Annonce' },
  { value: 'urgence', label: 'Urgence' },
  { value: 'culture', label: 'Culture' },
  { value: 'economie', label: 'Économie' },
  { value: 'social', label: 'Social' }
];

const ActualitesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  // Effet pour gérer l'affichage d'une actualité individuelle
  useEffect(() => {
    if (id && news.length > 0) {
      const foundNews = news.find(item => item.id === parseInt(id));
      if (foundNews) {
        setSelectedNews(foundNews);
      } else {
        // Actualité non trouvée
        navigate('/actualites');
      }
    } else {
      setSelectedNews(null);
    }
  }, [id, news, navigate]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNews({ 
        limit: 20,
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      });
      setNews(response.news || []);
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
      // En cas d'erreur, on affiche un tableau vide plutôt que des données fictives
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      actualite: 'bg-blue-100 text-blue-800',
      evenement: 'bg-purple-100 text-purple-800',
      annonce: 'bg-green-100 text-green-800',
      urgence: 'bg-red-100 text-red-800',
      culture: 'bg-pink-100 text-pink-800',
      economie: 'bg-yellow-100 text-yellow-800',
      social: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.filter(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Affichage d'une actualité individuelle
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Bouton retour */}
            <Button onClick={() => navigate('/actualites')} variant="ghost" className="mb-6">
              ← Retour aux actualités
            </Button>

            {/* Article principal */}
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={getCategoryColor(selectedNews.category)}>
                    {getCategoryLabel(selectedNews.category)}
                  </Badge>
                  {selectedNews.featured && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      À la une
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-gray-500 ml-auto">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(selectedNews.publication_date || selectedNews.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <CardTitle className="text-2xl md:text-3xl font-bold mb-4">
                  {selectedNews.title}
                </CardTitle>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                  <span>Par {selectedNews.author.full_name}</span>
                  <div className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    {selectedNews.views_count} vue{selectedNews.views_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {selectedNews.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedNews.image_url} 
                      alt={selectedNews.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation vers d'autres actualités */}
            <div className="text-center">
              <Button onClick={() => navigate('/actualites')} variant="outline" size="lg">
                Voir toutes les actualités
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Actualités de la Mairie
          </h1>
          <p className="text-xl text-gray-600">
            Restez informés des dernières nouvelles et annonces officielles
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher dans les actualités..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actualités en vedette */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                ⭐ À la une
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredNews.map((newsItem) => (
                <Card key={newsItem.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {newsItem.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={newsItem.image_url} 
                        alt={newsItem.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(newsItem.category)}>
                        {getCategoryLabel(newsItem.category)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-3 w-3 mr-1" />
                        {newsItem.views_count}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{newsItem.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(newsItem.publication_date || newsItem.created_at).toLocaleDateString('fr-FR')}
                      <span className="mx-2">•</span>
                      Par {newsItem.author.full_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {newsItem.excerpt || newsItem.content.substring(0, 200) + '...'}
                    </p>
                    <Button variant="outline" asChild>
                      <Link to={`/actualites/${newsItem.id}`}>
                        Lire l'article complet
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Autres actualités */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Toutes les actualités
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((newsItem) => (
              <Card key={newsItem.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {newsItem.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={newsItem.image_url} 
                      alt={newsItem.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={getCategoryColor(newsItem.category)}>
                      {getCategoryLabel(newsItem.category)}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-3 w-3 mr-1" />
                      {newsItem.views_count}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{newsItem.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(newsItem.publication_date || newsItem.created_at).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {newsItem.excerpt || newsItem.content.substring(0, 150) + '...'}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/actualites/${newsItem.id}`}>
                      Lire l'article complet
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">Aucune actualité trouvée</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Essayez de modifier vos critères de recherche.' 
                : 'Aucune actualité n\'est disponible pour le moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualitesPage;