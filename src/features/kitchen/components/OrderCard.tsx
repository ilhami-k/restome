import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { StatusBadge } from './StatusBadge';
import type { GroupedKitchenOrder } from '../hooks/useKitchenOrders';
import type { ItemStatus } from '../../../types';

interface OrderCardProps {
  group: GroupedKitchenOrder;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onMarkUnavailable: (itemId: string) => void;
}

export function OrderCard({ group, onUpdateStatus, onMarkUnavailable }: OrderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tableBadge}>
          <Text style={styles.tableBadgeText}>{group.tableNumber}</Text>
        </View>
        <Text style={styles.cardTime}>
          {new Date(group.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.cardCount}>
          {group.items.length} article{group.items.length > 1 ? 's' : ''}
        </Text>
      </View>

      {group.items.map((item) => (
        <View key={item.id}>
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.menu_item?.name ?? 'Article'}</Text>
              {item.notes ? <Text style={styles.itemNotes}>“{item.notes}”</Text> : null}
            </View>
            <StatusBadge status={item.status} />
          </View>

          {(item.status === 'pending' || item.status === 'preparing') && (
            <View style={styles.actions}>
              {item.status === 'pending' ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: Colors.statusPreparing + '25' },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onUpdateStatus(item.id, 'preparing')}
                >
                  <Text style={[styles.actionText, { color: Colors.statusPreparing }]}>
                    Lancer la préparation
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: Colors.statusReady + '25' },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onUpdateStatus(item.id, 'ready')}
                >
                  <Text style={[styles.actionText, { color: Colors.statusReady }]}>Marquer prêt</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: Colors.statusUnavailable + '25' },
                  pressed && styles.pressed,
                ]}
                onPress={() => onMarkUnavailable(item.id)}
              >
                <Text style={[styles.actionText, { color: Colors.statusUnavailable }]}>Indispo.</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tableBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  cardTime: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  cardCount: {
    marginLeft: 'auto',
    fontSize: 12,
    color: Colors.kitchenTextSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  itemNotes: {
    fontSize: 12,
    color: Colors.kitchenTextSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
