import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

interface KitchenBackButtonProps {
  label: string;
  onPress: () => void;
}

export function KitchenBackButton({ label, onPress }: KitchenBackButtonProps) {
  return (
    <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={onPress} hitSlop={8}>
      <View style={styles.content}>
        <Ionicons name="arrow-back" size={15} color={Colors.kitchenTextSecondary} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
});
