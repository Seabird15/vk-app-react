import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DeleteModal({ visible, onClose, onDelete, evento }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>¿Eliminar entrenamiento?</Text>
          <Text style={styles.message}>
            ¿Estás seguro de eliminar el entrenamiento{' '}
            <Text style={{ fontWeight: 'bold' }}>{evento?.titulo}</Text>?
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.delete}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    color: '#07a495',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    marginBottom: 16,
    fontSize: 14,
    color: '#444',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancel: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  delete: {
    backgroundColor: '#d11a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
