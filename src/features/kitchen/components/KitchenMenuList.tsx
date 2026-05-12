import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { CATEGORY_LABELS, formatPrice } from '../../../constants/ui';
import type { Category, MenuItem } from '../../../types';

interface KitchenMenuListProps {
  categoryOrder: readonly Category[];
  filteredItemCount: number;
  itemsByCategory: Record<string, MenuItem[]>;
  onToggleItem: (item: MenuItem) => void;
  onEditItem: (item: MenuItem) => void;
}

export function KitchenMenuList({
  categoryOrder,
  filteredItemCount,
  itemsByCategory,
  onToggleItem,
  onEditItem,
}: KitchenMenuListProps) {
  return (
    <>
      {categoryOrder.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (categoryItems.length === 0) {
          return null;
        }

        return (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{CATEGORY_LABELS[category].toUpperCase()}</Text>
            {categoryItems.map((item) => (
              <View key={item.id} style={styles.row}>
                <Switch
                  value={item.available}
                  onValueChange={() => onToggleItem(item)}
                  trackColor={{ false: Colors.kitchenBorder, true: Colors.primary + '80' }}
                  thumbColor={item.available ? Colors.primary : Colors.kitchenTextSecondary}
                />
                <View style={styles.rowContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.available ? 'Visible dans le menu' : 'Masqué côté client'}
                  </Text>
                  {!item.available && item.availability_message ? (
                    <Text style={styles.itemMessage}>{item.availability_message}</Text>
                  ) : null}
                </View>
                <View style={styles.rowActions}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.pressed]} onPress={() => onEditItem(item)}>
                    <Text style={styles.editButtonText}>Editer</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        );
      })}

      {filteredItemCount === 0 ? <Text style={styles.empty}>Aucun article trouvé</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  rowContent: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  itemMeta: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    marginTop: 2,
  },
  itemMessage: {
    fontSize: 11,
    color: Colors.primaryLight,
    marginTop: 3,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'right',
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },
  editButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Colors.kitchenBackground,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: Colors.kitchenTextSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pressed: {
    opacity: 0.8,
  },
});
