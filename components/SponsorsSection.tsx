import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  FlatList,
} from 'react-native';

type Sponsor = { name: string; logo: string };

const teal = '#07a495';

const DEFAULT_SPONSORS: Sponsor[] = [
  {
    name: 'Sponsor 1',
    logo: 'https://firebasestorage.googleapis.com/v0/b/sitiovks.firebasestorage.app/o/Fotos%2FRabiosa%20coffee%20Circular.png?alt=media&token=25f394d9-7ce2-462d-95ab-cb877515a7bb',
  },
  {
    name: 'Sponsor 2',
    logo: 'https://images.jumpseller.com/store/peregrino-coffee-roasters/store/logo/Logo_Peregrino_Coffee_Roasters_shopping.png?1727281689',
  },
  {
    name: 'Sponsor 3',
    logo: 'https://firebasestorage.googleapis.com/v0/b/sitiovks.firebasestorage.app/o/Fotos%2FLogo%20Monster%20box.png?alt=media&token=9c107750-826b-4e6a-a357-8935e30ff255',
  },
  {
    name: 'Sponsor 4',
    logo: 'https://firebasestorage.googleapis.com/v0/b/sitiovks.firebasestorage.app/o/Fotos%2FLogo%20Bamati.png?alt=media&token=be73ea29-5bd3-4ee7-84b1-0219123ce0d9',
  },
  {
    name: 'Sponsor 5',
    logo: 'https://res.cloudinary.com/dfr2c9ry2/image/upload/v1749150971/profile-removebg-preview_trwz2f.png',
  },
];

export default function SponsorsSection({
  sponsors = DEFAULT_SPONSORS,
  allianceImage = require('../assets/logospiritpng.png'),
}: {
  sponsors?: Sponsor[];
  allianceImage?: any; // require(...)
}) {
  const { width } = useWindowDimensions();
  const numColumns = useMemo(() => {
    if (width >= 1200) return 5;
    if (width >= 900) return 4;
    if (width >= 600) return 3;
    return 2;
  }, [width]);

  return (
    <View style={styles.section}>

      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.title}>Sponsors</Text>
      </View>

      {/* Grid de logos */}
      <View style={styles.gridWrap}>
        <FlatList
          data={sponsors}
          keyExtractor={(item) => item.name}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.column : undefined}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.logo }}
                style={styles.logo}
                resizeMode="contain"
                accessible
                accessibilityLabel={item.name}
              />
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
        />
      </View>

      {/* En alianza con */}
      <View style={styles.allianceRow}>
        <Text style={styles.allianceText2}>En alianza con:</Text>
        <Image source={allianceImage}  resizeMode="contain" />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  section: {
    paddingVertical: 28,
    paddingHorizontal: 12,
    backgroundColor: '#101820', // Negro profundo
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  title: {
    color: teal,
    textTransform: 'uppercase',
    fontFamily: 'Gobold',
    letterSpacing: 2,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  gridWrap: {
    paddingVertical: 10,
    marginBottom: 18,
    shadowColor: '#07a495',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  column: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  card: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#ffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#ffff',
  },
  logo: {
    width: '90%',
    height: 54,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  allianceRow: {
    marginTop: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  allianceText: {
    color: teal,
    fontSize: 18,
    fontFamily: 'Gobold',
    fontWeight: 'bold',
    paddingVertical: 8,
    marginRight: 8,
    letterSpacing: 1,
  },
  allianceText2: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TextFont',
    paddingVertical: 8,
    marginRight: 8,
    letterSpacing: 1,
  },
  allianceImg: {
    width: 120,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#07a495',
  },
});