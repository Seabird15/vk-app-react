import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../services/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  collection
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { signOut } from 'firebase/auth';
import CheckBox from 'expo-checkbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

import AsyncStorage from '@react-native-async-storage/async-storage';


export default function PerfilJugadorScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'PerfilJugador'>) {
  const user = auth.currentUser;
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [posicion, setPosicion] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [fotoURL, setFotoURL] = useState('');
const [equipos, setEquipos] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [stats, setStats] = useState({ asistencias: 0, total: 0, porcentaje: 0 });

  const defaultAvatar = 'https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png';

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [equipos]);

  const cargarPerfil = async () => {
    const docSnap = await getDoc(doc(db, 'jugadoras', user!.uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setNombre(data.nombre || '');
      setApellido(data.apellido || '');
      setNacimiento(data.nacimiento || '');
      setDorsal(data.dorsal || '');
      setPosicion(data.posicion || '');
      setFotoURL(data.fotoURL || '');
      setEquipos(data.equipos || []);
    }
  };

 const cargarEstadisticas = async () => {
  let total = 0;
  let asistencias = 0;
  const entrenamientosSnap = await getDocs(collection(db, 'entrenamientos'));
  const entrenamientos = entrenamientosSnap.docs.filter(docSnap => {
    const data = docSnap.data();
    return equipos.includes(data.equipo?.replace('jugadoras-', ''));
  });
  total = entrenamientos.length;

  for (const entrenamiento of entrenamientos) {
    const data = entrenamiento.data();
    const asistencia = data.asistencia?.[user!.uid];
    if (asistencia === 'anotada') {
      asistencias++;
    }
    // Si quieres contar bajas, puedes agregar aquí
    // if (typeof asistencia === 'object' && asistencia.estado === 'baja') { bajas++; }
  }

  const porcentaje = total > 0 ? Math.round((asistencias / total) * 100) : 0;
  setStats({ asistencias, total, porcentaje });
};
type Equipo = 'ascenso' | 'escuela';

const toggleEquipo = (equipo: Equipo) => {
  if (equipos.includes(equipo)) {
    setEquipos(equipos.filter(e => e !== equipo));
  } else {
    setEquipos([...equipos, equipo]);
  }
};

  const seleccionarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = await fetch(result.assets[0].uri).then(r => r.blob());
      const fileRef = storageRef(storage, `perfiles/${user!.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setFotoURL(url);
    }
  };

  const guardarPerfil = async () => {
    const userData = {
      nombre,
      apellido,
      nacimiento,
      dorsal,
      posicion,
      fotoURL,
      equipos,
      email,
    };

    await updateDoc(doc(db, 'jugadoras', user!.uid), userData);

    if (equipos.includes('ascenso')) {
 await setDoc(doc(db, 'jugadoras-ascenso', user!.uid), userData);
    }
   
    if (equipos.includes('escuela')) {
      await setDoc(doc(db, 'jugadoras-escuela', user!.uid), userData);
    }

    Alert.alert('Éxito', 'Tu perfil se ha actualizado correctamente.');
    cargarEstadisticas();
  };

  const cerrarSesion = async () => {
    Alert.alert('Cerrar sesión', '¿Estás segura de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
                  await AsyncStorage.removeItem('userEmail'); 
          navigation.replace('Login');
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: fotoURL || defaultAvatar }} style={styles.avatar} />
      <TouchableOpacity onPress={seleccionarFoto}>
        <Text style={styles.link}>Cambiar foto de perfil</Text>
      </TouchableOpacity>

      <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={styles.input} />
      <TextInput value={apellido} onChangeText={setApellido} placeholder="Apellido" style={styles.input} />
      <TextInput value={nacimiento} onChangeText={setNacimiento} placeholder="Fecha Nacimiento" style={styles.input} />
      <TextInput value={email} editable={false} style={[styles.input, styles.disabled]} />
      <TextInput value={dorsal} onChangeText={setDorsal} placeholder="Dorsal" keyboardType="numeric" style={styles.input} />
      <TextInput value={posicion} onChangeText={setPosicion} placeholder="Posición" style={styles.input} />

      <Text style={styles.label}>Equipos:</Text>
      <View style={styles.checkboxGroup}>
        {['ascenso',  'escuela'].map(eq => (
          <View key={eq} style={styles.checkboxItem}>
            <CheckBox value={equipos.includes(eq)} onValueChange={() => toggleEquipo(eq)} color="#07a495" />
            <Text style={styles.checkboxLabel}>Equipo {eq.charAt(0).toUpperCase() + eq.slice(1)}</Text>
          </View>
        ))}
      </View>

      <Button title="Guardar" color="#07a495" onPress={guardarPerfil} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Cerrar sesión" color="red" onPress={cerrarSesion} />

      {stats.total > 0 && (
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Tus estadísticas de asistencia</Text>
          <Text>Asistencias: {stats.asistencias} de {stats.total}</Text>
          <Text>Porcentaje: {stats.porcentaje}%</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#07a495'
  },
  link: {
    color: '#07a495',
    marginBottom: 10,
    textDecorationLine: 'underline'
  },
  input: {
    width: '20%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'center'
  },
  disabled: {
    backgroundColor: '#eee'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
      alignItems: 'center'
  },
  checkboxGroup: {
    width: '100%',
    marginBottom: 20,
        alignItems: 'center'
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  checkboxLabel: {
    marginLeft: 8
  },
  statsBox: {
    marginTop: 20,
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#07a495'
  }
});
