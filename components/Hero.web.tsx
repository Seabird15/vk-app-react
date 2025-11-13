import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  useWindowDimensions, // 1. Importar useWindowDimensions
} from 'react-native';

const bannerUrl =
  'https://firebasestorage.googleapis.com/v0/b/web-vikingas.firebasestorage.app/o/galeria%2F6L6A7359.webp?alt=media&token=26e32bb8-1e13-43b7-a68f-f38419e6959c';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const { width, height } = useWindowDimensions(); // 2. Usar el hook

  // 3. Crear estilos dinámicos basados en el ancho de la pantalla
  const isSmallScreen = width < 768;
  const isLargeScreen = width > 1200;

  const dynamicStyles = {
    heroText: {
      fontSize: isSmallScreen ? 40 : isLargeScreen ? 72 : 56,
      lineHeight: isSmallScreen ? 42 : isLargeScreen ? 74 : 58,
      marginBottom: isSmallScreen ? 80 : 120,
    },
    textContainer: {
      left: isSmallScreen ? 24 : 48,
      right: isSmallScreen ? 24 : 48,
      bottom: isSmallScreen ? 60 : 90,
    },
    logo: {
      width: isSmallScreen ? 100 : 150,
      height: isSmallScreen ? 100 : 150,
      top: isSmallScreen ? 20 : 40,
      right: isSmallScreen ? 20 : 40,
    },
  };

  return (
    <View style={[styles.container, { height }]}>
      <ImageBackground
        source={{ uri: bannerUrl }}
        style={styles.banner}
        resizeMode="cover"
        onLoadEnd={() => setLoaded(true)}
        imageStyle={[styles.imageStyle, loaded && styles.imageLoaded]}
      >
        {/* Vignette */}
        <View style={styles.vignette} />

        {/* Texto central */}
        <View style={[styles.textContainer, dynamicStyles.textContainer]}>
          <Text style={[styles.heroText, dynamicStyles.heroText]}>
            Club deportivo{'\n'}social y cultural{'\n'}
            <Text style={styles.highlight}>vikingas</Text>
          </Text>
        </View>

        {/* Logo posicionado */}
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, dynamicStyles.logo]}
          resizeMode="contain"
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  banner: {
    flex: 1,
    justifyContent: 'center', // Centrar contenido por defecto
    alignItems: 'flex-start', // Alinear a la izquierda
    position: 'relative',
  },
  imageStyle: {
    opacity: 0,
    transform: [{ scale: 1.05 }],
    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out', // Animación suave para web
  },
  imageLoaded: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Un poco menos oscuro
  },
  textContainer: {
    position: 'absolute',
  },
  heroText: {
    fontFamily: 'Gobold',
    color: '#ffde59',
    textTransform: 'uppercase',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Sombra para legibilidad
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  highlight: {
    color: '#07a495',
  },
  logo: {
    position: 'absolute',
  },
});