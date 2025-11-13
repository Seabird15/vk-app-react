import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

// Datos del Staff - Puedes expandir esto en el futuro
const staff = [
  {
    nombre: 'Yesennia Gallardo',
    rol: 'Directora Técnica',
    icono: 'sports-soccer',
  },
 
  {
    nombre: 'Lucas',
    rol: 'Preparador Arqueras',
    icono: 'sports-soccer',
  },
  {
    nombre: 'Daniela Aravena',
    rol: 'Presidenta del Club',
    icono: 'business-center',
  },
];

export default function ClubScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* --- Encabezado con Imagen --- */}
      <ImageBackground
        source={require('../assets/banner.webp')}
        style={styles.headerBackground}
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('../assets/vk-logo-blanco.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Nuestro Club</Text>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        {/* --- Tarjeta de Historia --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="history" size={26} color="#07a495" />
            <Text style={styles.cardTitle}>Nuestra Historia</Text>
          </View>
          <Text style={styles.cardContent}>
          El Club Deportivo Vikingas nació en 2019, impulsado por la idea de crear un espacio para mujeres adultas que no habían tenido la oportunidad de aprender y disfrutar del fútbol cuando eran más jóvenes.
          Desde nuestros inicios en la Villa Andes del Sur, en Puente Alto, comenzamos con lo esencial: ganas, autogestión y un puñado de balones económicos, pero con un corazón enorme lleno de ilusión y compañerismo.
            {'\n\n'}
            Con el tiempo, ese pequeño grupo de mujeres se transformó en una comunidad unida por la pasión, el respeto y la solidaridad. Hoy, somos un referente en el fútbol femenino amateur de Puente Alto, con un equipo competitivo que ha sabido ganarse su lugar dentro del mundo del Fut7 femenino.
          </Text>
          <Text style={styles.cardContent}>
          Sin embargo, Vikingas es mucho más que un club deportivo.
          Somos un espacio social y de encuentro, donde el fútbol es la herramienta que nos une, nos impulsa y nos da voz. Creemos firmemente en la importancia de abrir oportunidades a mujeres de todas las edades, promoviendo la participación deportiva como un medio para fortalecer la autoestima, la salud y la comunidad.
            {'\n\n'}
            En Vikingas, el respeto, la unidad y el sentido de pertenencia son los pilares que nos sostienen. Crecemos juntas, celebramos juntas y enfrentamos cada desafío como una familia que no se rinde.
          </Text>
        </View>

        {/* --- Tarjeta de Misión y Visión --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="track-changes" size={26} color="#07a495" />
            <Text style={styles.cardTitle}>Misión y Visión</Text>
          </View>
          <View style={styles.subCard}>
            <Text style={styles.subCardTitle}>Misión</Text>
            <Text style={styles.cardContent}>
            Formar jugadoras integrales, empoderadas y conscientes del impacto del deporte en la sociedad, promoviendo el trabajo en equipo, la disciplina, la equidad y el respeto dentro y fuera de la cancha.
            Buscamos que cada mujer que vista la camiseta Vikinga encuentre en el club un lugar donde crecer, aprender y sentirse parte de algo más grande.
            </Text>
          </View>
          <View style={styles.subCard}>
            <Text style={styles.subCardTitle}>Visión</Text>
            <Text style={styles.cardContent}>
            Convertirnos en un club líder del fútbol femenino chileno, reconocido por su excelencia deportiva, su impacto comunitario y su compromiso con la inclusión.
            Queremos seguir abriendo puertas para más mujeres, niñas y jóvenes, sumando categorías y proyectos que fortalezcan nuestra historia y legado, manteniendo siempre firmes nuestros valores de unidad, respeto y trabajo en equipo.
            </Text>
          </View>
        </View>

        {/* --- Tarjeta de Cuerpo Técnico y Directiva --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="users" size={22} color="#07a495" />
            <Text style={styles.cardTitle}>Cuerpo Técnico y Directiva</Text>
          </View>
          <Text style={styles.cardContent}>
            Nuestro club cuenta con un equipo humano apasionado, comprometido con el desarrollo deportivo y personal de cada jugadora.
          </Text>
          <View style={styles.staffGrid}>
            {staff.map((member, index) => (
              <View key={index} style={styles.staffCard}>
                <MaterialIcons name={member.icono as any} size={32} color="#07a495" />
                <Text style={styles.staffName}>{member.nombre}</Text>
                <Text style={styles.staffRole}>{member.rol}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerBackground: {
    width: '100%',
    height: 250,
    backgroundColor: '#1e293b',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 99,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Gobold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contentContainer: {
    padding: 16,
    marginTop: -30, // Para que el contenido se monte sobre el header
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#07a495',
    marginLeft: 12,
    fontFamily: 'Gobold',
  },
  cardContent: {
    fontSize: 18,
    color: '#52677b',
    lineHeight: 24,
  },
  inlineImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 16,
  },
  subCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  staffGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  staffCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 8,
  },
  staffRole: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
});