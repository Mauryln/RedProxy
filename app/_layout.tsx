import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Registro/Login',
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          title: 'Mapa',
          headerLeft: () => null,
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
