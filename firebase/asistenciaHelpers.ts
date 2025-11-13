// firebase/asistenciaHelpers.ts
import { db } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

export const guardarAsistencia = async (entrenoId: string, uid: string, estado: string, motivo = '') => {
  await setDoc(doc(db, `asistencias_${entrenoId}`, uid), {
    uid,
    estado,
    motivo,
  });
};

export const obtenerAsistencias = async (entrenoId: string) => {
  const snap = await getDocs(collection(db, `asistencias_${entrenoId}`));
  return snap.docs.map(doc => doc.data());
};
