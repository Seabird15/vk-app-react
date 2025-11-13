import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'FechasImportantes'>;

type RawPlayer = {
  id: string;
  nombre?: string;
  apellido?: string;
  nacimiento?: any; // Timestamp | string | Date
};

type CumpleOrdenado = {
  id: string;
  nombre: string;
  proximo: Date;   // próxima ocurrencia en este o siguiente año
  etiquetaDM: string; // DD/MM
  dias: number;    // días que faltan
};

const teal = '#07a495';

// Si tienes todas las jugadoras en una sola colección, deja sólo 'jugadoras'.
// Si las separas por equipo, mantenemos ambas para mayor compatibilidad.
const SOURCES = [
  'jugadoras',              // si existe la consolidada
  'jugadoras-ascenso',
  'jugadoras-escuela',
  'jugadoras-fut',
];

const IMPORTANT_DATES: { id: string; titulo: string; fecha: string }[] = [
  { id: 'anniv-2025', titulo: 'Aniversario del club', fecha: '16/12/2025' },
];

export default function FechasImportantesScreen({}: Props) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [cumples, setCumples] = useState<CumpleOrdenado[]>([]);
  const [fechas, setFechas] = useState(IMPORTANT_DATES);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const jugadores: RawPlayer[] = [];
        for (const col of SOURCES) {
          // getDocs en una colección inexistente devuelve snapshot vacío, no revienta.
          const snap = await getDocs(collection(db, col));
          for (const d of snap.docs) {
            const data = d.data() as any;
            if (!data) continue;
            const nacimiento = data.nacimiento;
            if (!nacimiento) continue;

            jugadores.push({
              id: `${d.id}_${col}`,
              nombre: (data.nombre ?? '').toString().trim(),
              apellido: (data.apellido ?? '').toString().trim(),
              nacimiento,
            });
          }
        }

        const hoy = startOfDay(new Date());
        const items: CumpleOrdenado[] = [];

        for (const j of jugadores) {
          const birth = parseNacimiento(j.nacimiento);
          if (!birth) continue;

          const proximo = nextOccurrence(birth, hoy);
          const dias = daysBetween(hoy, proximo);
          const etiquetaDM = formatDM(proximo);

          const nombre = [j.nombre, j.apellido].filter(Boolean).join(' ').trim() || 'Sin nombre';
          items.push({ id: j.id, nombre, proximo, etiquetaDM, dias });
        }

        // Ordena del más próximo al más lejano
        items.sort((a, b) => a.dias - b.dias);
        setCumples(items);
      } catch (e) {
        console.error('Error cargando cumpleaños:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const contenido = useMemo(() => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximos Cumpleaños</Text>
        {cumples.length === 0 ? (
          <Text style={styles.empty}>Sin datos por ahora.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {cumples.map((c) => (
              <Text key={c.id} style={styles.itemLine}>
                <Text style={{ fontSize: 18 }}>🎂 </Text>
                <Text style={styles.bold}>{c.nombre}</Text>
                <Text> — {c.etiquetaDM}</Text>
                <Text style={styles.subtle}>{c.dias === 0 ? ' (hoy 🎉)' : `  (${c.dias} días)`}</Text>
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.cardTitle, { marginTop: 20 }]}>Fechas Importantes</Text>
        {fechas.length === 0 ? (
          <Text style={styles.empty}>Sin fechas importantes aún.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {fechas.map((f) => (
              <Text key={f.id} style={styles.itemLine}>
                <Text style={{ fontSize: 18 }}>📅 </Text>
                <Text style={styles.bold}>{f.titulo}</Text>
                <Text> — {f.fecha}</Text>
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }, [cumples, fechas]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Volver al inicio (Admin) */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          // Si tienes la ruta AdminMenu registrada:
          // @ts-ignore
          if ((navigation as any).navigate) {
            // intenta ir al Admin; si fallara, hace goBack
            try {
              // @ts-ignore
              navigation.navigate?.('AdminMenu');
            } catch {
              // @ts-ignore
              navigation.goBack?.();
            }
          }
        }}
      >
        <Text style={styles.backText}>{'< '}Volver al inicio</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cumpleaños y Fechas Importantes</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        contenido
      )}
    </ScrollView>
  );
}

/** ------------------ utilidades de fecha ------------------ **/

function parseNacimiento(value: any): Date | null {
  try {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'string') {
      // DD/MM/YYYY
      const m1 = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) {
        const d = Number(m1[1]);
        const m = Number(m1[2]);
        const y = Number(m1[3]);
        return new Date(y, m - 1, d);
      }
      // YYYY-MM-DD
      const m2 = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m2) {
        const y = Number(m2[1]);
        const mo = Number(m2[2]);
        const d = Number(m2[3]);
        return new Date(y, mo - 1, d);
      }
      // Intento de parseo genérico
      const t = new Date(value);
      return isNaN(t.getTime()) ? null : t;
    }
    return null;
  } catch {
    return null;
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function nextOccurrence(birth: Date, from: Date): Date {
  const y = from.getFullYear();
  const occ = new Date(y, birth.getMonth(), birth.getDate());
  if (occ < from) {
    return new Date(y + 1, birth.getMonth(), birth.getDate());
  }
  return occ;
}

function daysBetween(a: Date, b: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  const a0 = startOfDay(a).getTime();
  const b0 = startOfDay(b).getTime();
  return Math.round((b0 - a0) / MS);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function formatDM(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/** ------------------ estilos ------------------ **/

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: teal,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  backText: { color: '#fff', fontWeight: '800' },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: teal,
    textAlign: 'center',
    marginBottom: 12,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    color: teal,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  itemLine: {
    fontSize: 16,
    color: '#111827',
  },
  bold: { fontWeight: 'bold', color: '#111827' },
  subtle: { color: '#6b7280' },
  empty: { color: '#6b7280' },
});
