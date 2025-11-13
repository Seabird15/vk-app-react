import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const cards = [
  {
    title: 'Equipo Ascenso',
    description:
      'El Equipo Ascenso es nuestra rama más competitiva. Un equipo comprometido con la excelencia, el rendimiento y la pasión por el fútbol. Cada entrenamiento y partido se vive con intensidad, disciplina y espíritu de lucha. Aquí es donde se representa con fuerza el carácter vikinga: garra, juego y mentalidad ganadora ⚔️🔥',
  },
  {
    title: 'Escuela Vikingas',
    description:
      'La Escuela Vikingas es donde comienza todo. Un espacio pensado para mujeres de todas las edades descubran el fútbol, aprendan desde cero y desarrollen su pasión en un ambiente de respeto, trabajo en equipo y alegría. La base donde nacen nuestras futuras guerreras 💫⚽',
  },

];

export default function CategoriasScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground
        source={{
          uri:
            'https://firebasestorage.googleapis.com/v0/b/sitiovks.firebasestorage.app/o/Fotos%2Fbg-categorias.webp?alt=media&token=bff2a04d-e0de-4219-a786-59a9fae18b26',
        }}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

    <View style={styles.cardsContainer}>
  {cards.map((card, index) => (
    <Pressable
      key={index}
      style={({ pressed }) => [
        styles.cardWrapper,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardText}>{card.description}</Text>
      </View>
    </Pressable>
  ))}
</View>

      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: '100%',
    minHeight: '100%',
    paddingTop: 100,
    paddingBottom: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardsContainer: {
  width: '100%',
  alignItems: 'center',
  paddingHorizontal: 12,
  gap: 20,
},

cardWrapper: {
  width: '100%',
  maxWidth: 500,
  borderRadius: 20,
  overflow: 'hidden',
  marginBottom: 20,
},

card: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: 24,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 10,
  elevation: 6,
},

cardPressed: {
  transform: [{ scale: 0.97 }],
},

cardTitle: {
  fontSize: 20,
 fontFamily: 'TextFont',
  color: '#07a495',
  marginBottom: 12,
  textAlign: 'center',
  textTransform: 'uppercase',
},

cardText: {
  fontSize: 16,
  color: '#444',
  textAlign: 'center',
  lineHeight: 22,
},

});
