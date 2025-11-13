import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { updateDoc, doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialIcons } from '@expo/vector-icons';

type AsistenciaEstado =
  | 'anotada'
  | { estado: 'baja'; motivo?: string };

type Entrenamiento = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: any;
  horaInicio: any;
  horaTermino: any;
  lugar?: string;
  equipo: string;
  asistencia?: Record<string, AsistenciaEstado>;
};

type Jugadora = {
  uid: string;
  nombre: string;
  apellido: string;
  fotoURL: string;
  equipos: string[];
};

type User = {
  uid: string;
  email?: string;
};

type EntrenamientoCardProps = {
  item: Entrenamiento;
  user: User;
  adminAutenticado: boolean;
  onEditar: () => void;
  onDelete: () => void;
};

export default function EntrenamientoCard({
  item,
  user,
  adminAutenticado,
  onEditar,
  onDelete
}: EntrenamientoCardProps) {
  // --- INICIO: LÓGICA DE FECHA CORREGIDA ---
  const fechaEvento = item.fecha?.toDate();
  const horaInicio = item.horaInicio?.toDate();
  const horaTermino = item.horaTermino?.toDate();

  let fechaExpiracion = new Date(0); 
  if (fechaEvento && horaTermino) {
    // Crea una nueva fecha basada en la fecha del evento
    fechaExpiracion = new Date(fechaEvento.getTime());
    // Establece la hora usando la hora de término
    fechaExpiracion.setHours(horaTermino.getHours());
    fechaExpiracion.setMinutes(horaTermino.getMinutes());
    fechaExpiracion.setSeconds(horaTermino.getSeconds());
  }

  const ahora = new Date();
  const estaVencido = ahora > fechaExpiracion;
  // --- FIN: LÓGICA DE FECHA CORREGIDA ---

  const [mostrarMotivo, setMostrarMotivo] = useState(false);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [jugadoras, setJugadoras] = useState<Jugadora[]>([]);
  const [motivoVisible, setMotivoVisible] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('');

  const [showAnotadas, setShowAnotadas] = useState(false);
  const [showSinRespuesta, setShowSinRespuesta] = useState(false);
  const [showBajas, setShowBajas] = useState(false);

  const mostrarMotivoModal = (motivo: string) => {
    setMotivoSeleccionado(motivo);
    setMotivoVisible(true);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jugadoras'), (snapshot) => {
      const lista: Jugadora[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            nombre: data.nombre ?? '',
            apellido: data.apellido ?? '',
            fotoURL: data.fotoURL ?? '',
            equipos: data.equipos ?? [],
          };
        })
        .filter((jugadora) => jugadora.equipos.includes('ascenso'));
      setJugadoras(lista);
    });
    return () => unsub();
  }, []);

  const asistenciaUsuario = item.asistencia?.[user?.uid ?? ''];
  const estadoActual =
    typeof asistenciaUsuario === 'string'
      ? asistenciaUsuario
      : asistenciaUsuario?.estado ?? 'sin-respuesta';

  const formatearFecha = (fecha: Date) =>
    fecha.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

  const formatearHora = (hora: Date) =>
    hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleClickAsistencia = () => {
    if (estadoActual === 'anotada') {
      setMostrarMotivo(true);
    } else {
      actualizarAsistencia('anotada');
    }
  };

  const actualizarAsistencia = async (nuevoEstado: 'anotada' | 'baja') => {
    if (!user) return;
    const ref = doc(db, 'entrenamientos', item.id);
    const nuevoValor =
      nuevoEstado === 'anotada'
        ? 'anotada'
        : { estado: 'baja', motivo: motivoBaja };
    try {
      await updateDoc(ref, {
        [`asistencia.${user.uid}`]: nuevoValor,
      });
      setMostrarMotivo(false);
      setMotivoBaja('');
    } catch (err) {
      console.error('Error al actualizar asistencia:', err);
    }
  };

  const asistencia = item.asistencia || {};
  const anotadas = jugadoras.filter((j) => asistencia[j.uid] === 'anotada');
  const bajas = jugadoras.filter((j) => (asistencia[j.uid] as any)?.estado === 'baja');
  const sinRespuesta = jugadoras.filter((j) => !asistencia[j.uid]);

  return (
    <>
      <View style={[styles.card, estaVencido && styles.cardVencido]}>
        {estaVencido && <Text style={styles.vencidoLabel}>VENCIDO</Text>}
        
        <View style={styles.fechaBox}>
          <Text style={styles.semana}>{fechaEvento ? formatearFecha(fechaEvento).split(' ')[0] : ''}</Text>
          <Text style={styles.dia}>{fechaEvento ? fechaEvento.getDate() : ''}</Text>
          <Text style={styles.mes}>{fechaEvento ? formatearFecha(fechaEvento).split(' ')[2] : ''}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={16} color="#07a495" />
            <Text style={styles.infoText}>
              {horaInicio && horaTermino ? `${formatearHora(horaInicio)} a ${formatearHora(horaTermino)}` : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={16} color="#facc15" />
            <Text style={styles.infoText}>{item.lugar ?? 'Sin lugar'}</Text>
          </View>
          {item.descripcion && (
            <Text style={styles.descripcion}>{item.descripcion}</Text>
          )}

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowAnotadas(!showAnotadas)}
          >
            <Text style={styles.accordionTitle}>✅ Anotadas ({anotadas.length})</Text>
            <MaterialIcons name={showAnotadas ? 'expand-less' : 'expand-more'} size={20} color="#07a495" />
          </TouchableOpacity>
          {showAnotadas && (
            <View style={styles.accordionContent}>
              {anotadas.length === 0 ? (
                <Text style={{ color: '#999' }}>Ninguna</Text>
              ) : (
                anotadas.map(j => (
                  <View key={j.uid} style={styles.jugadoraRow}>
                    <Image source={{ uri: j.fotoURL }} style={styles.jugadoraImg} />
                    <Text>{j.nombre} {j.apellido}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowSinRespuesta(!showSinRespuesta)}
          >
            <Text style={styles.accordionTitle}>❓ Sin respuesta ({sinRespuesta.length})</Text>
            <MaterialIcons name={showSinRespuesta ? 'expand-less' : 'expand-more'} size={20} color="#07a495" />
          </TouchableOpacity>
          {showSinRespuesta && (
            <View style={styles.accordionContent}>
              {sinRespuesta.length === 0 ? (
                <Text style={{ color: '#999' }}>Ninguna</Text>
              ) : (
                sinRespuesta.map(j => (
                  <View key={j.uid} style={styles.jugadoraRow}>
                    <Image source={{ uri: j.fotoURL }} style={styles.jugadoraImg} />
                    <Text>{j.nombre} {j.apellido}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowBajas(!showBajas)}
          >
            <Text style={styles.accordionTitle}>❌ Bajas ({bajas.length})</Text>
            <MaterialIcons name={showBajas ? 'expand-less' : 'expand-more'} size={20} color="#07a495" />
          </TouchableOpacity>
          {showBajas && (
            <View style={styles.accordionContent}>
              {bajas.length === 0 ? (
                <Text style={{ color: '#999' }}>Ninguna</Text>
              ) : (
                bajas.map(j => {
                  const motivo = (asistencia[j.uid] as any)?.motivo ?? 'Sin motivo';
                  return (
                    <View key={j.uid} style={styles.jugadoraRow}>
                      <Image source={{ uri: j.fotoURL }} style={styles.jugadoraImg} />
                      <Text>{j.nombre} {j.apellido}</Text>
                      <TouchableOpacity onPress={() => mostrarMotivoModal(motivo)} style={{ marginLeft: 8 }}>
                        <Text style={{ fontSize: 16 }}>📄</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {mostrarMotivo && (
            <View style={{ marginTop: 8 }}>
              <Text>Motivo de baja:</Text>
              <TextInput
                placeholder="Escribe tu motivo..."
                value={motivoBaja}
                onChangeText={setMotivoBaja}
                style={styles.inputMotivo}
              />
              <TouchableOpacity
                style={[styles.boton, { backgroundColor: '#fde68a' }]}
                onPress={() => actualizarAsistencia('baja')}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Enviar baja</Text>
              </TouchableOpacity>
            </View>
          )}

          {!estaVencido && (
            <TouchableOpacity onPress={handleClickAsistencia} style={[styles.boton, { backgroundColor: '#07a495' }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {estadoActual === 'anotada'
                  ? '📤 Darse de baja'
                  : estadoActual === 'baja'
                  ? '✅ Anotarme'
                  : '🟢 Anotarme'}
              </Text>
            </TouchableOpacity>
          )}
          {estaVencido && (
            <Text style={{ marginTop: 10, color: '#9ca3af' }}>
              ⛔ El plazo para editar tu asistencia ha finalizado
            </Text>
          )}

          {adminAutenticado && (
           <View style={styles.adminActionsContainer}>
           <TouchableOpacity onPress={onEditar} style={[styles.boton, styles.editButton]}>
             <Text style={styles.adminButtonText}>✏️ Editar</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={onDelete} style={[styles.boton, styles.deleteButton]}>
             <Text style={[styles.adminButtonText, { color: '#fff' }]}>🗑️ Borrar</Text>
           </TouchableOpacity>
         </View>
            
          )}
        </View>
      </View>

      {motivoVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>📝 Motivo de baja</Text>
            <Text style={{ marginBottom: 12 }}>{motivoSeleccionado}</Text>
            <TouchableOpacity onPress={() => setMotivoVisible(false)} style={[styles.boton, { backgroundColor: '#fcd34d' }]}>
              <Text>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#07a495',
    position: 'relative',
    alignItems: 'flex-start',
  },
  cardVencido: {
    borderLeftColor: '#9ca3af',
    backgroundColor: '#f3f4f6',
  },
  vencidoLabel: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#6b7280',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1,
  },
  fechaBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07a495',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
    minWidth: 54,
  },
  semana: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  dia: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  mes: {
    color: '#fff',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  infoText: {
    color: '#07a495',
    fontSize: 14,
    marginLeft: 4,
  },
  descripcion: {
    color: '#222',
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  accordionTitle: {
    fontWeight: 'bold',
    color: '#07a495',
    fontSize: 15,
  },
  accordionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  jugadoraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jugadoraImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  inputMotivo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
    backgroundColor: '#fef9c3',
  },
  boton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },

  adminActionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#facc15',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    flex: 1,
  },
  adminButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});