import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

type TeamKey = "jugadoras-ascenso" | "jugadoras-escuela" ;

type Player = {
  id?: string;
  nombre: string;
  apellido: string;
  dorsal?: string;
  posicion?: string;
  nacimiento?: Date | null;
};

const COLLECTIONS: TeamKey[] = [
  "jugadoras-ascenso",
  "jugadoras-escuela",
];

const TITLES: Record<TeamKey, string> = {
  "jugadoras-ascenso": "Ascenso",
  "jugadoras-escuela": "Escuela",
};

function toYMD(date?: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromYMD(s: string): Date | null {
  // Espera "YYYY-MM-DD"
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
}

export default function AdminJugadorasScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lists, setLists] = useState<Record<TeamKey, Player[]>>({
    "jugadoras-ascenso": [],
    "jugadoras-escuela": [],
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TeamKey | null>(null);
  const [editing, setEditing] = useState<Player>({
    id: undefined,
    nombre: "",
    apellido: "",
    dorsal: "",
    posicion: "",
    nacimiento: null,
  });

  // Suscripciones en tiempo real (una por colección)
  useEffect(() => {
    let pending = COLLECTIONS.length;
    const unsubs = COLLECTIONS.map((colName) => {
      const q = query(collection(db, colName));
      return onSnapshot(
        q,
        (snap) => {
          const players: Player[] = snap.docs.map((d) => {
            const data = d.data() as any;
            let nacimiento: Date | null = null;
            if (data.nacimiento instanceof Timestamp) {
              nacimiento = data.nacimiento.toDate();
            } else if (typeof data.nacimiento === "string") {
              nacimiento = fromYMD(data.nacimiento);
            } else if (data.nacimiento instanceof Date) {
              nacimiento = data.nacimiento;
            }
            return {
              id: d.id,
              nombre: data.nombre ?? "",
              apellido: data.apellido ?? "",
              dorsal: data.dorsal ?? "",
              posicion: data.posicion ?? "",
              nacimiento,
            };
          });

          setLists((prev) => ({ ...prev, [colName]: players }));
          pending -= 1;
          if (pending === 0) setLoading(false);
        },
        (e) => {
          console.error(e);
          setError("Error al cargar datos.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, []);

  const openCreate = (team: TeamKey) => {
    setCurrentTeam(team);
    setEditing({
      id: undefined,
      nombre: "",
      apellido: "",
      dorsal: "",
      posicion: "",
      nacimiento: null,
    });
    setModalOpen(true);
  };

  const openEdit = (team: TeamKey, p: Player) => {
    setCurrentTeam(team);
    setEditing({
      ...p,
      nacimiento: p.nacimiento ?? null,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    if (!currentTeam) return;
    const payload: any = {
      nombre: editing.nombre.trim(),
      apellido: editing.apellido.trim(),
      dorsal: (editing.dorsal ?? "").toString().trim(),
      posicion: (editing.posicion ?? "").toString().trim(),
      // Guardamos nacimiento como Timestamp si existe
      nacimiento: editing.nacimiento ? Timestamp.fromDate(editing.nacimiento) : null,
    };

    if (!payload.nombre || !payload.apellido) {
      Alert.alert("Validación", "Nombre y Apellido son obligatorios.");
      return;
    }

    try {
      if (editing.id) {
        await updateDoc(doc(db, currentTeam, editing.id), payload);
        Alert.alert("Actualizado", "Jugadora actualizada.");
      } else {
        await addDoc(collection(db, currentTeam), payload);
        Alert.alert("Agregado", "Jugadora agregada.");
      }
      closeModal();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const handleDelete = (team: TeamKey, id?: string) => {
    if (!id) return;
    Alert.alert("Eliminar", "¿Eliminar esta jugadora?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, team, id));
            Alert.alert("Eliminado", "Jugadora eliminada.");
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

  const sections = useMemo(() => COLLECTIONS, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Administrar Jugadoras</Text>

      {loading ? (
        <View style={styles.center}>
          <View style={styles.loader} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.grid}>
          {sections.map((team) => (
            <View key={team} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{TITLES[team]}</Text>
                <TouchableOpacity
                  onPress={() => openCreate(team)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>+ Agregar</Text>
                </TouchableOpacity>
              </View>

              {lists[team].length === 0 ? (
                <Text style={styles.empty}>Sin jugadoras.</Text>
              ) : (
                <FlatList
                  data={lists[team]}
                  keyExtractor={(item) => item.id!}
                  ItemSeparatorComponent={() => <View style={styles.sep} />}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.playerName}>
                          {item.nombre} {item.apellido}
                        </Text>
                        <Text style={styles.playerMeta}>
                          Dorsal: {item.dorsal || "-"}
                          {item.posicion ? ` | ${item.posicion}` : ""}
                          {item.nacimiento
                            ? ` | Nac.: ${toYMD(item.nacimiento)}`
                            : ""}
                        </Text>
                      </View>
                      <View style={styles.actions}>
                        <Pressable
                          onPress={() => openEdit(team, item)}
                          style={styles.iconBtn}
                        >
                          <Text style={styles.iconText}>✏️</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(team, item.id)}
                          style={styles.iconBtn}
                        >
                          <Text style={[styles.iconText, { color: "#dc2626" }]}>
                            🗑️
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modal Agregar/Editar */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing.id ? "Editar Jugadora" : "Agregar Jugadora"}
              {currentTeam ? ` - ${TITLES[currentTeam]}` : ""}
            </Text>

            <View style={styles.form}>
              <TextInput
                value={editing.nombre}
                onChangeText={(t) => setEditing((p) => ({ ...p, nombre: t }))}
                placeholder="Nombre"
                style={styles.input}
              />
              <TextInput
                value={editing.apellido}
                onChangeText={(t) => setEditing((p) => ({ ...p, apellido: t }))}
                placeholder="Apellido"
                style={styles.input}
              />
              <TextInput
                value={editing.dorsal ?? ""}
                onChangeText={(t) => setEditing((p) => ({ ...p, dorsal: t }))}
                placeholder="Dorsal"
                keyboardType="number-pad"
                style={styles.input}
              />
              <TextInput
                value={editing.posicion ?? ""}
                onChangeText={(t) => setEditing((p) => ({ ...p, posicion: t }))}
                placeholder="Posición"
                style={styles.input}
              />
              <TextInput
                value={toYMD(editing.nacimiento)}
                onChangeText={(t) =>
                  setEditing((p) => ({ ...p, nacimiento: fromYMD(t) }))
                }
                placeholder="Nacimiento (YYYY-MM-DD)"
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>
                    {editing.id ? "Actualizar" : "Agregar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const teal = "#07a495";
const tealDark = "#059687";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: teal,
    marginBottom: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: 48,
    height: 48,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "rgba(0,0,0,0.1)",
    borderLeftColor: teal,
  },
  error: {
    textAlign: "center",
    color: "#dc2626",
    marginVertical: 12,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: teal,
  },
  addBtn: {
    backgroundColor: teal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "white",
    fontWeight: "700",
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 24,
  },
  sep: {
    height: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  playerName: {
    fontWeight: "700",
    fontSize: 16,
  },
  playerMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  iconText: {
    fontSize: 18,
    color: "#2563eb",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: teal,
    marginBottom: 12,
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: teal,
  },
  saveText: {
    color: "white",
    fontWeight: "800",
  },
});
