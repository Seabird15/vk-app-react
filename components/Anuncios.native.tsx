import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialIcons } from '@expo/vector-icons';

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
        style={tipo === 'ascenso' ? styles.eventCardAscenso : styles.eventCardEscuela}
        onPress={() => navigation.navigate(tipo === 'ascenso' ? 'EventosAscensoScreen' : 'EventosEscuelaScreen')}
        activeOpacity={0.85}
      >
        <View style={styles.eventFechaBox}>
          <Text style={styles.eventSemana}>{semana}</Text>
          <Text style={styles.eventDia}>{dia}</Text>
          <Text style={styles.eventMes}>{mes}</Text>
        </View>
        <View style={{ flex: 1 }}>
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
        <Text style={styles.anuncioReacciones}>{item.reacciones.length} Visto</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🗓️ Eventos destacados del club</Text>
      <Text style={styles.sectionSubtitle}>¡No te pierdas los próximos entrenamientos!</Text>

      <Text style={styles.carruselTitle}>Ascenso</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {ultimosAscenso.length === 0 ? (
          <View style={styles.eventCardEmpty}>
            <Text style={{ color: '#64748b', fontStyle: 'italic' }}>No hay eventos de ascenso aún</Text>
          </View>
        ) : (
          ultimosAscenso.map(ent => renderEventoCard(ent, 'ascenso'))
        )}
      </ScrollView>

      <Text style={styles.carruselTitle}>Escuela</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {ultimosEscuela.length === 0 ? (
          <View style={styles.eventCardEmpty}>
            <Text style={{ color: '#92400e', fontStyle: 'italic' }}>No hay eventos de escuela aún</Text>
          </View>
        ) : (
          ultimosEscuela.map(ent => renderEventoCard(ent, 'escuela'))
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>📢 Anuncios</Text>
      {anuncios.length === 0 ? (
        <Text style={styles.noAnuncios}>No hay anuncios aún</Text>
      ) : (
        <FlatList
          data={anuncios}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  sectionTitle: {
fontFamily: 'Gobold',
    fontSize: 20,
    marginBottom: 4,
    color: '#07a495',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  carruselTitle: {
fontFamily: 'Gobold',
    fontSize: 16,
    marginBottom: 6,
    color: '#07a495',
    marginLeft: 4,
  },
  eventCardAscenso: {
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 14,
    paddingTop: 26,
    marginRight: 14,
    minWidth: 260,
    elevation: 3,
    borderColor: '#38bdf8',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  eventCardEscuela: {
    backgroundColor: '#fef9c3',
    borderRadius: 16,
    padding: 14,
        paddingTop: 26,
    marginRight: 14,
    minWidth: 260,
    elevation: 3,
    borderColor: '#fde047',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  eventCardEmpty: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 24,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 1,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  eventFechaBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    minWidth: 48,
  },
  eventSemana: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  eventDia: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  eventMes: {
    color: '#fff',
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
    marginLeft: 4,
  },
  eventLabelAscenso: {
    backgroundColor: '#38bdf8',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  eventLabelEscuela: {
    backgroundColor: '#fde047',
    color: '#92400e',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  anuncioCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
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
    marginLeft: 4,
  },
  noAnuncios: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 15,
  },
});