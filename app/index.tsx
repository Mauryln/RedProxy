import * as Location from 'expo-location';
import { router } from 'expo-router';
import { get, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database } from '../src/config/firebase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso de ubicación para usar la aplicación');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleRegister = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Por favor, asegúrate de tener el GPS activado.');
      return;
    }

    try {
      // Verificar si el usuario ya existe
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      let existingUser = null;

      if (snapshot.exists()) {
        const users = snapshot.val();
        existingUser = Object.entries(users).find(([_, user]: [string, any]) => 
          user.phone === phone
        );
      }

      if (existingUser) {
        // Si el usuario existe, redirigir al mapa con su ID
        router.push({
          pathname: '/map',
          params: { userId: existingUser[0] }
        });
        return;
      }

      // Si el usuario no existe, crear uno nuevo
      const newUserRef = push(usersRef);
      const userData = {
        name,
        phone,
        description,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          lastUpdated: Date.now()
        },
        createdAt: Date.now(),
        isActive: true
      };

      await newUserRef.set(userData);

      // Redirigir al mapa con el nuevo ID
      router.push({
        pathname: '/map',
        params: { userId: newUserRef.key }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      Alert.alert('Error', 'No se pudo registrar el usuario. Por favor, intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>
      
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
        style={[styles.input, styles.textArea]}
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 