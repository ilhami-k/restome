import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';
import { CUSTOMER_CATEGORY_FILTERS } from '../../../constants/ui';
import type { Category } from '../../../types';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface CategoryFilterProps {
  activeCategory?: Category;
  colors: CustomerColors;
  onSelectCategory: (category?: Category) => void;
}

export function CategoryFilter({ activeCategory, colors, onSelectCategory }: CategoryFilterProps) {
  return (
    <View style={styles.pills}>
      {CUSTOMER_CATEGORY_FILTERS.map((category) => (
        <Pressable
          key={category.label}
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: colors.surface, borderColor: colors.border },
            activeCategory === category.value && styles.pillActive,
            pressed && styles.pressed,
          ]}
          onPress={() => onSelectCategory(category.value)}
        >
          <Text
            style={[
              styles.pillText,
              { color: colors.textSecondary },
              activeCategory === category.value && styles.pillTextActive,
            ]}
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: Colors.customerTextSecondary,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
