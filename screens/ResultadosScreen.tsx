import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ResultadosScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [resultsData, setResultsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarResultados = async () => {
      const q = query(collection(db, 'resultados'), orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      const results: Record<string, any[]> = {};
      const tabsSet = new Set<string>();

      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.tab) return;
        if (!results[data.tab]) results[data.tab] = [];
        results[data.tab].push(data);
        tabsSet.add(data.tab);
      });

      setResultsData(results);
      const tabsArray = Array.from(tabsSet);
      setTabs(tabsArray);
      if (tabsArray.length > 0) setActiveTab(tabsArray[0]);
      setLoading(false);
    };

    cargarResultados();
  }, []);

  const currentResults = resultsData[activeTab]?.slice(0, 1) || [];

  return (
    <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}>
      <Text style={styles.title}>Partidos</Text>

      <View style={[styles.tabsContainer, isDesktop && styles.tabsContainerDesktop]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#07a495" />
      ) : currentResults.length > 0 ? (
        currentResults.map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <Text style={styles.status}>{match.status}</Text>
            <View style={styles.matchRow}>
              <View style={styles.teamContainer}>
                <Image
                  source={require('../assets/vk-logo-normal.png')}
                  style={styles.logo}
                />
                <Text style={styles.teamName}>{match.team1.name}</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.score}>{match.team1.score}</Text>
                <Text style={styles.vs}>VS</Text>
                <Text style={styles.score}>{match.team2.score}</Text>
              </View>

              <View style={styles.teamContainer}>
                <Text style={styles.teamName}>{match.team2.name}</Text>
              </View>
            </View>

            <View style={styles.golesSection}>
              <Text style={styles.golesTitle}>Goles:</Text>
              {match.goles?.length > 0 ? (
                <View style={styles.golesList}>
                  {match.goles.map((goal: any, i: number) => (
                    <Text key={i} style={styles.goalTag}>⚽ {goal.player}</Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.noGoles}>Sin goles</Text>
              )}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noResults}>No hay resultados disponibles.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  containerDesktop: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'Gobold',
    color: '#ffde59',
    marginBottom: 18,
    letterSpacing: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    alignSelf: 'center',
  },
  tabsContainerDesktop: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#181f2b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffde59',
    marginHorizontal: 4,
    marginBottom: Platform.OS === 'web' ? 8 : 0, // Espacio inferior para web
  },
  tabButtonActive: {
    backgroundColor: '#ffde59',
    borderColor: '#ffde59',
  },
  tabText: {
    color: '#ffde59',
    fontWeight: 'bold',
    fontFamily: 'Gobold',
    fontSize: 14,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#181f2b',
  },
  matchCard: {
    backgroundColor: '#181f2b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#ffde59',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  status: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffde59',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    marginBottom: 2,
    borderRadius: 22,
    backgroundColor: '#fff',
  },
  teamName: {
    fontSize: 13,
    fontFamily: 'Gobold',
    color: '#ffde59',
    textAlign: 'center',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    paddingHorizontal: 8,
  },
  score: {
    fontSize: 28,
    fontFamily: 'Gobold',
    color: '#ffde59',
    marginVertical: 2,
  },
  vs: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
    letterSpacing: 1,
  },
  golesSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#232b3b',
  },
  golesTitle: {
    fontWeight: 'bold',
    color: '#ffde59',
    fontFamily: 'Gobold',
    marginBottom: 4,
    fontSize: 14,
  },
  golesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  goalTag: {
    backgroundColor: '#ffde59',
    color: '#181f2b',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 6,
    marginBottom: 6,
    fontFamily: 'Gobold',
  },
  noGoles: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    fontStyle: 'italic',
  },
  noResults: {
    color: '#ffde59',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    fontFamily: 'Gobold',
  },
});