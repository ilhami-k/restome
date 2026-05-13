import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

export function KitchenMenuHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Menu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 4,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
});
