import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Hero from '../components/Hero';
import Anuncios from '../components/Anuncios';
import Resultados from '../screens/ResultadosScreen';
import Portal from '../screens/PortalScreen';
import GraficasMatchScreen from '../screens/GraficasMatchScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import SponsorsScreen from './SponsorScreen';


export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Hero />
      <View style={styles.divider} />

      <Anuncios />
      <View style={styles.divider} />

      <Resultados />
      <View style={styles.divider} />

      <Portal />
            <View style={styles.divider} />

      <GraficasMatchScreen />

      <CategoriasScreen />
       <SponsorsScreen />
      {/* 
      <Competencias />
      <Indumentaria />
      <View style={styles.divider} />

      <RedesSociales />
      <View style={styles.divider} />

      <Sponsors /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // como en Vue
  },
  divider: {
    height: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
