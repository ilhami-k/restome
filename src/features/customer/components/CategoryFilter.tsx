import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';
import { CUSTOMER_MENU_FILTERS, type CustomerMenuFilter } from '../../../constants/ui';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface CategoryFilterProps {
  activeFilter: CustomerMenuFilter;
  colors: CustomerColors;
  onSelectFilter: (filter: CustomerMenuFilter) => void;
}

export function CategoryFilter({ activeFilter, colors, onSelectFilter }: CategoryFilterProps) {
  return (
    <View style={styles.pills}>
      {CUSTOMER_MENU_FILTERS.map((category) => (
        <Pressable
          key={category.label}
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: colors.surface, borderColor: colors.border },
            activeFilter === category.value && styles.pillActive,
            pressed && styles.pressed,
          ]}
          onPress={() => onSelectFilter(category.value)}
        >
          <Text
            style={[
              styles.pillText,
              { color: colors.textSecondary },
              activeFilter === category.value && styles.pillTextActive,
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
    flexWrap: 'wrap',
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
