import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types';

interface RecentUser extends User {
  lastSeen: number;
  distance: number;
}

interface RecentUsersModalProps {
  visible: boolean;
  onClose: () => void;
  recentUsers: Record<string, RecentUser>;
  onAddFriend: (userId: string) => void;
  onRemoveFriend: (userId: string) => void;
  friends: Record<string, User>;
}

const RecentUsersModal: React.FC<RecentUsersModalProps> = ({
  visible,
  onClose,
  recentUsers,
  onAddFriend,
  onRemoveFriend,
  friends
}) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatLastSeen = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`;
    return `Hace ${Math.floor(minutes / 1440)}d`;
  };

  const renderUserItem = ({ item }: { item: [string, RecentUser] }) => {
    const [userId, user] = item;
    const isFriend = friends[userId] !== undefined;

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          {user.description && (
            <Text style={styles.userDescription}>{user.description}</Text>
          )}
          <View style={styles.userMeta}>
            <Text style={styles.metaText}>
              <Ionicons name="location-outline" size={14} /> {formatDistance(user.distance)}
            </Text>
            <Text style={styles.metaText}>
              <Ionicons name="time-outline" size={14} /> {formatLastSeen(user.lastSeen)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, isFriend && styles.removeButton]}
          onPress={() => isFriend ? onRemoveFriend(userId) : onAddFriend(userId)}
        >
          <Ionicons 
            name={isFriend ? "trash-outline" : "person-add-outline"} 
            size={24} 
            color={isFriend ? "#d32f2f" : "#f4511e"} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Usuarios Recientes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {Object.keys(recentUsers).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No hay usuarios recientes</Text>
            </View>
          ) : (
            <FlatList
              data={Object.entries(recentUsers)}
              renderItem={renderUserItem}
              keyExtractor={([id]) => id}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  list: {
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
  },
  removeButton: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RecentUsersModal; 