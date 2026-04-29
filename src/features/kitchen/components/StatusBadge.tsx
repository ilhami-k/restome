import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { ITEM_STATUS_LABELS } from '../../../constants/ui';
import type { ItemStatus } from '../../../types';

const STATUS_COLORS: Record<ItemStatus, string> = {
  pending: Colors.statusPending,
  preparing: Colors.statusPreparing,
  ready: Colors.statusReady,
  unavailable: Colors.statusUnavailable,
};

interface StatusBadgeProps {
  status: ItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + '25' }]}>
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
        {ITEM_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
