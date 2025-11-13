import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CLAVE_ADMIN = 'yesiprofe';

export default function AdminLoginScreen() {
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AsyncStorage.getItem('adminAutenticado');
      if (isAuth === 'true') {
        navigation.replace('AdminMenu');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const verificarClave = async () => {
    if (clave === CLAVE_ADMIN) {
      await AsyncStorage.setItem('adminAutenticado', 'true');
      navigation.navigate('AdminMenu');
    } else {
      Alert.alert('Clave incorrecta', 'Por favor intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#07a495" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Admin</Text>
      <TextInput
        value={clave}
        onChangeText={setClave}
        placeholder="Ingresa la clave"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={verificarClave}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, width: '100%', borderRadius: 10 },
  button: {
    marginTop: 20,
    backgroundColor: '#07a495',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
