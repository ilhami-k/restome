import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [isOpen, setIsOpen] = useState(false);
  const activeLabel = useMemo(() => {
    return CUSTOMER_MENU_FILTERS.find((filter) => filter.value === activeFilter)?.label ?? 'Tout';
  }, [activeFilter]);

  return (
    <View style={styles.filterBox}>
      <Pressable
        style={({ pressed }) => [
          styles.toggleButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
        onPress={() => setIsOpen((current) => !current)}
      >
        <View style={styles.toggleLabel}>
          <Ionicons name="filter" size={17} color={colors.text} />
          <Text style={[styles.toggleText, { color: colors.text }]}>Filtres</Text>
        </View>
        <View style={styles.toggleLabel}>
          <Text style={[styles.activeLabel, { color: colors.textSecondary }]}>{activeLabel}</Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
        </View>
      </Pressable>

      {isOpen ? (
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  filterBox: {
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
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeLabel: {
    fontSize: 13,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
