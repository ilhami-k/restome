import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface KitchenMenuHeaderProps {
  onBack: () => void;
}

export function KitchenMenuHeader({ onBack }: KitchenMenuHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={onBack}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <View>
        <Text style={styles.headerLabel}>GESTION</Text>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  back: {
    fontSize: 20,
    color: Colors.white,
  },
  headerLabel: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
});
