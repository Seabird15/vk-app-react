import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet,
} from 'react-native';
import { collection, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AnunciosModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AnunciosModal({ isVisible, onClose }: AnunciosModalProps) {
  const [nuevo, setNuevo] = useState({ titulo: '', detalle: '' });
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [error, setError] = useState('');

  const cargarAnuncios = async () => {
    const snap = await getDocs(collection(db, 'anuncios'));
    setAnuncios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const guardarAnuncio = async () => {
    if (!nuevo.titulo) {
      setError('Completa el título del anuncio');
      return;
    }

    try {
      await addDoc(collection(db, 'anuncios'), {
        titulo: nuevo.titulo,
        detalle: nuevo.detalle || '',
        fecha: serverTimestamp(),
      });
      setNuevo({ titulo: '', detalle: '' });
      setError('');
      cargarAnuncios();
    } catch (e: any) {
      setError('Error al guardar el anuncio: ' + e.message);
    }
  };

  const eliminarAnuncio = async (id: string) => {
    Alert.alert('¿Eliminar anuncio?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'anuncios', id));
          setAnuncios((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  useEffect(() => {
    if (isVisible) cargarAnuncios();
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.root}>
        <Text style={styles.title}>Administrar Anuncios</Text>

        <Text style={styles.subtitle}>Publicar anuncio</Text>
        <TextInput
          placeholder="Título"
          style={styles.input}
          value={nuevo.titulo}
          onChangeText={(t) => setNuevo({ ...nuevo, titulo: t })}
        />
        <TextInput
          placeholder="Detalle"
          style={[styles.input, { height: 80 }]}
          multiline
          value={nuevo.detalle}
          onChangeText={(t) => setNuevo({ ...nuevo, detalle: t })}
        />
        <TouchableOpacity style={styles.btn} onPress={guardarAnuncio}>
          <Text style={styles.btnText}>Guardar Anuncio</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.subtitle}>Anuncios publicados</Text>
        <FlatList
          data={anuncios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📢 {item.titulo}</Text>
              {item.detalle ? <Text style={styles.cardText}>{item.detalle}</Text> : null}
              <TouchableOpacity onPress={() => eliminarAnuncio(item.id)}>
                <Text style={styles.delete}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#07a495', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 8 },
  btn: { backgroundColor: '#07a495', padding: 12, borderRadius: 8, marginTop: 12 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  error: { color: 'red', marginTop: 8 },
  card: { backgroundColor: '#fff', padding: 10, borderRadius: 8, elevation: 2 },
  cardTitle: { fontWeight: 'bold', color: '#333' },
  cardText: { color: '#555', marginTop: 4 },
  delete: { color: '#e11d48', marginTop: 6, fontWeight: 'bold' },
  closeBtn: { marginTop: 20, alignSelf: 'center' },
  closeText: { color: '#07a495', fontWeight: 'bold', fontSize: 16 },
});
