import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ObjetivosEscuela'>;

const BG_URL =
  'https://res.cloudinary.com/dfr2c9ry2/image/upload/v1750358720/IMG_20250412_131252_1_gsn8vq.webp';
const AVATAR_URL =
  'https://res.cloudinary.com/dfr2c9ry2/image/upload/v1749668677/6L6A7084_1_xhrywi.webp';

const teal = '#07a495';
const yellow = '#ffde59';

export default function ObjetivosEscuelaScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageBackground source={{ uri: BG_URL }} style={styles.bg} imageStyle={styles.bgImg}>
        {/* Overlay en gradiente */}
        <LinearGradient
          colors={['rgba(7,164,149,0.6)', 'rgba(0,0,0,0.4)', 'rgba(255,222,89,0.2)']}
          style={StyleSheet.absoluteFillObject as any}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <ScrollView contentContainerStyle={styles.content}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Profe Yesi</Text>
                </View>
              </View>

              <Text style={styles.title}>Escuela Formativa Vikingas</Text>
              <View style={styles.rule} />
              <Text style={styles.subtitle}>
                Un espacio seguro, alegre y sin prejuicios, donde cada mujer puede descubrir su
                potencial y disfrutar del fútbol en comunidad.
              </Text>
            </View>
          </View>

          {/* Tarjetas objetivos (grid 1–2 col) */}
          <View style={styles.cards}>
            <Card colorTop={teal} emoji="🎯" textColor={teal}>
              Como escuela formativa, les compartimos los objetivos y lineamientos de esta categoría.
            </Card>

            <Card colorTop={yellow} emoji="🌱">
              Este espacio es muy especial para nosotras, ya que representa la base y el origen de
              Vikingas: un lugar creado para mujeres adultas, sin requisitos previos, donde puedan
              aprender y desarrollarse en este hermoso deporte.
            </Card>

            <Card colorTop={teal} emoji="🤝">
              Nuestra propuesta se centra en la recreación y el disfrute, mientras fomentamos la
              formación de comunidad, la amistad y un profundo trabajo de superación personal y
              conciencia sobre la importancia de la actividad física.
            </Card>

            <Card colorTop={yellow} emoji="🏆">
              A diferencia de la categoría <Text style={{ color: teal, fontWeight: 'bold' }}>"Ascenso"</Text>, aquí la competencia no es el foco principal. Sin embargo, como club también
              buscamos generar espacios de competencia sana y segura, a través de los torneos que
              organizamos especialmente para ustedes.
            </Card>

            <Card colorTop={teal} emoji="📅" wide>
              <Text>
                <Text style={{ color: teal, fontWeight: 'bold' }}>
                  ¡De hecho, ya estamos preparando un nuevo campeonato para el segundo semestre de 2025!
                </Text>
              </Text>
            </Card>

            <Card colorTop={yellow} emoji="💬" wide>
              Recuerda que a veces los procesos pueden ser frustrantes, nosotras mismas nos ponemos
              presión en algo que no necesariamente debe ser así, pero este espacio es para aprender,
              equivocarse y darnos cuenta que siempre se puede mejorar, pero por sobre todo disfrutar
              con las compañeras.
            </Card>
          </View>

          {/* Frase motivacional */}
          <View style={styles.quoteWrap}>
            <Text style={styles.quote}>
              “Aquí no importa de dónde vienes, sino las ganas que tienes de aprender, compartir y
              crecer juntas.”
            </Text>
            <View style={styles.quoteRule} />
          </View>

          {/* Botón volver */}
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.backText}>{'< '}Volver atrás</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

/** ---------- UI Pieces ---------- **/
function Card({
  children,
  colorTop,
  emoji,
  textColor = '#374151',
  wide = false,
}: {
  children: React.ReactNode;
  colorTop: string;
  emoji: string;
  textColor?: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.card, { borderTopColor: colorTop }, wide && styles.cardWide]}>
      <Text style={[styles.cardEmoji, { color: colorTop }]}>{emoji}</Text>
      <Text style={[styles.cardText, { color: textColor }]}>{children}</Text>
    </View>
  );
}

/** ---------- Styles ---------- **/
const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImg: { resizeMode: 'cover' },

  content: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },

  header: { alignItems: 'center', marginBottom: 16 },

  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 128, // 32
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  badgeText: { color: '#fff', fontWeight: '800' },

  title: {
    marginTop: 24,
    fontSize: 28, // 3xl–5xl
    fontWeight: '900',
    color: yellow,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  rule: {
    width: 120,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 999,
    marginTop: 8,
    marginBottom: 8,
    // degradado fake con overlay: usamos View simple para mantenerlo simple
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    maxWidth: 640,
  },

  cards: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderTopWidth: 4,
    alignItems: 'center',
  },
  cardWide: {
    width: '100%',
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardText: {
    textAlign: 'center',
    fontSize: 14,
    // Si cargas tu fuente:
    // fontFamily: 'GoboldText',
  },

  quoteWrap: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
  quote: {
    fontStyle: 'italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: 640,
  },
  quoteRule: {
    width: 48,
    height: 4,
    backgroundColor: yellow,
    borderRadius: 999,
    marginTop: 10,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: teal,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    elevation: 2,
  },
  backText: { color: '#fff', fontWeight: '800', marginLeft: 6 },
});
