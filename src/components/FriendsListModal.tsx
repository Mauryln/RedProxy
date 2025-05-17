import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types';

interface FriendsListModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Record<string, User>;
  onRemoveFriend: (friendId: string) => void;
}

const FriendsListModal: React.FC<FriendsListModalProps> = ({
  visible,
  onClose,
  friends,
  onRemoveFriend,
}) => {
  const renderFriendItem = ({ item }: { item: [string, User] }) => {
    const [friendId, friend] = item;
    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <Text style={styles.friendPhone}>{friend.phone}</Text>
          {friend.description && (
            <Text style={styles.friendDescription}>{friend.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveFriend(friendId)}
        >
          <View style={styles.removeButtonContainer}>
            <Ionicons name="trash-outline" size={24} color="#d32f2f" />
          </View>
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
            <Text style={styles.title}>Mis Amigos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {Object.keys(friends).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No tienes amigos agregados</Text>
            </View>
          ) : (
            <FlatList
              data={Object.entries(friends)}
              renderItem={renderFriendItem}
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
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  friendPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  friendDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 10,
  },
  removeButtonContainer: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 20,
    padding: 8,
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

export default FriendsListModal; 