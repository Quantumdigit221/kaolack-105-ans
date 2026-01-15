import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PostsManagement } from '@/components/admin/PostsManagement';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { NewsManagement } from '@/components/admin/NewsManagement';
import { Button } from '@/components/ui/button';
import { FileText, Users, Newspaper, UserCheck, Image as ImageIcon, UserCircle } from 'lucide-react';
import { AdminSlidesManager } from '@/components/admin/AdminSlidesManager';
import PersonalitiesManagement from '@/components/admin/PersonalitiesManagement';
import { AdminMaireManager } from '@/components/admin/AdminMaireManager';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'news' | 'personalities' | 'slides' | 'maire'>('posts');

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">Tableau de bord administrateur</p>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <Button
                variant={activeTab === 'posts' ? 'default' : 'ghost'}
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-blue-500"
                onClick={() => setActiveTab('posts')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Publications
              </Button>
              <Button
                variant={activeTab === 'users' ? 'default' : 'ghost'}
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-blue-500"
                onClick={() => setActiveTab('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
              <Button
                variant={activeTab === 'news' ? 'default' : 'ghost'}
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-blue-500"
                onClick={() => setActiveTab('news')}
              >
                <Newspaper className="h-4 w-4 mr-2" />
                Actualités
              </Button>
              <Button
                variant={activeTab === 'personalities' ? 'default' : 'ghost'}
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-blue-500"
                onClick={() => setActiveTab('personalities')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Personnalités
              </Button>
              <Button
                variant={activeTab === 'slides' ? 'default' : 'ghost'}
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-blue-500"
                onClick={() => setActiveTab('slides')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Slides Accueil
              </Button>
            </nav>
          </div>
          {activeTab === 'slides' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gestion des Slides d'Accueil</h2>
              <p className="text-gray-600 mb-6">Ajoutez, modifiez ou supprimez les slides de la page d'accueil Kaolack 105</p>
              <AdminSlidesManager />
            </div>
          )}

          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestion des Publications</h2>
                <p className="text-gray-600 mb-6">Modération et suppression des publications</p>
                <PostsManagement />
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestion des Utilisateurs</h2>
                <p className="text-gray-600 mb-6">Administration des comptes utilisateurs</p>
                <UsersManagement />
              </div>
            )}

            {activeTab === 'news' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestion des Actualités</h2>
                <p className="text-gray-600 mb-6">Actualités et annonces officielles de la mairie</p>
                <NewsManagement />
              </div>
            )}

            {activeTab === 'personalities' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestion des Personnalités</h2>
                <p className="text-gray-600 mb-6">Approbation des propositions de personnalités</p>
                <PersonalitiesManagement />
              </div>
            )}

            {activeTab === 'maire' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestion de la Présentation du Maire</h2>
                <p className="text-gray-600 mb-6">Modifiez les informations et la photo du maire affichées sur la page d'accueil</p>
                <AdminMaireManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
