import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    Gobold: require('./src/assets/Fuentes/Goboldtitle.otf'),
    TextFont: require('./src/assets/Fuentes/Collegiate.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#07a495" />
      </View>
    );
  }

  return (
    
    <SafeAreaProvider>
      
      <NavigationContainer>
        <AppNavigator />
        
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
