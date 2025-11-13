import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import NuevoEntrenamientoModal from '../components/NuevoEntrenamientoModal';
import EntrenamientoCard from '../components/EntrenamientoCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type AsistenciaEstado =
  | 'anotada'
  | { estado: 'baja'; motivo?: string };

type Entrenamiento = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: any;
  horaInicio: any;
  horaTermino: any;
  lugar?: string;
  equipo: string;
  asistencia?: Record<string, AsistenciaEstado>;
};

type Jugadora = {
  uid: string;
  nombre: string;
  apellido: string;
  fotoURL: string;
  equipos: string[];
};

export default function EntrenamientosEscuelaScreen() {
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [jugadoras, setJugadoras] = useState<Jugadora[]>([]);
  const [user, setUser] = useState(getAuth().currentUser);
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [entrenamientoAEditar, setEntrenamientoAEditar] = useState<Entrenamiento | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });

    const checkAdmin = async () => {
      const admin = await AsyncStorage.getItem('adminAutenticado');
      setAdminAutenticado(admin === 'true');
    };
    checkAdmin();

    const q = query(
      collection(db, 'entrenamientos'),
      where('equipo', '==', 'jugadoras-escuela'),
      orderBy('fecha', 'desc')
    );

    const unsubscribeEntrenamientos = onSnapshot(q, (snapshot) => {
      const lista: Entrenamiento[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Entrenamiento));
      setEntrenamientos(lista);
    });

    const fetchJugadoras = async () => {
      const jugadorasQuery = query(
        collection(db, 'jugadoras'),
        where('equipos', 'array-contains', 'jugadoras-escuela')
      );
      const jugadorasSnap = await getDocs(jugadorasQuery);
      const jugadorasList = jugadorasSnap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as Jugadora[];
      setJugadoras(jugadorasList);
    };
    fetchJugadoras();

    return () => {
      unsubscribeAuth();
      unsubscribeEntrenamientos();
    };
  }, []);

  const handleAbrirModalNuevo = () => {
    setEntrenamientoAEditar(null);
    setModalVisible(true);
  };

  // --- FUNCIÓN CLAVE CORREGIDA ---
  const handleAbrirModalEditar = (entrenamiento: Entrenamiento) => {
    // Convierte los Timestamps de Firebase a objetos Date de JS
    const entrenamientoParaEditar = {
      ...entrenamiento,
      fecha: entrenamiento.fecha.toDate(),
      horaInicio: entrenamiento.horaInicio.toDate(),
      horaTermino: entrenamiento.horaTermino.toDate(),
    };
    setEntrenamientoAEditar(entrenamientoParaEditar);
    setModalVisible(true);
  };

  const handleDeleteEntrenamiento = (entrenamientoId: string) => {
    Alert.alert(
      "Confirmar Borrado",
      "¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sí, Borrar", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "entrenamientos", entrenamientoId));
              // Opcional: mostrar una alerta de éxito
              Alert.alert("Éxito", "El entrenamiento ha sido eliminado.");
            } catch (error) {
              console.error("Error al eliminar el entrenamiento: ", error);
              Alert.alert("Error", "No se pudo eliminar el entrenamiento.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entrenamientos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntrenamientoCard
            item={item}
            user={user!}
            jugadoras={jugadoras}
            setEntrenamientos={setEntrenamientos}
            adminAutenticado={adminAutenticado}
            onEditar={() => handleAbrirModalEditar(item)}
            onDelete={() => handleDeleteEntrenamiento(item.id)} 
          />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Entrenamientos Escuela</Text>
            {adminAutenticado && (
              <TouchableOpacity style={styles.botonNuevo} onPress={handleAbrirModalNuevo}>
                <MaterialIcons name="add" size={24} color="white" />
                <Text style={styles.botonNuevoTexto}>Nuevo Entrenamiento</Text>
              </TouchableOpacity>
            )}
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No hay entrenamientos programados.</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <NuevoEntrenamientoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEntrenamientoAEditar(null);
        }}
        equipo="jugadoras-escuela"
        entrenamientoAEditar={entrenamientoAEditar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Gobold',
    color: '#facc15',
    textAlign: 'center',
    marginVertical: 16,
  },
  botonNuevo: {
    flexDirection: 'row',
    backgroundColor: '#facc15',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 10,
    elevation: 3,
  },
  botonNuevoTexto: {
    color: '#422006', 
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6b7280',
    fontSize: 16,
    fontStyle: 'italic',
  },
});