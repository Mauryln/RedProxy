import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ref, set, get, push } from 'firebase/database';
import { database } from '../config/firebase';
import { User } from '../types';
import { router } from 'expo-router';

interface UserFormProps {
  onUserCreated: (user: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name || !phone || !description) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      // Check if user exists
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      let userId: string | null = null;

      if (snapshot.exists()) {
        const users = snapshot.val();
        // Find user with same name and phone
        const existingUser = Object.entries(users).find(
          ([_, user]: [string, any]) => user.name === name && user.phone === phone
        );

        if (existingUser) {
          userId = existingUser[0];
        }
      }

      if (!userId) {
        // Create new user
        const newUserRef = push(ref(database, 'users'));
        const newUser: Omit<User, 'id'> = {
          name,
          phone,
          description,
          createdAt: Date.now()
        };
        
        await set(newUserRef, newUser);
        userId = newUserRef.key;
      }

      const user: User = { 
        id: userId!, 
        name, 
        phone, 
        description,
        createdAt: Date.now()
      };
      onUserCreated(user);
      router.push({
        pathname: '/map',
        params: { userId }
      });
    } catch (error) {
      Alert.alert('Error', 'Error al crear/iniciar sesión del usuario');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title="Registrar/Iniciar Sesión" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default UserForm; 