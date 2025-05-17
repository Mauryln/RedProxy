import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types';
import FriendsListModal from './FriendsListModal';
import RecentUsersModal from './RecentUsersModal';
import UserProfileModal from './UserProfileModal';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User;
  friends: Record<string, User>;
  recentUsers: Record<string, User & { lastSeen: number; distance: number }>;
  onUpdateUser: (updatedUser: User) => void;
  onAddFriend: (userId: string) => void;
  onRemoveFriend: (friendId: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  currentUser,
  friends,
  recentUsers,
  onUpdateUser,
  onAddFriend,
  onRemoveFriend,
}) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isFriendsModalVisible, setIsFriendsModalVisible] = useState(false);
  const [isRecentUsersModalVisible, setIsRecentUsersModalVisible] = useState(false);

  const handleLogout = () => {
    // Aquí podrías agregar lógica de cierre de sesión si es necesario
    router.replace('/');
  };

  const menuItems = [
    {
      title: 'Mi Información',
      icon: 'person-outline',
      onPress: () => {
        onClose();
        setIsProfileModalVisible(true);
      },
    },
    {
      title: 'Amigos',
      icon: 'people-outline',
      onPress: () => {
        onClose();
        setIsFriendsModalVisible(true);
      },
    },
    {
      title: 'Usuarios Recientes',
      icon: 'time-outline',
      onPress: () => {
        onClose();
        setIsRecentUsersModalVisible(true);
      },
    },
    {
      title: 'Cerrar Sesión',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.menuContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userPhone}>{currentUser.phone}</Text>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    item.isDestructive && styles.destructiveItem
                  ]}
                  onPress={item.onPress}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.isDestructive ? '#d32f2f' : '#333'}
                    style={styles.menuIcon}
                  />
                  <Text style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveText
                  ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <UserProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        user={currentUser}
        onUpdate={onUpdateUser}
      />

      <FriendsListModal
        visible={isFriendsModalVisible}
        onClose={() => setIsFriendsModalVisible(false)}
        friends={friends}
        onRemoveFriend={onRemoveFriend}
      />

      <RecentUsersModal
        visible={isRecentUsersModalVisible}
        onClose={() => setIsRecentUsersModalVisible(false)}
        recentUsers={recentUsers}
        onAddFriend={onAddFriend}
        onRemoveFriend={onRemoveFriend}
        friends={friends}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f4511e',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuItems: {
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  destructiveItem: {
    marginTop: 20,
    backgroundColor: '#ffebee',
  },
  destructiveText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});

export default SideMenu; 