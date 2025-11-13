import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
    StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [posicion, setPosicion] = useState('');
  const [equipos, setEquipos] = useState<string[]>([]);
  const [foto, setFoto] = useState<null | { uri: string; file: Blob }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const toggleEquipo = (equipo: string) => {
    if (equipos.includes(equipo)) {
      setEquipos(equipos.filter(e => e !== equipo));
    } else {
      setEquipos([...equipos, equipo]);
    }
  };

  const validarEdad = () => {
    if (!birthday) return false;
    const fecha = new Date(birthday);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const edadReal = mes > 0 || (mes === 0 && hoy.getDate() >= fecha.getDate()) ? edad : edad - 1;
    return edadReal >= 5;
  };

  const abrirGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();
      setFoto({ uri, file: blob });
    }
  };

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password || !birthday || !dorsal || !posicion || equipos.length === 0) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!validarEdad()) {
      Alert.alert('Error', 'Debes tener al menos 5 años');
      return;
    }

    try {
      setIsLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      let fotoURL = '';
      if (foto?.file) {
        const storageReference = storageRef(storage, `perfiles/${cred.user.uid}`);
        await uploadBytes(storageReference, foto.file);
        fotoURL = await getDownloadURL(storageReference);
      }

      const userData = {
        nombre,
        apellido,
        email,
        birthday,
        posicion,
        dorsal: Number(dorsal),
        equipos,
        fotoURL,
      };

      await setDoc(doc(db, 'jugadoras', cred.user.uid), userData);

      const teamsMap: Record<string, string> = {
        ascenso: 'jugadoras-ascenso',
        fut11: 'jugadoras-fut',
        escuela: 'jugadoras-escuela',
      };

      equipos.forEach(team => {
        const col = teamsMap[team];
        if (col) setDoc(doc(db, col, cred.user.uid), userData);
      });

      Alert.alert('¡Registro exitoso!', 'Ya puedes iniciar sesión');
      navigation.navigate('Login' as never);
    } catch (e: any) {
      let msg = 'Error al registrar. Intenta de nuevo.';
      if (e.code === 'auth/email-already-in-use') msg = 'Correo ya registrado';
      if (e.code === 'auth/weak-password') msg = 'Contraseña muy débil';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

return (
  <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.subtitle}>Club Deportivo Vikingas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!mostrarClave}
        />
        <TouchableOpacity
          onPress={() => setMostrarClave(!mostrarClave)}
          style={styles.eyeButton}
        >
          <Text>{mostrarClave ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={birthday}
        onChangeText={setBirthday}
      />
      <TextInput
        style={styles.input}
        placeholder="Dorsal camiseta"
        value={dorsal}
        onChangeText={setDorsal}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Posición"
        value={posicion}
        onChangeText={setPosicion}
      />

      <Text style={styles.label}>Selecciona tus equipos:</Text>
      {['ascenso', 'fut11', 'escuela'].map(equipo => (
        <TouchableOpacity
          key={equipo}
          style={styles.checkboxContainer}
          onPress={() => toggleEquipo(equipo)}
        >
          <View
            style={[
              styles.checkbox,
              equipos.includes(equipo) && styles.checkboxSelected,
            ]}
          />
          <Text>{`Equipo ${equipo.charAt(0).toUpperCase() + equipo.slice(1)}`}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={abrirGaleria} style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Seleccionar Foto de Perfil</Text>
      </TouchableOpacity>

      {foto?.uri && (
        <Image
          source={{ uri: foto.uri }}
          style={styles.previewImage}
        />
      )}

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleRegister}
        style={[styles.registerButton, isLoading && styles.disabledButton]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 100,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    minWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#07a495',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#07a495',
  },
  selectButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 12,
    marginBottom: 12,
  },
  selectButtonText: {
    textAlign: 'center',
    color: '#444',
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#07a495',
  },
  registerButton: {
    backgroundColor: '#07a495',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loginLink: {
    color: '#4ea1ff',
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});
