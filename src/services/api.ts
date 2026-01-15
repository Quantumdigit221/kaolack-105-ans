// Service API pour remplacer Supabase
// Détection automatique de l'environnement
const getApiBaseUrl = () => {
  // Si VITE_API_URL est définie, l'utiliser
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Si on est en production (URL contient le domaine de production)
  if (typeof window !== 'undefined' && window.location.hostname === 'portail.kaolackcommune.sn') {
    return 'https://portail.kaolackcommune.sn/api';
  }
  
  // Sinon, utiliser localhost pour le développement (port 3001 par défaut du backend)
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
    /**
     * Définit le token d'authentification et le stocke dans localStorage.
     * @param token Le token JWT ou null pour supprimer
     */
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }


  // Approuver un post (admin)
  async approvePost(postId: number) {
    return this.request<{ message: string; post: any }>(`/admin/posts/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
    });
  }
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // ===== SLIDES (CRUD) =====
  async getSlides() {
    return this.request<any[]>('/slides', { method: 'GET' });
  }

  async getSlide(id: number) {
    return this.request<any>(`/slides/${id}`, { method: 'GET' });
  }

  async createSlide(slide: { title: string; subtitle?: string; bg?: string; logo?: boolean; image?: string }) {
    return this.request<any>('/slides', {
      method: 'POST',
      body: JSON.stringify(slide),
    });
  }

  async updateSlide(id: number, slide: { title: string; subtitle?: string; bg?: string; logo?: boolean; image?: string }) {
    return this.request<any>(`/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide),
    });
  }



  // Méthode pour obtenir les headers avec authentification
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    // Log de la requête pour debug
    console.log(`🌐 [API] ${options.method || 'GET'} ${url}`);
    console.log('🌐 [API] Headers:', config.headers);
    if (config.body) {
      console.log('🌐 [API] Body:', config.body);
    }

    try {
      const response = await fetch(url, config);
      
      console.log(`🌐 [API] Réponse: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`🌐 [API] Erreur ${response.status}:`, errorData);
        
        // Gestion spéciale des erreurs d'authentification
        if (response.status === 403 && errorData.error?.includes('Token expiré')) {
          // Token expiré - déconnexion automatique
          console.warn('🚨 Token expiré - déconnexion automatique');
          this.logout();
          
          // Émettre un événement personnalisé pour informer l'application
          window.dispatchEvent(new CustomEvent('auth:token-expired', {
            detail: { message: 'Votre session a expiré. Veuillez vous reconnecter.' }
          }));
          
          // Créer une erreur spécifique pour cette situation
          const error = new Error('Session expirée') as any;
          error.code = 'TOKEN_EXPIRED';
          error.response = { status: 403, data: errorData };
          throw error;
        }
        
        if (response.status === 401) {
          console.warn('🚨 Non autorisé - token invalide ou manquant');
          this.logout();
          
          // Émettre un événement pour non autorisé
          window.dispatchEvent(new CustomEvent('auth:unauthorized', {
            detail: { message: 'Accès non autorisé. Veuillez vous connecter.' }
          }));
          
          const error = new Error('Non autorisé') as any;
          error.code = 'UNAUTHORIZED';
          error.response = { status: 401, data: errorData };
          throw error;
        }
        
        // Créer une erreur avec plus de détails
        const error = new Error(errorData.error || `HTTP ${response.status}`) as any;
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      const data = await response.json();
      console.log(`🌐 [API] Succès:`, data);
      return data;
    } catch (error) {
      console.error(`🌐 [API] Erreur (${endpoint}):`, error);
      throw error;
    }
  }

  // ===== AUTHENTIFICATION =====

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    city?: string;
    address?: string;
    bio?: string;
  }) {
    const response = await this.request<{
      message: string;
      token: string;
      user: {
        id: number;
        email: string;
        full_name: string;
        city?: string;
        role: string;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      message: string;
      token: string;
      user: {
        id: number;
        email: string;
        full_name: string;
        avatar_url?: string;
        city?: string;
        role: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.setToken(null);
    return Promise.resolve();
  }

  async getCurrentUser() {
    return this.request<{
      id: number;
      email: string;
      full_name: string;
      avatar_url?: string;
      city?: string;
      role: string;
      created_at: string;
      posts_count?: number;
      comments_count?: number;
    }>('/auth/me');
  }

  // ===== POSTS =====

  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/posts?${queryString}` : '/posts';

    return this.request<{
      posts: Array<{
        id: number;
        user_id: number;
        title: string;
        content: string;
        category: string;
        image_url?: string;
        likes_count: number;
        comments_count: number;
        created_at: string;
        updated_at: string;
        author_name: string;
        author_avatar?: string;
        is_liked: boolean;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async getPost(id: number) {
    return this.request<{
      id: number;
      user_id: number;
      title: string;
      content: string;
      category: string;
      image_url?: string;
      likes_count: number;
      comments_count: number;
      created_at: string;
      updated_at: string;
      author_name: string;
      author_avatar?: string;
      is_liked: boolean;
    }>(`/posts/${id}`);
  }

  async createPost(postData: {
    title: string;
    content: string;
    category: string;
    image_url?: string;
  }) {
    return this.request<{
      message: string;
      post: {
        id: number;
        user_id: number;
        title: string;
        content: string;
        category: string;
        image_url?: string;
        likes_count: number;
        comments_count: number;
        created_at: string;
        author_name: string;
        author_avatar?: string;
        is_liked: boolean;
      };
    }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: number, postData: {
    title: string;
    content: string;
    category: string;
    image_url?: string;
  }) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: number) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: number) {
    return this.request<{ message: string; liked: boolean }>(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  // ===== COMMENTAIRES =====

  async getComments(postId: number, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/comments/${postId}?${queryString}` : `/comments/${postId}`;

    return this.request<{
      comments: Array<{
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: string;
        updated_at: string;
        author_name: string;
        author_avatar?: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async createComment(commentData: {
    post_id: number;
    content: string;
  }) {
    return this.request<{
      message: string;
      comment: {
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: string;
        author_name: string;
        author_avatar?: string;
      };
    }>('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(id: number, content: string) {
    return this.request<{ message: string }>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: number) {
    return this.request<{ message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== UPLOAD D'IMAGES =====

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseUrl}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ===== ADMIN =====

  async getAdminDashboard() {
    return this.request<{
      statistics: {
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
      };
    }>('/admin/dashboard');
  }

  async getAdminUsers(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';

    return this.request<{
      users: Array<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        is_active: boolean;
        created_at: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async updateUserStatus(userId: number, data: { is_active?: boolean; role?: string }) {
    return this.request<{
      message: string;
      user: {
        id: number;
        email: string;
        full_name: string;
        role: string;
        is_active: boolean;
      };
    }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminPosts(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/posts?${queryString}` : '/admin/posts';

    return this.request<{
      posts: Array<{
        id: number;
        title: string;
        content: string;
        category: string;
        created_at: string;
        author: {
          id: number;
          full_name: string;
          email: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async deleteAdminPost(postId: number) {
    return this.request<{ message: string }>(`/admin/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async updatePostStatus(postId: number, status: 'published' | 'blocked' | 'archived' | 'pending') {
    return this.request<{
      message: string;
      post: {
        id: number;
        title: string;
        status: string;
        author: {
          id: number;
          full_name: string;
          email: string;
        };
      };
    }>(`/admin/posts/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ===== ACTUALITÉS/NEWS =====

  async getNews(params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    status?: string; 
    featured?: boolean 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.featured) searchParams.append('featured', params.featured.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/news?${queryString}` : '/news';

    return this.request<{
      news: Array<{
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
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  async getFeaturedNews() {
    return this.request<{
      news: Array<{
        id: number;
        title: string;
        content: string;
        excerpt?: string;
        category: string;
        image_url?: string;
        publication_date?: string;
        author: {
          id: number;
          full_name: string;
        };
      }>;
    }>('/news/featured');
  }

  async getNewsById(id: number) {
    return this.request<{
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
    }(`/news/${id}`);
  }

  // Admin News
  async getAdminNews(params?: { page?: number; limit?: number; status?: string; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/news/admin/all?${queryString}` : '/news/admin/all';

    return this.request<{
      news: Array<{
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
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
  }

  // ===== NEWS =====

  async getAllNews() {
    return this.request<{
      message: string;
      data: Array<{
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
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/news/admin');
  }

  async getAllNewsForAdmin() {
    return this.getAllNews();
  }

  async createNews(data: {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    image_url?: string;
    priority?: number;
    featured?: boolean;
  }) {
    return this.request<{
      message: string;
      news: any;
    }>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNews(id: number, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    image_url?: string;
    status?: string;
    priority?: number;
    featured?: boolean;
  }) {
    return this.request<{
      message: string;
      news: any;
    }>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNews(id: number) {
    return this.request<{
      message: string;
    }>(`/news/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicNews() {
    return this.request<{
      message: string;
      data: Array<{
        id: number;
        title: string;
        content: string;
        category: string;
        priority: number;
        featured: boolean;
        publishedAt: string;
        image?: string;
      }>;
    }>('/news');
  }

  async getNewsStats() {
    return this.request<{
      total: number;
      published: number;
      draft: number;
      featured: number;
      categories: Array<{
        category: string;
        count: number;
      }>;
    }>('/news/admin/stats');
  }

  // ===== UTILISATEURS =====

  async getUserProfile() {
    return this.request<{
      id: number;
      email: string;
      full_name: string;
      avatar_url?: string;
      city?: string;
      role: string;
      created_at: string;
      posts_count: number;
      comments_count: number;
    }>('/users/profile');
  }

  // ===== CATALOGUE NUMÉRIQUE =====

  async getCatalogues(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    return this.request<{
      catalogues: Array<{
        id: number;
        title: string;
        personality: string;
        description: string;
        pdf_url: string;
        status: string;
        featured: boolean;
        views_count: number;
        created_at: string;
        author?: {
          id: number;
          full_name: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/catalogue?${searchParams.toString()}`);
  }

  async getCatalogueById(id: number) {
    return this.request<{
      id: number;
      title: string;
      personality: string;
      description: string;
      pdf_url: string;
      status: string;
      featured: boolean;
      views_count: number;
      created_at: string;
      author?: {
        id: number;
        full_name: string;
      };
    }>(`/catalogue/${id}`);
  }

  async getAdminCatalogues(status?: string, search?: string) {
    const searchParams = new URLSearchParams();
    if (status && status !== 'all') searchParams.append('status', status);
    if (search) searchParams.append('search', search);

    return this.request<{
      catalogues: Array<{
        id: number;
        title: string;
        personality: string;
        description: string;
        pdf_url: string;
        status: string;
        featured: boolean;
        views_count: number;
        created_at: string;
        author?: {
          id: number;
          full_name: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/catalogue/admin/all?${searchParams.toString()}`);
  }

  async createCatalogue(formData: FormData) {
    return this.request<{
      message: string;
      catalogue: any;
    }>('/catalogue/admin', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateCatalogue(id: number, formData: FormData) {
    return this.request<{
      message: string;
      catalogue: any;
    }>(`/catalogue/admin/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteCatalogue(id: number) {
    return this.request<{ message: string }>(`/catalogue/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Bot - Recherche web sur Kaolack
  async searchKaolackInfo(query: string) {
    return this.request<{ success: boolean; answer: string; source: string }>('/bot/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }
}

// Instance singleton
export const apiService = new ApiService();

// Types pour TypeScript
export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  posts_count?: number;
  comments_count?: number;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  status?: 'draft' | 'published' | 'blocked' | 'archived';
  image_url?: string;
  imageUrl?: string; // Support pour le format backend
  likes_count: number;
  likesCount?: number; // Support pour le format backend
  comments_count: number;
  commentsCount?: number; // Support pour le format backend
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
  // Anciens champs pour compatibilité
  author_name?: string;
  author_avatar?: string;
  is_liked?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
}

export default apiService;
