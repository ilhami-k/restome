import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface OrderStatusButtonProps {
  itemCount: number;
  colors: CustomerColors;
  onPress: () => void;
}

export function OrderStatusButton({ itemCount, colors, onPress }: OrderStatusButtonProps) {
  const itemLabel = itemCount > 0
    ? `${itemCount} article${itemCount > 1 ? 's' : ''} en suivi`
    : 'Voir les états des articles envoyés';

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.banner, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <View>
          <Text style={styles.label}>Suivi de commande</Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>{itemLabel}</Text>
        </View>
        <Text style={styles.action}>Voir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  button: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
  detail: {
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
