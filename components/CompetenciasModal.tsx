import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function CompetenciasModal({ isVisible, onClose }: Props) {
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [detalle, setDetalle] = useState('');
  const [orden, setOrden] = useState('1');
  const [imagen, setImagen] = useState('');
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<any>(null);
  const [competencias, setCompetencias] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) {
      cargarCompetencias();
    }
  }, [isVisible]);

  const cargarCompetencias = async () => {
    const snap = await getDocs(collection(db, 'competencias'));
    setCompetencias(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true });
    if (!result.canceled && result.assets.length > 0) {
      const img = result.assets[0];
      setFile(img);
      setPreview(img.uri);
    }
  };

  const guardarCompetencia = async () => {
    if (!titulo || !estado) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    let urlImagen = '';
    try {
      if (file) {
        const blob = await fetch(file.uri).then(res => res.blob());
        const fileRef = storageRef(storage, `competencias/${Date.now()}_${file.fileName || 'comp'}.jpg`);
        await uploadBytes(fileRef, blob);
        urlImagen = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'competencias'), {
        titulo,
        estado,
        descripcion,
        detalle,
        imagen: urlImagen,
        orden: Number(orden),
        fecha: new Date(),
      });

      resetForm();
      cargarCompetencias();
      onClose();
    } catch (e: any) {
      setError('Error al guardar: ' + e.message);
    }
  };

  const eliminarCompetencia = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'competencias', id));
      setCompetencias(competencias.filter((c: any) => c.id !== id));
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  const resetForm = () => {
    setTitulo('');
    setEstado('');
    setDescripcion('');
    setDetalle('');
    setOrden('1');
    setImagen('');
    setFile(null);
    setPreview('');
    setError('');
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Competencias</Text>

        <TextInput placeholder="Título" style={styles.input} value={titulo} onChangeText={setTitulo} />
        <TextInput placeholder="Estado" style={styles.input} value={estado} onChangeText={setEstado} />
        <TouchableOpacity onPress={seleccionarImagen} style={styles.imageBtn}>
          <Text style={styles.imageBtnText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
        {preview ? <Image source={{ uri: preview }} style={styles.preview} /> : null}
        <TextInput placeholder="Descripción" style={styles.input} value={descripcion} onChangeText={setDescripcion} />
        <TextInput placeholder="Detalle" style={styles.input} value={detalle} onChangeText={setDetalle} />
        <TextInput placeholder="Orden" style={styles.input} keyboardType="numeric" value={orden} onChangeText={setOrden} />

        <TouchableOpacity onPress={guardarCompetencia} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.subHeader}>Competencias existentes</Text>
        {competencias.map((c: any) => (
          <View key={c.id} style={styles.item}>
            <Image source={{ uri: c.imagen }} style={styles.itemImage} />
            <Text style={styles.itemText}>{c.titulo}</Text>
            <TouchableOpacity onPress={() => eliminarCompetencia(c.id)}>
              <Text style={styles.delete}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#07a495', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: '600', marginTop: 20, color: '#07a495' },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  imageBtn: { backgroundColor: '#eee', padding: 10, borderRadius: 8, alignItems: 'center' },
  imageBtnText: { color: '#333' },
  preview: { width: 100, height: 100, marginVertical: 10, borderRadius: 8 },
  saveBtn: { backgroundColor: '#07a495', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 8 },
  itemImage: { width: 40, height: 40, borderRadius: 4, marginRight: 10 },
  itemText: { flex: 1 },
  delete: { fontSize: 18, color: 'red' },
  closeBtn: { marginTop: 20, alignItems: 'center' },
  closeBtnText: { color: '#4ea1ff', textDecorationLine: 'underline' },
});
