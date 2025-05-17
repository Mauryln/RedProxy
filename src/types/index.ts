export interface User {
  id: string;
  name: string;
  phone: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: number;
  };
  createdAt: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} 