import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Heart } from "lucide-react";

interface AdminStats {
  users: number;
  posts: number;
  comments: number;
  likes: number;
}

export const StatsCards: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    posts: 0,
    comments: 0,
    likes: 0
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
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
          setStats({
            users: data.statistics?.users?.total || 0,
            posts: data.statistics?.posts?.total || 0,
            comments: data.statistics?.comments?.total || 0,
            likes: 0
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchAdminStats();
  }, []);

  const statsData = [
    { title: "Utilisateurs", value: stats.users, icon: Users, color: "text-blue-500" },
    { title: "Publications", value: stats.posts, icon: FileText, color: "text-green-500" },
    { title: "Commentaires", value: stats.comments, icon: MessageSquare, color: "text-yellow-500" },
    { title: "Likes", value: stats.likes, icon: Heart, color: "text-red-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};