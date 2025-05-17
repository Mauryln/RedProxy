import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';

interface WebMapProps {
  currentUser: User;
  nearbyUsers: Record<string, User>;
}

const WebMap: React.FC<WebMapProps> = ({ currentUser, nearbyUsers }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa no disponible en web</Text>
      <Text style={styles.subtitle}>Por favor, usa la aplicación móvil para ver el mapa</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Tu ubicación:</Text>
        {currentUser.location && (
          <Text style={styles.infoText}>
            Latitud: {currentUser.location.latitude.toFixed(6)}{'\n'}
            Longitud: {currentUser.location.longitude.toFixed(6)}
          </Text>
        )}
      </View>
      {Object.keys(nearbyUsers).length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Usuarios cercanos:</Text>
          {Object.entries(nearbyUsers).map(([userId, user]) => (
            <View key={userId} style={styles.userCard}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              {user.location && (
                <Text style={styles.userLocation}>
                  Latitud: {user.location.latitude.toFixed(6)}{'\n'}
                  Longitud: {user.location.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  userCard: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  userLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default WebMap; 