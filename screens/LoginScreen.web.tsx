import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { auth } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList
} from '../types/navigation'

import AsyncStorage from '@react-native-async-storage/async-storage';


type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '537242760349-9ot1bnu9kpk0cnjaqdd26anhoshh1tom.apps.googleusercontent.com',
    androidClientId: '537242760349-2t9ad0ct28dgl8cm45d4peo41dn098mp.apps.googleusercontent.com',
  });
 const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (userEmail) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
          await AsyncStorage.setItem('userEmail', email.trim());
      Alert.alert('Bienvenida', 'Inicio exitoso.');
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
    } catch (e: any) {
    switch (e.code) {
    case 'auth/user-not-found':
      setErrorMsg('Usuario no encontrado.');
      break;
    case 'auth/wrong-password':
      setErrorMsg('Contraseña incorrecta.');
      break;
    case 'auth/invalid-email':
      setErrorMsg('Formato de email inválido.');
      break;
    default:
      setErrorMsg('Usuario o contraseña incorrectos, o error de conexión.');
  }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://web-vikingas.firebaseapp.com/reset-password',
        handleCodeInApp: true,
      });
      Alert.alert('Correo enviado', 'Revisa tu correo para restablecer tu contraseña.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const loginWithGoogle = async () => {
    promptAsync();
  };

  return (
 <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>
        {showReset ? 'Recuperar contraseña' : 'Iniciar sesión'}
      </Text>
      <Text style={styles.subtitle}>Club Deportivo Vikingas</Text>

    
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
      />
       {!showReset && (
        <>
    <View style={styles.passwordContainer}>
  <TextInput
    style={[styles.input, { width: '100%', marginBottom: 0 }]} // Aplicar cambios aquí
    placeholder="Contraseña"
    placeholderTextColor="#999"
    onChangeText={setPassword}
    value={password}
    secureTextEntry={!mostrarClave}
  />
  <TouchableOpacity onPress={() => setMostrarClave(!mostrarClave)} style={styles.eyeButton}>
    <Text style={{fontSize: 18}}>{mostrarClave ? '🙈' : '👁️'}</Text>
  </TouchableOpacity>
</View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {showReset && (
        <>
          <Text style={{ color: '#fff', marginVertical: 10, textAlign: 'center' }}>
            Ingresa el email registrado para recuperar tu contraseña.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar correo de recuperación</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReset(false)}>
            <Text style={styles.link}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </>
      )}
    {!showReset && (
        <>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.link}>¿No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowReset(true)}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </>
      )}
      {/* <TouchableOpacity
        style={styles.googleButton}
        onPress={loginWithGoogle}
      >
        <Text style={styles.googleText}>Iniciar sesión con</Text>
        <Image source={require('../assets/google.png')} style={styles.googleLogo} />
      </TouchableOpacity> */}

 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
  title: {
        fontFamily: 'Gobold',
    color: '#fff',
    fontSize: 24,

  },
  subtitle: {
    color: '#07a495',
    marginBottom: 20,
       fontFamily: 'Gobold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '20%',
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingRight: 40,
  },
  passwordContainer: {
    width: '20%',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 12, 
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#07a495',
    padding: 14,
    borderRadius: 10,
    width: '20%',
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
   fontFamily: 'Gobold',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  googleButton: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleText: {
    marginRight: 10,
    color: '#444',
  },
  googleLogo: {
    width: 24,
    height: 24,
  },
  link: {
    color: '#4ea1ff',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});
