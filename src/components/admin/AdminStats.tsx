import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare, 
  Activity,
  Calendar
} from "lucide-react";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    recent: number;
  };
  posts: {
    total: number;
    published: number;
    recent: number;
  };
  comments: {
    total: number;
    approved: number;
  };
}

interface AnalyticsData {
  userGrowth: Array<{ date: string; count: number }>;
  postGrowth: Array<{ date: string; count: number }>;
  categoriesStats: Array<{ category: string; count: number }>;
  topContributors?: Array<{ user: string; count: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

const AdminStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Pour la démo, si pas de topContributors dans la réponse, on simule
        if (!data.topContributors) {
          data.topContributors = [
            { user: 'Awa Diop', count: 12 },
            { user: 'Moussa Ndiaye', count: 9 },
            { user: 'Fatou Sarr', count: 7 },
            { user: 'Ibrahima Ba', count: 5 },
            { user: 'Seynabou Faye', count: 4 }
          ];
        }
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="mr-1">
                {stats?.users.active || 0} actifs
              </Badge>
              {stats?.users.recent || 0} nouveaux ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.posts.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-1">
                {stats?.posts.published || 0} publiées
              </Badge>
              {stats?.posts.recent || 0} récentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.comments.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="mr-1">
                {stats?.comments.approved || 0} approuvés
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats?.users.recent || 0) + (stats?.posts.recent || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Actions récentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles de période */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Période d'analyse:</span>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <Button
              key={days}
              variant={period === days ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(days)}
            >
              {days} jours
            </Button>
          ))}
        </div>
      </div>

      {/* Graphiques d'analyse */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">Croissance</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="contributors">Top contributeurs</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Croissance des utilisateurs */}
            <Card>
              <CardHeader>
                <CardTitle>Nouveaux Utilisateurs</CardTitle>
                <CardDescription>
                  Évolution du nombre d'inscriptions sur {period} jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Croissance des posts */}
            <Card>
              <CardHeader>
                <CardTitle>Nouvelles Publications</CardTitle>
                <CardDescription>
                  Évolution du nombre de publications sur {period} jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.postGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégories</CardTitle>
              <CardDescription>
                Distribution du contenu par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics?.categoriesStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics?.categoriesStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top contributeurs</CardTitle>
              <CardDescription>
                Utilisateurs ayant publié le plus de posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics?.topContributors || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="user" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStats;
export { AdminStats };
