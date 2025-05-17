export interface User {
  id: string;
  name: string;
  phone: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: number;
  };
  createdAt: number;
  isActive: boolean;
} 