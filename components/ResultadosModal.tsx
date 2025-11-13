import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase'

interface Resultado {
  id?: string;
  tab: string;
  status: string;
  team1: { name: string; score: number };
  team2: { name: string; score: number };
  goles: { player: string }[];
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function ResultadosModal({ isVisible, onClose }: Props) {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: '',
    tab: '',
    status: '',
    team1Name: '',
    team1Score: '',
    team2Name: '',
    team2Score: '',
    golesTexto: '',
  });

  const resetForm = () => {
    setForm({
      id: '',
      tab: '',
      status: '',
      team1Name: '',
      team1Score: '',
      team2Name: '',
      team2Score: '',
      golesTexto: '',
    });
  };

  const loadResults = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'resultados'));
    setResultados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resultado)));
    setLoading(false);
  };

  useEffect(() => {
    if (isVisible) loadResults();
  }, [isVisible]);

  const handleSave = async () => {
    const data = {
      tab: form.tab,
      status: form.status,
      team1: { name: form.team1Name, score: Number(form.team1Score) },
      team2: { name: form.team2Name, score: Number(form.team2Score) },
      goles: form.golesTexto
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(player => ({ player })),
      fecha: serverTimestamp(),
    };

    if (form.id) {
      await updateDoc(doc(db, 'resultados', form.id), data);
    } else {
      await addDoc(collection(db, 'resultados'), data);
    }

    await loadResults();
    resetForm();
  };

  const handleEdit = (res: Resultado) => {
    setForm({
      id: res.id || '',
      tab: res.tab,
      status: res.status,
      team1Name: res.team1.name,
      team1Score: res.team1.score.toString(),
      team2Name: res.team2.name,
      team2Score: res.team2.score.toString(),
      golesTexto: res.goles.map(g => g.player).join(', '),
    });
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar', '¿Deseas eliminar este resultado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'resultados', id));
          await loadResults();
        },
      },
    ]);
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Administrar Resultados</Text>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.subHeader}>{form.id ? 'Editar Resultado' : 'Nuevo Resultado'}</Text>
          <TextInput style={styles.input} placeholder="Estado" value={form.status} onChangeText={text => setForm({ ...form, status: text })} />
          <TextInput style={styles.input} placeholder="Tab" value={form.tab} onChangeText={text => setForm({ ...form, tab: text })} />
          <TextInput style={styles.input} placeholder="Equipo 1" value={form.team1Name} onChangeText={text => setForm({ ...form, team1Name: text })} />
          <TextInput style={styles.input} placeholder="Goles Equipo 1" keyboardType="numeric" value={form.team1Score} onChangeText={text => setForm({ ...form, team1Score: text })} />
          <TextInput style={styles.input} placeholder="Equipo 2" value={form.team2Name} onChangeText={text => setForm({ ...form, team2Name: text })} />
          <TextInput style={styles.input} placeholder="Goles Equipo 2" keyboardType="numeric" value={form.team2Score} onChangeText={text => setForm({ ...form, team2Score: text })} />
          <TextInput style={styles.input} placeholder="Goleadoras (coma separadas)" value={form.golesTexto} onChangeText={text => setForm({ ...form, golesTexto: text })} multiline />
          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text style={styles.btnText}>{form.id ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator color="#07a495" size="large" />
        ) : (
          resultados.map((res) => (
            <View key={res.id} style={styles.resultItem}>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>{res.team1.name}</Text> {res.team1.score} - {res.team2.score} <Text style={styles.bold}>{res.team2.name}</Text>
              </Text>
              <Text style={styles.statusText}>{res.status}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(res)}>
                  <Text style={styles.edit}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(res.id!)}>
                  <Text style={styles.delete}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#07a495', marginBottom: 16 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: 'white', padding: 10, marginBottom: 8, borderRadius: 8 },
  btn: { backgroundColor: '#07a495', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  resultItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultText: { fontSize: 16 },
  statusText: { fontSize: 12, color: '#555' },
  bold: { fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8 },
  edit: { fontSize: 18, color: '#4ea1ff', marginRight: 8 },
  delete: { fontSize: 18, color: 'red' },
  closeBtn: { marginTop: 16, alignItems: 'center' },
  closeText: { color: '#07a495', textDecorationLine: 'underline' },
});
