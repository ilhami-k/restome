import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { formatPrice } from '../../../constants/ui';
import type { MenuItem } from '../../../types';

interface MenuItemRowProps {
  item: MenuItem;
  matchingAllergens: string[];
  onOpen: (itemId: string) => void;
}

export const MenuItemRow = React.memo(function MenuItemRow({
  item,
  matchingAllergens,
  onOpen,
}: MenuItemRowProps) {
  const allergenLabel =
    item.allergens && item.allergens.length > 0
      ? item.allergens.map((allergen) => allergen.name).join(', ')
      : 'Aucun allergène renseigné';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onOpen(item.id)}
    >
      <View style={styles.thumbPlaceholder}>
        {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumbImage} /> : null}
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>
          {allergenLabel}
        </Text>
        {matchingAllergens.length > 0 ? (
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>Contient: {matchingAllergens.join(', ')}</Text>
          </View>
        ) : null}
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.rowActions}>
        {item.available ? (
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={(event) => {
              event.stopPropagation();
              onOpen(item.id);
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        ) : (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Indisponible</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.customerSurface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.customerBackground,
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbImage: {
    width: 56,
    height: 56,
  },
  rowContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.customerText,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    marginTop: 2,
  },
  warningBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.unavailableBackground,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.statusUnavailable,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  rowActions: {
    marginLeft: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  unavailableBadge: {
    backgroundColor: Colors.customerBanner,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  unavailableText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.statusUnavailable,
  },
  pressed: {
    opacity: 0.8,
  },
});
