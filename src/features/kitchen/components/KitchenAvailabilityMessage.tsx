import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface KitchenAvailabilityMessageProps {
  value: string;
  onChange: (value: string) => void;
}

export function KitchenAvailabilityMessage({ value, onChange }: KitchenAvailabilityMessageProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>Message envoyé quand un article est désactivé</Text>
      <TextInput
        style={styles.input}
        placeholder="Message client"
        placeholderTextColor={Colors.kitchenTextSecondary}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginBottom: 12,
  },
  label: {
    color: Colors.kitchenTextSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
  },
});
