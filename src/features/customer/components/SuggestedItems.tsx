import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.suggestionBox}>
      <Text style={[styles.suggestionTitle, { color: colors.text }]}>Suggestions</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionBox: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  suggestionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
