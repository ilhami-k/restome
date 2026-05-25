import React from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { CATEGORY_LABELS, formatPrice } from '../../../constants/ui';
import type { Category, MenuItem } from '../../../types';

export type KitchenMenuListEntry =
  | { id: string; type: 'section'; category: Category }
  | { id: string; type: 'item'; item: MenuItem };

interface KitchenMenuListProps {
  categoryOrder: readonly Category[];
  filteredItemCount: number;
  itemsByCategory: Record<string, MenuItem[]>;
  listRef?: React.Ref<FlatList<KitchenMenuListEntry>>;
  ListHeaderComponent?: React.ReactElement;
  onToggleItem: (item: MenuItem) => void;
  onEditItem: (item: MenuItem) => void;
}

export function KitchenMenuList({
  categoryOrder,
  filteredItemCount,
  itemsByCategory,
  listRef,
  ListHeaderComponent,
  onToggleItem,
	onEditItem,
}: KitchenMenuListProps) {
  const entries: KitchenMenuListEntry[] = [];

  for (const category of categoryOrder) {
    const categoryItems = itemsByCategory[category];
    if (categoryItems.length > 0) {
      entries.push({ id: `section-${category}`, type: 'section', category });

      for (const item of categoryItems) {
        entries.push({ id: item.id, type: 'item', item });
      }
    }
  }

  return (
    <FlatList
      ref={listRef}
      data={entries}
      keyExtractor={(entry) => entry.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={filteredItemCount === 0 ? <Text style={styles.empty}>Aucun article trouvé</Text> : null}
      renderItem={({ item: entry }) => {
        if (entry.type === 'section') {
          return <Text style={styles.sectionTitle}>{CATEGORY_LABELS[entry.category].toUpperCase()}</Text>;
        }

        const item = entry.item;
        return (
          <View style={styles.row}>
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
              <Pressable
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                onPress={() => onEditItem(item)}
              >
                <Text style={styles.editButtonText}>Editer</Text>
              </Pressable>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
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
