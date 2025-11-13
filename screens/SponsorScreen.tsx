import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SponsorsSection from '../components/SponsorsSection';
import { useNavigation } from '@react-navigation/native';

const teal = '#07a495';

export default function SponsorsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
   

      <SponsorsSection />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 16 },

});
