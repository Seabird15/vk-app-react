import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PortalScreen() {
  const navigation = useNavigation();
  const [openTab, setOpenTab] = useState('');

  const toggleTab = (tab: string) => {
    setOpenTab(prev => (prev === tab ? '' : tab));
  };

  return (
    <ScrollView >
      <View style={styles.container}>
        <Text style={styles.title}>Portal Jugadora</Text>

        {[
          {
            key: 'ascenso',
            label: 'Equipo Ascenso',
            color: '#07a495',
            iconColor: '#e0f2fe',
            routes: [
              { label: 'Jugadoras Ascenso', to: 'JugadorasAscenso' },
              { label: 'Objetivos Ascenso', to: 'ObjetivosAscenso' },
              { label: 'Entrenamientos Ascenso', to: 'EventosAscenso' }, // Ruta corregida
            ],
          },
          {
            key: 'escuela',
            label: 'Equipo Escuela',
            color: '#facc15',
            iconColor: '#fef9c3',
            routes: [
              { label: 'Jugadoras Escuela', to: 'JugadorasEscuela' },
              { label: 'Objetivos Escuela', to: 'ObjetivosEscuela' },
              { label: 'Entrenamientos Escuela', to: 'EventosEscuela' }, // Ruta corregida
            ],
          },
      
        ].map(team => (
          <View key={team.key} style={styles.section}>
            <TouchableOpacity
              onPress={() => toggleTab(team.key)}
              style={[styles.button, { borderColor: team.color }]}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.iconCircle, { backgroundColor: team.iconColor }]}>
                  <MaterialIcons name="shield" size={24} color={team.color} />
                </View>
                <Text style={styles.buttonLabel}>{team.label}</Text>
              </View>
              <MaterialIcons
                name={openTab === team.key ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            {openTab === team.key && (
              <View style={styles.dropdown}>
                {team.routes.map((route, idx) => (
                  <TouchableOpacity
                    key={idx}
                    disabled={route.to === ''}
                    onPress={() => navigation.navigate(route.to as never)}
                    style={[
                      styles.link,
                      idx === team.routes.length - 1 && { borderBottomWidth: 0 } // Quitar borde al último
                    ]}
                  >
                    <Text style={styles.linkText}>{route.label}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color={team.color} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* --- SECCIÓN ACTUALIZADA --- */}
        <Text style={styles.title}>Nuestro Club</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Club' as never)}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Conoce Nuestra Historia</Text>
          <MaterialIcons name="info-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Gobold',
    color:'#07a495',
    textAlign: 'center',
    marginVertical: 24,
  },
  section: {
    marginBottom: 20,
  },
  button: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dropdown: {
    marginTop: -10, // Para que se una al botón
    paddingTop: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderTopWidth: 0,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  linkText: {
    fontWeight: '600',
    color: '#334155',
    fontSize: 15,
  },
  // Estilos renombrados y reutilizables
  actionButton: {
    marginTop: 10,
    backgroundColor: '#07a495',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});