import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { User } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface UserInfoBubbleProps {
  user: User;
  isCurrentUser: boolean;
  distance?: number;
  visible: boolean;
  onClose: () => void;
  onAddFriend?: () => void;
  isFriend?: boolean;
}

const UserInfoBubble: React.FC<UserInfoBubbleProps> = ({
  user,
  isCurrentUser,
  distance,
  visible,
  onClose,
  onAddFriend,
  isFriend,
}) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.bubble}>
          <View style={styles.header}>
            <Text style={styles.name}>{user.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.phone}>{user.phone}</Text>
          
          {user.description && (
            <Text style={styles.description}>{user.description}</Text>
          )}

          {!isCurrentUser && distance !== undefined && (
            <Text style={styles.distance}>
              <Ionicons name="location-outline" size={14} /> {formatDistance(distance)}
            </Text>
          )}

          {!isCurrentUser && onAddFriend && (
            <TouchableOpacity
              style={[styles.addButton, isFriend && styles.friendButton]}
              onPress={onAddFriend}
            >
              <Ionicons
                name={isFriend ? "checkmark-circle" : "person-add-outline"}
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>
                {isFriend ? 'Amigo' : 'Agregar Amigo'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
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
  bubble: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '90%',
    maxWidth: 300,
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
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  friendButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserInfoBubble; 