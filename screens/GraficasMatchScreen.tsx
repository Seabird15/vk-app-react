import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { doc, getDoc, updateDoc, getDocs, collection, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

type Comentario = {
  uid: string;
  nombre: string;
  imagen: string;
  texto: string;
  fecha: Date;
};

type Noticia = {
  id: string;
  titulo: string;
  contenido: string;
  imagen: string;
  fecha: { seconds: number };
  reacciones: string[];
  comentarios: Comentario[];
};

export default function GraficasMatchScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState<{ [key: string]: string }>({});
  const [userId, setUserId] = useState('anon');
  const [datosUsuario, setDatosUsuario] = useState<any>({});

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const snap = await getDoc(doc(db, 'jugadoras', user.uid));
        if (snap.exists()) {
          setDatosUsuario(snap.data());
        }
      }
    });

    cargarNoticias();
  }, []);

  const cargarNoticias = async () => {
    const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
    const snap = await getDocs(q);
    const noticiasData = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      reacciones: doc.data().reacciones || [],
      comentarios: doc.data().comentarios || [],
    })) as Noticia[];

    setNoticias(noticiasData);
  };

  const comentar = async (noticia: Noticia) => {
    const texto = nuevoComentario[noticia.id]?.trim();
    if (!texto) return;

    const comentarioNuevo: Comentario = {
      uid: userId,
      nombre: datosUsuario.nombre || auth.currentUser?.displayName || 'Anónimo',
      imagen: datosUsuario.fotoURL || 'https://dummyimage.com/50x50/000/fff&text=Avatar',
      texto,
      fecha: new Date(),
    };

    const actualizados = [...noticia.comentarios, comentarioNuevo];

    await updateDoc(doc(db, 'noticias', noticia.id), {
      comentarios: actualizados,
    });

    setNoticias((prev) =>
      prev.map((n) => (n.id === noticia.id ? { ...n, comentarios: actualizados } : n))
    );

    setNuevoComentario((prev) => ({ ...prev, [noticia.id]: '' }));
  };

  const eliminarComentario = async (noticiaId: string, comentarioIndex: number) => {
    const noticia = noticias.find((n) => n.id === noticiaId);
    if (!noticia) return;

    const nuevosComentarios = [...noticia.comentarios];
    nuevosComentarios.splice(comentarioIndex, 1);

    await updateDoc(doc(db, 'noticias', noticiaId), {
      comentarios: nuevosComentarios,
    });

    setNoticias((prev) =>
      prev.map((n) => (n.id === noticiaId ? { ...n, comentarios: nuevosComentarios } : n))
    );
  };

  const toggleReaction = async (noticia: Noticia) => {
    const yaReacciono = noticia.reacciones.includes(userId);
    const nuevasReacciones = yaReacciono
      ? noticia.reacciones.filter((id) => id !== userId)
      : [...noticia.reacciones, userId];

    await updateDoc(doc(db, 'noticias', noticia.id), {
      reacciones: nuevasReacciones,
    });

    setNoticias((prev) =>
      prev.map((n) =>
        n.id === noticia.id ? { ...n, reacciones: nuevasReacciones } : n
      )
    );
  };

  const formatFecha = (fecha: any) => {
    try {
      const date = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
      return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderNoticiaCard = ({ item: noticia, index }: { item: Noticia; index: number }) => (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>

      <Image
        source={{ uri: noticia.imagen || 'https://dummyimage.com/600x400/000/fff&text=Imagen' }}
        style={styles.imagen}
      />

      <View style={styles.contenido}>
        <Text style={styles.tituloNoticia}>{noticia.titulo}</Text>
      <Text style={styles.label}>{index === 0 ? 'Más reciente' : 'Anterior'}</Text>

        <Text>{noticia.contenido}</Text>
        <Text style={styles.fecha}>{formatFecha(noticia.fecha)}</Text>

        <TouchableOpacity
          onPress={() => toggleReaction(noticia)}
          style={styles.reaccion}
        >
          <MaterialIcons name="favorite" size={20} color="#e53935" />
          <Text>{noticia.reacciones?.length || 0}</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Escribe tu comentario..."
          value={nuevoComentario[noticia.id] || ''}
          onChangeText={(text) =>
            setNuevoComentario((prev) => ({ ...prev, [noticia.id]: text }))
          }
          multiline
          style={styles.input}
        />
        <TouchableOpacity onPress={() => comentar(noticia)} style={styles.btn}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Comentar</Text>
        </TouchableOpacity>

        {noticia.comentarios.map((coment, i) => (
          <View key={i} style={styles.comentario}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: coment.imagen }} style={styles.avatar} />
              <Text style={{ fontWeight: 'bold' }}>{coment.nombre}</Text>
            </View>
            <Text style={styles.textoComentario}>{coment.texto}</Text>
            <Text style={styles.fecha}>{formatFecha(coment.fecha)}</Text>

            {coment.uid === userId && (
              <TouchableOpacity
                onPress={() => eliminarComentario(noticia.id, i)}
                style={{ marginTop: 4 }}
              >
                <Text style={{ color: 'red', fontSize: 12 }}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={noticias}
        renderItem={renderNoticiaCard}
        keyExtractor={(item) => item.id}
        numColumns={isDesktop ? 3 : 1}
        key={isDesktop ? 'desktop-grid' : 'mobile-list'} // Clave para forzar re-renderizado
        ListHeaderComponent={<Text style={styles.titulo}>Próximos Eventos</Text>}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
            No hay eventos.
          </Text>
        }
        contentContainerStyle={{ paddingHorizontal: isDesktop ? 16 : 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 'auto',
  },
  titulo: {
    fontSize: 30,
    fontFamily: 'Gobold',
    color: '#07a495',
    textAlign: 'center',
    marginVertical: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 30,
    borderColor: '#07a495',
    borderWidth: 2,
    overflow: 'hidden',
    // Estilos para una sola columna
    marginHorizontal: 16,
  },
  cardDesktop: {
    flex: 1, // Permite que la tarjeta se expanda en la columna
    marginHorizontal: 36, // Espacio entre columnas
  },
  label: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -50 }], // Funciona en todas las plataformas
    backgroundColor: '#ff6b6b',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: 12,
    zIndex: 10,
  },
  imagen: {
    width: '100%',
    minHeight: 700,
  },
  contenido: {
    padding: 12,
  },
  tituloNoticia: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#07a495',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 10,
    color: 'gray',
    marginTop: 6,
  },
  reaccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#ffe5e5',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: '#07a495',
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
  },
  comentario: {
    marginTop: 16,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 999,
  },
  textoComentario: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
});