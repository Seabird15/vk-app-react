import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tus screens reales
import HomeScreen from '../screens/HomeScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import PerfilScreen from '../screens/PerfilScreen';

import EventosAscensoScreen from '../screens/EventosAscensoScreen';
import EventosEscuelaScreen from '../screens/EventosEscuelaScreen';


const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#07a495',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e7eb', // gris claro (tailwind gray-200)
          height: 70,
          paddingBottom: 16,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    
    <Tab.Screen
        name="Admin"
        component={AdminLoginScreen}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tools" size={size} color={color} />
          ),
        }}
      />
        <Tab.Screen
        name="PerfilJugador"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />

       {/* Entrenamiento Ascenso */}
        <Tab.Screen
          name="EntrenamientoAscenso"
          component={EventosAscensoScreen}
          options={{
            tabBarLabel: 'Entr. Ascenso',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="run-fast" size={size} color={color} />
            ),
          }}
        />
       {/* Entrenamiento Escuela */}
        <Tab.Screen
          name="EntrenamientoEscuela"
          component={EventosEscuelaScreen}
          options={{
            tabBarLabel: 'Entr. Escuela',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="school" size={size} color={color} />
            ),
          }}
        />
    
    </Tab.Navigator>
  );
}
