import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen.native';
import RegisterScreen from '../screens/RegisterScreen';
import AdminMenuScreen from '../screens/AdminMenuScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminJugadorasScreen from '../screens/AdminJugadorasScreen';
import EventosAscensoScreen from '../screens/EventosAscensoScreen';
import EventosEscuelaScreen from '../screens/EventosEscuelaScreen'

import JugadorasAscensoScreen from '../screens/JugadorasAscensoScreen';
import JugadorasEscuelaScreen from '../screens/JugadorasEscuelaScreen';

import ObjetivosEscuelaScreen from '../screens/ObjetivosEscuelaScreen';
import ObjetivosAscensoScreen from '../screens/ObjetivosAscensoScreen';

import PerfilJugadorScreen from '../screens/PerfilScreen.native';

import ClubScreen from '../screens/ClubScreen';
import FechasImportantesScreen from '../screens/FechasImportantesScreen';

import BottomTabsNavigator from '../components/BottomTabsNavigator';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabsNavigator} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminMenu"  component={AdminMenuScreen}  options={{ headerShown: false }} />
         <Stack.Screen
        name="JugadorasAdmin"
        component={AdminJugadorasScreen}
        options={{ headerShown: true, title: 'Administrar Jugadoras' }}
      />
        <Stack.Screen name="JugadorasAscenso" component={JugadorasAscensoScreen} options={{ headerShown: false}} />
        <Stack.Screen name="JugadorasEscuela" component={JugadorasEscuelaScreen} options={{ headerShown: false}} />
        <Stack.Screen name="ObjetivosAscenso" component={ObjetivosAscensoScreen} options={{ headerShown: false}} />
        <Stack.Screen name="ObjetivosEscuela" component={ObjetivosEscuelaScreen} options={{ headerShown: false}} />
        <Stack.Screen name="EventosAscensoScreen"    component={EventosAscensoScreen}/>
        <Stack.Screen name="EventosEscuelaScreen"    component={EventosEscuelaScreen}/>
        <Stack.Screen name="PerfilJugador"    component={PerfilJugadorScreen}/>

        <Stack.Screen name="Club" component={ClubScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FechasImportantes" component={FechasImportantesScreen} options={{ headerShown: false }} />
        
        {/* Admin Modules (Phase 3) */}
        


      </Stack.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // o blanco según tu tema
  },
});
