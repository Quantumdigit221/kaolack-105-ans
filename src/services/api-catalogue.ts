// Service API pour le catalogue numérique
// Extension du service API principal

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname === 'portail.kaolackcommune.sn') {
    return 'https://portail.kaolackcommune.sn/api';
  }
  
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

class CatalogueApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
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

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export const catalogueApiService = new CatalogueApiService();
export default catalogueApiService;
