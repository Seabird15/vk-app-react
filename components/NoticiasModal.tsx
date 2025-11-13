import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../services/firebase'

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

interface Noticia {
  id?: string;
  titulo: string;
  contenido: string;
  imagen: string;
}

export default function NoticiasModal({ isVisible, onClose }: Props) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ titulo: '', contenido: '' });
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  /** ───────────  helpers  ─────────── */
  const resetForm = () => {
    setForm({ titulo: '', contenido: '' });
    setImgFile(null);
    setImgUri(null);
    setError('');
  };

  const loadNoticias = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'noticias'));
    setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia)));
    setLoading(false);
  };

  /** ───────────  efectos  ─────────── */
  useEffect(() => {
    if (isVisible) loadNoticias();
  }, [isVisible]);

  /** ───────────  acciones  ─────────── */

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length) {
      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();
      setImgUri(uri);
      setImgFile(blob);
    }
  };

  const guardarNoticia = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('Completa título y contenido');
      return;
    }

    setLoading(true);
    try {
      let urlImagen = '';
      if (imgFile) {
        const ref = storageRef(
          storage,
          `noticias/${Date.now()}_img.${imgFile.type?.split('/')[1] || 'jpg'}`
        );
        await uploadBytes(ref, imgFile);
        urlImagen = await getDownloadURL(ref);
      }

      await addDoc(collection(db, 'noticias'), {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        imagen: urlImagen,
        fecha: serverTimestamp(),
      });

      await loadNoticias();
      resetForm();
      Alert.alert('Éxito', 'Noticia guardada');
    } catch (e: any) {
      setError('Error al guardar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarNoticia = async (id: string) => {
    Alert.alert('Eliminar', '¿Deseas eliminar esta noticia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'noticias', id));
          setNoticias(prev => prev.filter(n => n.id !== id));
        },
      },
    ]);
  };

  /** ───────────  UI  ─────────── */

  return (
    <Modal visible={isVisible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Administrar Noticias</Text>

        {/* Formulario */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={form.titulo}
            onChangeText={t => setForm({ ...form, titulo: t })}
          />
          <TouchableOpacity style={styles.fileBtn} onPress={pickImage}>
            <Text style={styles.fileText}>
              {imgUri ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </TouchableOpacity>
          {imgUri && (
            <Image source={{ uri: imgUri }} style={styles.preview} />
          )}
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Contenido"
            multiline
            value={form.contenido}
            onChangeText={c => setForm({ ...form, contenido: c })}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.saveBtn} onPress={guardarNoticia}>
            <Text style={styles.saveText}>Guardar Noticia</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <Text style={styles.subHeader}>Gráficas cargadas</Text>
        {loading ? (
          <ActivityIndicator color="#07a495" size="large" />
        ) : noticias.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No hay noticias.
          </Text>
        ) : (
          noticias.map(n => (
            <View key={n.id} style={styles.item}>
              <Image source={{ uri: n.imagen }} style={styles.itemImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{n.titulo}</Text>
                <Text numberOfLines={2}>{n.contenido}</Text>
              </View>
              <TouchableOpacity onPress={() => eliminarNoticia(n.id!)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Cerrar */}
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#07a495', marginBottom: 16 },
  subHeader: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  fileBtn: { backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  fileText: { color: '#333' },
  preview: { width: 80, height: 80, alignSelf: 'center', borderRadius: 10, marginBottom: 8 },
  saveBtn: { backgroundColor: '#07a495', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 4, textAlign: 'center' },
  item: { backgroundColor: '#fff', flexDirection: 'row', padding: 8, borderRadius: 10, marginBottom: 8, alignItems: 'center', gap: 8 },
  itemImg: { width: 50, height: 50, borderRadius: 6 },
  itemTitle: { fontWeight: '700' },
  delete: { fontSize: 18, color: 'red' },
  close: { marginTop: 16, alignItems: 'center' },
  closeText: { color: '#07a495', textDecorationLine: 'underline' },
});
