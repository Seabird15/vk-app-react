import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialIcons } from '@expo/vector-icons';

// --- Tipos (sin cambios) ---
type Anuncio = {
  id: string;
  titulo: string;
  detalle?: string;
  reacciones: string[];
};

type EntrenamientoResumen = {
  id: string;
  titulo: string;
  fecha: any;
  horaInicio?: any;
  horaTermino?: any;
  lugar?: string;
  equipo: string;
};

export default function Anuncios() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [ultimosAscenso, setUltimosAscenso] = useState<EntrenamientoResumen[]>([]);
  const [ultimosEscuela, setUltimosEscuela] = useState<EntrenamientoResumen[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'anuncios'), orderBy('fecha', 'desc')),
      snap => {
        setAnuncios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anuncio)));
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const qAscenso = query(
      collection(db, 'entrenamientos'),
      where('equipo', '==', 'jugadoras-ascenso'),
      orderBy('fecha', 'desc'),
      limit(5)
    );
    const unsubAscenso = onSnapshot(qAscenso, snap => {
      setUltimosAscenso(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EntrenamientoResumen))
      );
    });

    const qEscuela = query(
      collection(db, 'entrenamientos'),
      where('equipo', '==', 'jugadoras-escuela'),
      orderBy('fecha', 'desc'),
      limit(5)
    );
    const unsubEscuela = onSnapshot(qEscuela, snap => {
      setUltimosEscuela(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EntrenamientoResumen))
      );
    });

    return () => {
      unsubAscenso();
      unsubEscuela();
    };
  }, []);

  const renderEventoCard = (ent: EntrenamientoResumen, tipo: 'ascenso' | 'escuela') => {
    const fechaObj = ent.fecha?.toDate?.();
    const dia = fechaObj ? fechaObj.getDate() : '';
    const mes = fechaObj ? fechaObj.toLocaleString('es-CL', { month: 'short' }) : '';
    const semana = fechaObj ? fechaObj.toLocaleString('es-CL', { weekday: 'short' }) : '';
    const horaInicio = ent.horaInicio?.toDate?.()?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) ?? '';
    const horaTermino = ent.horaTermino?.toDate?.()?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) ?? '';
    const lugar = ent.lugar ?? 'Sin lugar';

    return (
      <TouchableOpacity
        key={ent.id}
        style={[
            tipo === 'ascenso' ? styles.eventCardAscenso : styles.eventCardEscuela,
            !isDesktop && { minWidth: 260, marginRight: 14 }
        ]}
        onPress={() => navigation.navigate(tipo === 'ascenso' ? 'EventosAscenso' : 'EventosEscuela')}
        activeOpacity={0.85}
      >
        <View style={styles.eventFechaBox}>
          <Text style={styles.eventSemana}>{semana}</Text>
          <Text style={styles.eventDia}>{dia}</Text>
          <Text style={styles.eventMes}>{mes}</Text>
        </View>
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text style={styles.eventTitle}>{ent.titulo}</Text>
          <View style={styles.eventInfoRow}>
            <MaterialIcons name="access-time" size={16} color="#64748b" />
            <Text style={styles.eventInfoText}>{horaInicio} - {horaTermino}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <MaterialIcons name="place" size={16} color="#64748b" />
            <Text style={styles.eventInfoText}>{lugar}</Text>
          </View>
        </View>
        <Text style={tipo === 'ascenso' ? styles.eventLabelAscenso : styles.eventLabelEscuela}>
          {tipo === 'ascenso' ? 'Ascenso' : 'Escuela'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Anuncio }) => (
    <View style={styles.anuncioCard}>
      <Text style={styles.anuncioTitulo}>{item.titulo}</Text>
      {item.detalle && <Text style={styles.anuncioDetalle}>{item.detalle}</Text>}
      <View style={styles.anuncioFooter}>
        <MaterialIcons name="campaign" size={18} color="#2563eb" />
        <Text style={styles.anuncioReacciones}>
          {(item.reacciones && item.reacciones.length) || 0} reacciones
        </Text>
      </View>
    </View>
  );

  const EventosSection = () => (
    <>
      <Text style={styles.sectionTitle}>🗓️ Eventos destacados</Text>
      <Text style={styles.sectionSubtitle}>¡No te pierdas los próximos entrenamientos!</Text>

      <Text style={styles.carruselTitle}>Ascenso</Text>
      {isDesktop ? (
        <View style={{ gap: 12, marginBottom: 12 }}>
          {ultimosAscenso.length > 0 ? ultimosAscenso.map(ent => renderEventoCard(ent, 'ascenso')) : <Text style={styles.noAnuncios}>No hay eventos de ascenso.</Text>}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {ultimosAscenso.length > 0 ? ultimosAscenso.map(ent => renderEventoCard(ent, 'ascenso')) : <View style={styles.eventCardEmpty}><Text>No hay eventos.</Text></View>}
        </ScrollView>
      )}

      <Text style={styles.carruselTitle}>Escuela</Text>
      {isDesktop ? (
        <View style={{ gap: 12, marginBottom: 12 }}>
          {ultimosEscuela.length > 0 ? ultimosEscuela.map(ent => renderEventoCard(ent, 'escuela')) : <Text style={styles.noAnuncios}>No hay eventos de escuela.</Text>}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {ultimosEscuela.length > 0 ? ultimosEscuela.map(ent => renderEventoCard(ent, 'escuela')) : <View style={styles.eventCardEmpty}><Text>No hay eventos.</Text></View>}
        </ScrollView>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {/* --- BOTÓN PARA VOLVER AL INICIO --- */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={20} color="#07a495" />
        <Text style={styles.backButtonText}>Volver al Inicio</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 32 : 0 }}>
        
        <View style={{ flex: isDesktop ? 1 : 0 }}>
          <EventosSection />
        </View>

        <View style={{ flex: isDesktop ? 1 : 0, marginTop: isDesktop ? 0 : 24 }}>
          <Text style={styles.sectionTitle}>📢 Anuncios</Text>
          {anuncios.length === 0 ? (
            <Text style={styles.noAnuncios}>No hay anuncios por ahora.</Text>
          ) : (
            <FlatList
              data={anuncios}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false} 
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    minHeight: 700,
  },
  // --- ESTILOS PARA EL BOTÓN DE VOLVER ---
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
  },
  backButtonText: {
    marginLeft: 8,
    color: '#07a495',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: 'Gobold',
    fontSize: 22,
    marginBottom: 4,
    color: '#07a495',
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'left',
  },
  carruselTitle: {
    fontFamily: 'Gobold',
    fontSize: 18,
    marginBottom: 12,
    color: '#1e293b',
  },
  eventCardAscenso: {
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 14,
    paddingTop: 26,
    elevation: 3,
    borderColor: '#bae6fd',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
    width: '100%',
  },
  eventCardEscuela: {
    backgroundColor: '#fef9c3',
    borderRadius: 16,
    padding: 14,
    paddingTop: 26,
    elevation: 3,
    borderColor: '#fde047',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
    width: '100%',
  },
  eventCardEmpty: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 24,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  eventFechaBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 48,
    alignSelf: 'center',
  },
  eventSemana: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  eventDia: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  eventMes: {
    color: '#475569',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  eventTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: 16,
    marginBottom: 2,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  eventInfoText: {
    color: '#64748b',
    fontSize: 13,
  },
  eventLabelAscenso: {
    backgroundColor: '#38bdf8',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  eventLabelEscuela: {
    backgroundColor: '#facc15',
    color: '#422006',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  anuncioCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  anuncioTitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  anuncioDetalle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  anuncioFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  anuncioReacciones: {
    color: '#2563eb',
    fontSize: 13,
  },
  noAnuncios: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 15,
  },
});