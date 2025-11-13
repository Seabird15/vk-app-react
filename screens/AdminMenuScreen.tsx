import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

//Modales
import ResultadosModal from '../components/ResultadosModal';
import NoticiasModal from '../components/NoticiasModal';
import AnunciosModal from '../components/AnunciosModal';
import CompetenciasModal from '../components/CompetenciasModal';
import IndumentariaModal from '../components/IndumentariaModal';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminMenu'>;

export default function AdminMenuScreen({ navigation }: Props) {
  const buttons = [
    { label: 'Jugadoras', icon: 'people', to: 'JugadorasAdmin' },
    { label: 'Fechas Importantes', icon: 'event-available', to: 'FechasImportantes' },
    { label: 'Gráficas', icon: 'insert-chart', action: () => setShowNoticiasModal(true)},
    { label: 'Resultados', icon: 'sports-soccer', action: () => setShowResultadosModal(true) },
    { label: 'Anuncios', icon: 'campaign', action: () => setShowAnunciosModal(true) },
    { label: 'Competencias', icon: 'emoji-events', action: () => setShowCompetenciasModal(true) },
    { label: 'Indumentaria', icon: 'shopping-bag', action: () => setShowIndumentariaModal(true) },
  ];

const [showResultadosModal, setShowResultadosModal] = useState(false);
const [showNoticiasModal, setShowNoticiasModal] = useState(false);
const [showAnunciosModal, setShowAnunciosModal] = useState(false);
const [showCompetenciasModal, setShowCompetenciasModal] = useState(false);
const [showIndumentariaModal, setShowIndumentariaModal] = useState(false);

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('adminAutenticado');
 navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
  };

return (
  <>
    <ScrollView contentContainerStyle={styles.root}>
      {/* Título */}
      <Text style={styles.title}>Panel de Administración</Text>
        {/* Botón de salir */}
      <TouchableOpacity style={styles.outBtn} onPress={cerrarSesion}>
        <Text style={styles.outText}>Salir del Admin</Text>
      </TouchableOpacity>

   <TouchableOpacity
  style={styles.volverBtn}
  onPress={() => navigation.navigate('Main')}
>
  <Text style={styles.volverText}>🏠 Volver al Home</Text>
</TouchableOpacity>

      {/* Botones del panel */}
      <View style={styles.grid}>
        {buttons.map((b) => (
          <TouchableOpacity
            key={b.label}
            style={styles.tile}
          onPress={() => {
  if (b.action) return b.action();
  if (b.to === 'JugadorasAdmin') navigation.navigate('JugadorasAdmin')
      if (b.to === 'FechasImportantes') navigation.navigate('FechasImportantes');
}}
          >
            <MaterialIcons name={b.icon as any} size={32} color="#fff" />
            <Text style={styles.tileText}>{b.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    
    </ScrollView>

    {/* ⬇️ Aquí va el modal fuera del ScrollView pero dentro del fragmento */}
    <ResultadosModal
      isVisible={showResultadosModal}
      onClose={() => setShowResultadosModal(false)}
    />
    <NoticiasModal
  isVisible={showNoticiasModal}
  onClose={() => setShowNoticiasModal(false)}
/>
<AnunciosModal
  isVisible={showAnunciosModal}
  onClose={() => setShowAnunciosModal(false)}
/>
<CompetenciasModal
  isVisible={showCompetenciasModal}
  onClose={() => setShowCompetenciasModal(false)}
/>
<IndumentariaModal
  isVisible={showIndumentariaModal}
  onClose={() => setShowIndumentariaModal(false)}
/>
  </>
);

  
}

const styles = StyleSheet.create({
  root: { padding: 24, backgroundColor: '#000', flexGrow: 1 },
  title: { color: '#fff', fontSize: 24,   fontFamily: 'Gobold', textAlign: 'center', marginBottom: 24   },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',  marginTop: 20 },
  tile: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    backgroundColor: '#07a495',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  tileText: { color: '#fff', marginTop: 8,    fontFamily: 'Gobold' },
  outBtn: { alignSelf: 'center' },
  outText: { color: '#4ea1ff', textDecorationLine: 'underline' },
  volverBtn: {
  marginTop: 20,
  backgroundColor: '#07a495',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 10,
  alignSelf: 'center',
},
volverText: {
  color: '#fff',
  fontSize: 16,
    fontFamily: 'Gobold',

},

});
