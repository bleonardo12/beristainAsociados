import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import CreateSessionScreen from '../screens/CreateSessionScreen';
import SessionsListScreen from '../screens/SessionsListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

// Stack Navigator principal - sin tabs inferiores
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Inicio"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'conflictiVOS',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Perfil')}
                  style={{ marginRight: 8 }}
                >
                  <Ionicons name="person-circle" size={28} color={colors.text.inverse} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Sesiones"
            component={SessionsListScreen}
            options={{ title: 'Mis Sesiones' }}
          />
          <Stack.Screen
            name="Nueva"
            component={CreateSessionScreen}
            options={{ title: 'Nueva Mediación' }}
          />
          <Stack.Screen
            name="Perfil"
            component={ProfileScreen}
            options={{ title: 'Mi Perfil' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params?.topic || 'Mediación',
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
