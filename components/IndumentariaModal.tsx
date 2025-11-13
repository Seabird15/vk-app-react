import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';

interface IndumentariaModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function IndumentariaModal({ isVisible, onClose }: IndumentariaModalProps) {
  const [indumentaria, setIndumentaria] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ title: '', price: '', description: '', orden: '1' });
  const [image, setImage] = useState<any>(null);
  const [previewUri, setPreviewUri] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) cargarIndumentaria();
  }, [isVisible]);

  const cargarIndumentaria = async () => {
    const snap = await getDocs(collection(db, 'indumentaria'));
    setIndumentaria(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const file = result.assets[0];
      setImage(file);
      setPreviewUri(file.uri);
    }
  };

  const guardarIndumentaria = async () => {
    if (!nuevo.title || !nuevo.price) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    let urlImagen = '';
    try {
      if (image) {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const ref = storageRef(storage, `indumentaria/${Date.now()}_${image.uri.split('/').pop()}`);
        await uploadBytes(ref, blob);
        urlImagen = await getDownloadURL(ref);
      }
      await addDoc(collection(db, 'indumentaria'), {
        ...nuevo,
        image: urlImagen,
        orden: Number(nuevo.orden),
        fecha: serverTimestamp(),
      });
      setNuevo({ title: '', price: '', description: '', orden: '1' });
      setImage(null);
      setPreviewUri('');
      setError('');
      cargarIndumentaria();
    } catch (e: any) {
      setError('Error al guardar la indumentaria: ' + e.message);
    }
  };

  const eliminar = async (id: string) => {
    await deleteDoc(doc(db, 'indumentaria', id));
    setIndumentaria(prev => prev.filter(i => i.id !== id));
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContent}>
        <Text style={styles.title}>Indumentaria</Text>

        <TextInput placeholder="Título" value={nuevo.title} onChangeText={text => setNuevo({ ...nuevo, title: text })} style={styles.input} />
        <TextInput placeholder="Precio" value={nuevo.price} onChangeText={text => setNuevo({ ...nuevo, price: text })} style={styles.input} />
        <TextInput placeholder="Descripción" value={nuevo.description} onChangeText={text => setNuevo({ ...nuevo, description: text })} style={styles.input} multiline />
        <TextInput placeholder="Orden" value={nuevo.orden} onChangeText={text => setNuevo({ ...nuevo, orden: text })} keyboardType="numeric" style={styles.input} />

        <Button title="Seleccionar Imagen" onPress={pickImage} color="#07a495" />
        {previewUri ? <Image source={{ uri: previewUri }} style={styles.preview} /> : null}

        <Button title="Guardar" onPress={guardarIndumentaria} color="#07a495" />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.subTitle}>Indumentaria existente</Text>
        <FlatList
          data={indumentaria}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <Text style={styles.itemText}>{item.title}</Text>
              <TouchableOpacity onPress={() => eliminar(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Button title="Cerrar" onPress={onClose} color="#555" />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#07a495', marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#07a495' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  preview: { width: 100, height: 100, borderRadius: 10, alignSelf: 'center', marginVertical: 10 },
  error: { color: 'red', marginTop: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#eee', padding: 10, borderRadius: 10 },
  itemImg: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  itemText: { flex: 1 },
  deleteBtn: { color: 'red', fontSize: 18 },
});
