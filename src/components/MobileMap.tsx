import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { get, onValue, ref, remove, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { database } from '../config/firebase';
import { User } from '../types';
import SideMenu from './SideMenu';
import UserInfoBubble from './UserInfoBubble';

interface MobileMapProps {
  location: Location.LocationObject;
  currentUser: User;
  nearbyUsers: Record<string, User>;
}

const MobileMap: React.FC<MobileMapProps> = ({ location, currentUser, nearbyUsers }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCurrentUserSelected, setIsCurrentUserSelected] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [friends, setFriends] = useState<Record<string, User>>({});
  const [recentUsers, setRecentUsers] = useState<Record<string, User & { lastSeen: number; distance: number }>>({});

  useEffect(() => {
    // Suscribirse a la lista de amigos
    const friendsRef = ref(database, `users/${currentUser.id}/friends`);
    const friendsUnsubscribe = onValue(friendsRef, async (snapshot) => {
      const friendIds = snapshot.val() || {};
      const friendsData: Record<string, User> = {};
      
      // Cargar los datos completos de cada amigo
      for (const [friendId, _] of Object.entries(friendIds)) {
        const userRef = ref(database, `users/${friendId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          friendsData[friendId] = {
            ...userSnapshot.val(),
            id: friendId
          };
        }
      }
      
      setFriends(friendsData);
    });

    // Suscribirse a usuarios recientes
    const recentUsersRef = ref(database, `users/${currentUser.id}/recentUsers`);
    const recentUsersUnsubscribe = onValue(recentUsersRef, (snapshot) => {
      const recentUsersData = snapshot.val() || {};
      setRecentUsers(recentUsersData);
    });

    return () => {
      friendsUnsubscribe();
      recentUsersUnsubscribe();
    };
  }, [currentUser.id]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  };

  const isWithinRadius = (userLocation: { latitude: number; longitude: number }): boolean => {
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      userLocation.latitude,
      userLocation.longitude
    );
    return distance <= 100; // 100 metros de radio
  };

  const filteredNearbyUsers = Object.entries(nearbyUsers).filter(([_, user]) => 
    user.location && isWithinRadius(user.location)
  );

  const handleMarkerPress = (user: User, isCurrentUser: boolean = false) => {
    setSelectedUser(user);
    setIsCurrentUserSelected(isCurrentUser);

    // Actualizar usuarios recientes
    if (!isCurrentUser && user.location) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        user.location.latitude,
        user.location.longitude
      );

      const recentUserRef = ref(database, `users/${currentUser.id}/recentUsers/${user.id}`);
      update(recentUserRef, {
        ...user,
        lastSeen: Date.now(),
        distance,
      });
    }
  };

  const handleCloseBubble = () => {
    setSelectedUser(null);
    setIsCurrentUserSelected(false);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const friendRef = ref(database, `users/${currentUser.id}/friends/${userId}`);
      // Solo guardamos true para indicar que es amigo
      await set(friendRef, true);
      Alert.alert('Éxito', 'Amigo agregado correctamente');
    } catch (error) {
      console.error('Error al agregar amigo:', error);
      Alert.alert('Error', 'No se pudo agregar el amigo');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const friendRef = ref(database, `users/${currentUser.id}/friends/${friendId}`);
      await remove(friendRef);
      Alert.alert('Éxito', 'Amigo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
      Alert.alert('Error', 'No se pudo eliminar el amigo');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const userRef = ref(database, `users/${currentUser.id}`);
      // Obtener datos actuales del usuario
      const snapshot = await get(userRef);
      const currentData = snapshot.val();
      
      // Actualizar solo los campos modificables manteniendo el resto
      await update(userRef, {
        ...currentData,
        name: updatedUser.name,
        phone: updatedUser.phone,
        description: updatedUser.description
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Tu ubicación"
          description={`${currentUser.name} - ${currentUser.phone}`}
          pinColor="blue"
          onPress={() => handleMarkerPress(currentUser, true)}
        />

        {filteredNearbyUsers.map(([userId, user]) => (
          <Marker
            key={userId}
            coordinate={{
              latitude: user.location!.latitude,
              longitude: user.location!.longitude,
            }}
            title={user.name}
            description={user.phone}
            pinColor={friends[userId] ? 'green' : 'red'}
            onPress={() => handleMarkerPress(user)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>

      {selectedUser && (
        <UserInfoBubble
          user={selectedUser}
          isCurrentUser={isCurrentUserSelected}
          distance={!isCurrentUserSelected && selectedUser.location ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            selectedUser.location.latitude,
            selectedUser.location.longitude
          ) : undefined}
          visible={true}
          onClose={handleCloseBubble}
          onAddFriend={!isCurrentUserSelected ? () => handleAddFriend(selectedUser.id) : undefined}
          isFriend={!isCurrentUserSelected && friends[selectedUser.id] !== undefined}
        />
      )}

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        currentUser={currentUser}
        friends={friends}
        recentUsers={recentUsers}
        onUpdateUser={handleUpdateUser}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: '#f4511e',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default MobileMap; 