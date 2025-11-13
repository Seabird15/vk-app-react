import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';

const bannerUrl =
  'https://firebasestorage.googleapis.com/v0/b/web-vikingas.firebasestorage.app/o/galeria%2F6L6A7359.webp?alt=media&token=26e32bb8-1e13-43b7-a68f-f38419e6959c';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: bannerUrl }}
        style={styles.banner}
        resizeMode="cover"
        onLoadEnd={() => setLoaded(true)}
        imageStyle={[
          styles.imageStyle,
          loaded && styles.imageLoaded,
        ]}
      >
        {/* Vignette */}
        <View style={styles.vignette} />

        {/* Texto central */}
        <View style={styles.textContainer}>
     <Text style={styles.heroText}>
  Club deportivo{'\n'}social y cultural{'\n'}
  <Text style={styles.highlight}>vikingas</Text>
</Text>
        </View>

        {/* Logo posicionado */}
        {screenWidth >= 768 && (
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
  },
  banner: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  imageStyle: {
    opacity: 0,
    transform: [{ scale: 1.05 }],
  },
  imageLoaded: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 90,
    left: 24,
    right: 24,
  },
  heroText: {
    fontFamily: 'Gobold',
    fontSize: 56,
    lineHeight: 58,
    marginBottom: 120,
    color: '#ffde59', 
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  highlight: {
    color: '#07a495',
  },
  logo: {
    position: 'absolute',
    width: '40%',
    height: 150,
    top: 40,
    right: -80,
  },
});
