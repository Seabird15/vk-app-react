import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ObjetivosAscenso'>;

const teal = '#07a495';
const yellow = '#ffde59';
const AVATAR_URL =
  'https://res.cloudinary.com/dfr2c9ry2/image/upload/v1749668677/6L6A7084_1_xhrywi.webp';

export default function ObjetivosAscensoScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Encabezado con gradiente */}
      <LinearGradient
        colors={[`${teal}66`, 'transparent']}
        style={styles.header}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Círculos difuminados */}
        <View style={[styles.circle, styles.circleTeal]} />
        <View style={[styles.circle, styles.circleYellow]} />

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Profe Yesi</Text>
          </View>
        </View>
        <Text style={styles.title}>Objetivos Equipo Ascenso</Text>
        <View style={styles.rule} />
      </LinearGradient>

      {/* Botón volver */}
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backText}>{'< '}Volver atrás</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de texto */}
      <View style={styles.textWrap}>
        <Paragraph>
          <Bold>Queridas jugadoras:</Bold>
        </Paragraph>
        <Paragraph>
          Como equipo que forma parte de la categoría de ascenso,{' '}
          <Bold>
            sabemos que la competencia es una parte esencial de nuestro camino dentro del club.
          </Bold>{' '}
          Competir implica esfuerzo, crecimiento y también reconocer que existen diferentes
          momentos, niveles y procesos individuales entre quienes lo integramos.
        </Paragraph>
        <Paragraph>
          Hoy contamos con <Bold>21 jugadoras</Bold>, pero para la competencia oficial, la
          reglamentación permite incluir un <Bold>máximo de 15 jugadoras</Bold> en la nómina...
        </Paragraph>
        <Paragraph>
          Desde quienes creamos este espacio, trabajamos cada día con la convicción de que{' '}
          <Bold>
            todas tienen el mismo derecho a formarse, mejorar y sentirse parte de este espacio
          </Bold>
          ...
        </Paragraph>
        <Paragraph>
          Es clave que cada jugadora pueda desarrollar una{' '}
          <Bold>mirada autocrítica y constructiva</Bold>...
        </Paragraph>
        <Paragraph>
          Nuestro objetivo como equipo <Bold>no es dejar a nadie afuera</Bold>...
        </Paragraph>
        <Paragraph>
          Sé que, para algunas, esto puede parecer poco y entiendo los distintos puntos de vista...
        </Paragraph>
        <Paragraph>
          Me gustaría poder reunirme con algunas de ustedes...
        </Paragraph>

        {/* Bloque PRE-TEMPORADA */}
        <View style={styles.preTemporada}>
          <Text style={styles.preTitle}>PRE-TEMPORADA SEGUNDO SEMESTRE</Text>
          <View style={{ marginTop: 8 }}>
            <Bullet><Bold>Martes:</Bold> Entrenamiento físico</Bullet>
            <Bullet><Bold>Jueves:</Bold> Amistosos de preparación</Bullet>
            <Bullet><Bold>Viernes:</Bold> Entrenamiento técnico y táctico</Bullet>
            <Bullet><Bold>Sábados:</Bold> Entrenamiento integral de fútbol 11 (físico y táctico)</Bullet>
          </View>
          <Paragraph>
            Una vez transcurrido <Bold>4 semanas de entrenamiento físico</Bold>...
          </Paragraph>
          <Paragraph>
            Llegado el momento se hará una <Bold>reunión y votación</Bold>...
          </Paragraph>
          <Paragraph>
            <Bold>Días disponibles de ligas:</Bold>
          </Paragraph>
          <View style={{ marginLeft: 16 }}>
            <Bullet>Lunes y domingos</Bullet>
            <Bullet>JUEVES LIGA DOBLE V CLAUSURA 2025</Bullet>
          </View>
          <Text style={styles.alert}>
            SABIENDO ESTA INFORMACIÓN TAMBIÉN NECESITO QUE POR INTERNO ME COMUNIQUEN SU DISPONIBILIDAD...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/** Componentes auxiliares */
function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}
function Bold({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: teal, fontWeight: 'bold' }}>{children}</Text>;
}
function Bullet({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bullet}>{'\u2022'} {children}</Text>;
}

/** Estilos */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circleTeal: {
    width: 220,
    height: 220,
    backgroundColor: `${teal}33`,
    top: '40%',
    left: '40%',
  },
  circleYellow: {
    width: 160,
    height: 160,
    backgroundColor: `${yellow}1A`,
    top: '45%',
    left: '45%',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: '#fff',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: teal,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '900', color: teal, marginTop: 16 },
  rule: { width: 80, height: 4, backgroundColor: yellow, borderRadius: 999, marginTop: 4 },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: teal,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  backText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },

  textWrap: { paddingHorizontal: 16 },
  paragraph: { color: '#fff', fontSize: 15, marginBottom: 12, lineHeight: 22 },
  bullet: { color: '#fff', fontSize: 15, marginBottom: 4, lineHeight: 22 },

  preTemporada: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: teal,
    backgroundColor: `${teal}4D`,
  },
  preTitle: { fontSize: 18, fontWeight: 'bold', color: teal, marginBottom: 4 },
  alert: {
    marginTop: 8,
    fontWeight: 'bold',
    color: yellow,
    fontSize: 15,
  },
});
