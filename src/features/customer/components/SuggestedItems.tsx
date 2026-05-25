import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';
import type { MenuItem } from '../../../types';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface SuggestedItemsProps {
  items: MenuItem[];
  colors: CustomerColors;
  onOpenItem: (itemId: string) => void;
}

export function SuggestedItems({ items, colors, onOpenItem }: SuggestedItemsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.suggestionBox}>
      <Pressable
        style={({ pressed }) => [
          styles.toggleButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
        onPress={() => setIsOpen((current) => !current)}
      >
        <Text style={[styles.suggestionTitle, { color: colors.text }]}>Déjà commandé ({items.length})</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
      </Pressable>

      {isOpen ? (
        <View style={styles.suggestionPills}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.suggestionPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => onOpenItem(item.id)}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionBox: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
