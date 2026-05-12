import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';
import { ITEM_STATUS_LABELS } from '../../../constants/ui';
import type { ItemStatus, OrderItem } from '../../../types';

type CustomerColors = ReturnType<typeof getCustomerColors>;

const STATUS_COLORS: Record<ItemStatus, string> = {
  pending: Colors.statusPending,
  preparing: Colors.statusPreparing,
  ready: Colors.statusReady,
  unavailable: Colors.statusUnavailable,
};

interface LiveOrderItemCardProps {
  item: OrderItem;
  message?: string;
  colors: CustomerColors;
}

export function LiveOrderItemCard({ item, message, colors }: LiveOrderItemCardProps) {
  const statusColor = STATUS_COLORS[item.status];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <View>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.menu_item?.name ?? 'Article'}</Text>
          {item.notes ? <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>“{item.notes}”</Text> : null}
          {message ? <Text style={styles.itemMessage}>{message}</Text> : null}
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.badgeText, { color: statusColor }]}>{ITEM_STATUS_LABELS[item.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.customerSurface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.customerText,
  },
  itemNotes: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemMessage: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
