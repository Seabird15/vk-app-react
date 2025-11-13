import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'JugadorasAscenso'>;

type Player = {
  id: string;
  nombre: string;
  apellido: string;
  dorsal?: string;
  posicion?: string;
  fotoURL?: string;
};

const AVATAR_FALLBACK =
  'https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png';

export default function JugadorasAscensoScreen({ navigation }: Props) {
  const [jugadoras, setJugadoras] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJugadoras = useCallback(async () => {
    try {
      setError('');
      const snap = await getDocs(collection(db, 'jugadoras-ascenso'));
      const items: Player[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          nombre: data.nombre ?? '',
          apellido: data.apellido ?? '',
          dorsal: data.dorsal ?? '',
          posicion: data.posicion ?? '',
          fotoURL: data.fotoURL ?? '',
        };
      });
      setJugadoras(items);
    } catch (e) {
      console.error('Error fetching jugadoras:', e);
      setError('No se pudo cargar las jugadoras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJugadoras();
  }, [fetchJugadoras]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJugadoras();
    setRefreshing(false);
  }, [fetchJugadoras]);

  return (
    <View style={styles.screen}>
      {/* Botón volver */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={22} />
        <Text style={styles.backText}>Volver atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Jugadoras - Equipo Ascenso</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={jugadoras}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.fotoURL ? item.fotoURL : AVATAR_FALLBACK }}
                style={styles.avatar}
              />
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.name}>{item.apellido}</Text>
              <Text style={styles.meta}>Dorsal: {item.dorsal || '-'}</Text>
              <Text style={[styles.meta, { textAlign: 'center' }]}>
                Posición: {item.posicion || '-'}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Sin jugadoras.</Text>}
        />
      )}
    </View>
  );
}

const teal = '#07a495';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: teal,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: teal,
    textAlign: 'center',
    marginBottom: 16,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { textAlign: 'center', color: '#dc2626', marginTop: 12 },
  row: { justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: teal,
    resizeMode: 'cover',
  },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 2, fontSize: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
