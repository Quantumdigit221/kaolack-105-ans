import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AxeInterventionData {
  titre: string;
  description: string;
  contenu: string;
  [key: string]: any; // Pour les données spécifiques à chaque axe
}

export interface ItemData {
  id?: number;
  titre: string;
  description: string;
  statut?: string;
  progression?: number;
  budget?: string;
  delai?: string;
  image?: string;
  details?: string[];
  benefices?: string[];
  resultats?: string[];
  [key: string]: any;
}

class AxesInterventionService {
  // Obtenir les données d'un axe spécifique
  async getAxeData(axe: string): Promise<AxeInterventionData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/axes-intervention/${axe}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données de l'axe ${axe}:`, error);
      throw error;
    }
  }

  // Mettre à jour les données générales d'un axe
  async updateAxeData(axe: string, data: Partial<AxeInterventionData>): Promise<AxeInterventionData> {
    try {
      const response = await axios.put(`${API_BASE_URL}/axes-intervention/${axe}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'axe ${axe}:`, error);
      throw error;
    }
  }

  // Ajouter un élément (projet, initiative, événement, etc.)
  async addItem(axe: string, type: string, itemData: ItemData, imageFile?: File): Promise<ItemData> {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(itemData));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(`${API_BASE_URL}/axes-intervention/${axe}/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.item;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un élément dans ${axe}/${type}:`, error);
      throw error;
    }
  }

  // Mettre à jour un élément spécifique
  async updateItem(axe: string, type: string, id: number, itemData: Partial<ItemData>, imageFile?: File): Promise<ItemData> {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(itemData));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.put(`${API_BASE_URL}/axes-intervention/${axe}/${type}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.item;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${id} dans ${axe}/${type}:`, error);
      throw error;
    }
  }

  // Supprimer un élément
  async deleteItem(axe: string, type: string, id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/axes-intervention/${axe}/${type}/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ${id} dans ${axe}/${type}:`, error);
      throw error;
    }
  }

  // Obtenir tous les axes (pour l'admin)
  async getAllAxesData(): Promise<Record<string, AxeInterventionData>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/axes-intervention`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les axes:', error);
      throw error;
    }
  }

  // Helper pour créer un objet ItemData valide
  createItemData(data: Partial<ItemData>): ItemData {
    return {
      titre: data.titre || '',
      description: data.description || '',
      statut: data.statut || 'actif',
      progression: data.progression || 0,
      budget: data.budget || '',
      delai: data.delai || '',
      image: data.image || '',
      details: data.details || [],
      benefices: data.benefices || [],
      resultats: data.resultats || [],
      ...data
    };
  }
}

export const axesInterventionService = new AxesInterventionService();
