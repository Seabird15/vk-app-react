import React, { useState, useEffect  } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, doc, updateDoc, deleteDoc }from 'firebase/firestore';
import { Alert } from 'react-native';
import { db } from '../services/firebase';

type Props = {
  visible: boolean;
  onClose: () => void;
    entrenamiento?: Entrenamiento | null;
};

export default function NuevoEntrenamientoModal({ visible, onClose, entrenamiento  }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');

  const [fecha, setFecha] = useState<Date>(new Date());
  const [horaInicio, setHoraInicio] = useState<Date>(new Date());
  const [horaTermino, setHoraTermino] = useState<Date>(new Date());

  const [pickerVisible, setPickerVisible] = useState<null | 'fecha' | 'inicio' | 'termino'>(null);

  const [equipo, setEquipo] = useState('jugadoras-ascenso');
  const [mostrarOpcionesEquipo, setMostrarOpcionesEquipo] = useState(false);

   useEffect(() => {
    if (entrenamiento) {
      setTitulo(entrenamiento.titulo);
      setDescripcion(entrenamiento.descripcion ?? '');
      setLugar(entrenamiento.lugar ?? '');
      setFecha(entrenamiento.fecha ? new Date(entrenamiento.fecha) : new Date());
      setHoraInicio(entrenamiento.horaInicio ? new Date(entrenamiento.horaInicio) : new Date());
      setHoraTermino(entrenamiento.horaTermino ? new Date(entrenamiento.horaTermino) : new Date());
      setEquipo(entrenamiento.equipo ?? 'jugadoras-ascenso');
    } else {
      setTitulo('');
      setDescripcion('');
      setLugar('');
      setFecha(new Date());
      setHoraInicio(new Date());
      setHoraTermino(new Date());
      setEquipo('jugadoras-ascenso');
    }
  }, [entrenamiento, visible]);

 const handleGuardar = async () => {
  if (!titulo || !descripcion || !lugar) {
    alert('Completa todos los campos');
    return;
  }

  try {
    if (entrenamiento && entrenamiento.id) {
      // Editar existente
      const ref = doc(db, 'entrenamientos', entrenamiento.id);
      await updateDoc(ref, {
        titulo,
        descripcion,
        lugar,
        equipo,
        fecha,
        horaInicio,
        horaTermino,
      });
      alert('Entrenamiento actualizado');
    } else {
      // Crear nuevo
      await addDoc(collection(db, 'entrenamientos'), {
        titulo,
        descripcion,
        lugar,
        equipo,
        fecha,
        horaInicio,
        horaTermino,
        asistencia: {},
      });
      alert('Entrenamiento guardado');
    }
    onClose();
    // Resetear formulario
    setTitulo('');
    setDescripcion('');
    setLugar('');
    setFecha(new Date());
    setHoraInicio(new Date());
    setHoraTermino(new Date());
    setEquipo('jugadoras-ascenso');
    setMostrarOpcionesEquipo(false);
  } catch (error) {
    console.error('Error al guardar entrenamiento:', error);
    alert('Error al guardar');
  }
};

const handleBorrar = () => {
  if (entrenamiento && entrenamiento.id) {
    Alert.alert(
      '¿Borrar entrenamiento?',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'entrenamientos', entrenamiento.id));
              alert('Entrenamiento borrado');
              onClose();
            } catch (error) {
              console.error('Error al borrar entrenamiento:', error);
              alert('Error al borrar');
            }
          },
        },
      ]
    );
  }
};


  const renderPicker = () => {
    if (!pickerVisible) return null;

    const current =
      pickerVisible === 'fecha' ? fecha : pickerVisible === 'inicio' ? horaInicio : horaTermino;

    return (
      <DateTimePicker
        value={current}
        mode={pickerVisible === 'fecha' ? 'date' : 'time'}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(_, selectedDate) => {
          if (selectedDate) {
            if (pickerVisible === 'fecha') setFecha(selectedDate);
            if (pickerVisible === 'inicio') setHoraInicio(selectedDate);
            if (pickerVisible === 'termino') setHoraTermino(selectedDate);
          }
          setPickerVisible(null);
        }}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
<Text style={styles.titulo}>
  {entrenamiento ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
</Text>

          <TextInput
            placeholder="Título"
            value={titulo}
            onChangeText={setTitulo}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.input}
          />
          <TextInput
            placeholder="Lugar"
            value={lugar}
            onChangeText={setLugar}
            style={styles.input}
          />

          {/* Selector nativo de categoría */}
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Categoría:</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setMostrarOpcionesEquipo(!mostrarOpcionesEquipo)}
            >
              <Text>{equipo === 'jugadoras-ascenso' ? 'Ascenso' : 'Escuela'}</Text>
            </TouchableOpacity>

            {mostrarOpcionesEquipo && (
              <View style={styles.opciones}>
                <TouchableOpacity
                  onPress={() => {
                    setEquipo('jugadoras-ascenso');
                    setMostrarOpcionesEquipo(false);
                  }}
                >
                  <Text style={styles.opcion}>Ascenso</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEquipo('jugadoras-escuela');
                    setMostrarOpcionesEquipo(false);
                  }}
                >
                  <Text style={styles.opcion}>Escuela</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Fecha y hora */}
          <TouchableOpacity onPress={() => setPickerVisible('fecha')} style={styles.pickerButton}>
          { /*mostrar texto 'editar fecha' si se esta editando un entrenamiento existente */ }
            <Text>{entrenamiento ? '📅 Fecha: Nueva fecha' : `📅 Fecha: ${fecha.toLocaleDateString()}`}</Text>

         
            
            
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPickerVisible('inicio')} style={styles.pickerButton}>
                  { /*mostrar texto 'editar hora inicio' si se esta editando un entrenamiento existente */ }

            <Text>
              🕒 Inicio:{' '}
                  {entrenamiento ? ' Nueva hora inicio' :    ` ${horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ` }
           
            </Text>

           
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPickerVisible('termino')} style={styles.pickerButton}>
            <Text>
              🕓 Término:{' '}
                {entrenamiento ? ' Nueva hora término' :   `${horaTermino.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} `}

            </Text>
          </TouchableOpacity>

          {renderPicker()}

    <View style={styles.botonera}>
  <Button title="Cancelar" onPress={onClose} />
  <Button title="Guardar" onPress={handleGuardar} />
  {entrenamiento && entrenamiento.id && (
    <Button
      title="Borrar"
      color="#dc2626"
      onPress={handleBorrar}
    />
  )}
</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 10,
  },
  botonera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  selectorContainer: {
    marginBottom: 12,
  },
  selector: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  opciones: {
    marginTop: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  opcion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
