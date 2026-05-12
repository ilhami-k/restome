import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';
import type { Allergen } from '../../../types';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface MenuHeaderProps {
  tableNumber?: number;
  itemCount: number;
  selectedAllergens: Allergen[];
  colors: CustomerColors;
  onOpenSettings: () => void;
  onOpenCart: () => void;
}

export function MenuHeader({
  tableNumber,
  itemCount,
  selectedAllergens,
  colors,
  onOpenSettings,
  onOpenCart,
}: MenuHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={[styles.tableLabel, { color: colors.textMuted }]}>Table {tableNumber ?? ''}</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={onOpenSettings}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Paramètres</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={onOpenCart}
          >
            <Text style={[styles.cartIcon, { color: colors.text }]}>Panier</Text>
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      {selectedAllergens.length > 0 ? (
        <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
          Allergies suivies: {selectedAllergens.map((allergen) => allergen.name).join(', ')}
        </Text>
      ) : (
        <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
          Ajoutez vos allergies dans Paramètres pour être averti sur les plats concernés.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tableLabel: {
    fontSize: 12,
    color: Colors.customerTextMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.customerText,
  },
  secondaryButton: {
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.customerText,
  },
  preferenceHint: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  cartButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.customerText,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
