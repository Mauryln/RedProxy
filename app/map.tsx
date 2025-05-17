import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import MobileMap from '../src/components/MobileMap';
import WebMap from '../src/components/WebMap';
import { database } from '../src/config/firebase';
import { User } from '../src/types';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<Record<string, User>>({});
  const { userId } = useLocalSearchParams();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof userId === 'string') {
        const userRef = ref(database, `users/${userId}`);
        // Marcar usuario como activo al entrar
        await update(userRef, { isActive: true });

        // Suscribirse a cambios en el usuario actual
        const unsubscribe = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser({
              id: userId,
              ...snapshot.val()
            });
          }
        });

        let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

        // Configurar cleanup para marcar usuario como inactivo al salir
        const handleAppStateChange = async (nextAppState: string) => {
          // Limpiar el temporizador existente si hay uno
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
          }

          if (nextAppState === 'background') {
            // Iniciar temporizador de 3 segundos cuando la app va a segundo plano
            inactivityTimer = setTimeout(async () => {
              await update(userRef, { isActive: false });
            }, 3000);
          } else if (nextAppState === 'active') {
            // Si la app vuelve a activo antes de los 3 segundos, mantener activo
            await update(userRef, { isActive: true });
          }
        };

        // Suscribirse a cambios de estado de la app
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
          unsubscribe();
          appStateSubscription.remove();
          // Limpiar el temporizador si existe
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
          }
          // Marcar usuario como inactivo al desmontar el componente
          update(userRef, { isActive: false });
        };
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startLocationUpdates = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Obtener ubicación inicial
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(location);

      if (currentUser) {
        const userRef = ref(database, `users/${currentUser.id}`);
        update(userRef, {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lastUpdated: Date.now()
          }
        });
      }

      // Configurar actualización cada segundo
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // 1 segundo
          distanceInterval: 1, // 1 metro
        },
        (newLocation) => {
          setLocation(newLocation);
          if (currentUser) {
            const userRef = ref(database, `users/${currentUser.id}`);
            update(userRef, {
              location: {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                lastUpdated: Date.now()
              }
            });
          }
        }
      );
    };

    startLocationUpdates();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !location) return;

    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        const nearby: Record<string, User> = {};
        
        Object.entries(users).forEach(([userId, userData]: [string, any]) => {
          // Solo incluir usuarios activos y dentro del radio
          if (userId !== currentUser.id && userData.location && userData.isActive) {
            const distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              userData.location.latitude,
              userData.location.longitude
            );

            if (distance <= 1) {
              nearby[userId] = {
                id: userId,
                name: userData.name,
                phone: userData.phone,
                description: userData.description,
                location: userData.location,
                createdAt: userData.createdAt,
                isActive: userData.isActive
              };
            }
          }
        });

        setNearbyUsers(nearby);
      }
    });

    return () => unsubscribe();
  }, [currentUser, location]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (!location || !currentUser) {
    return null;
  }

  if (Platform.OS === 'web') {
    return <WebMap currentUser={currentUser} nearbyUsers={nearbyUsers} />;
  }

  return <MobileMap location={location} currentUser={currentUser} nearbyUsers={nearbyUsers} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  callout: {
    padding: 10,
  },
  calloutText: {
    fontSize: 14,
  },
}); 