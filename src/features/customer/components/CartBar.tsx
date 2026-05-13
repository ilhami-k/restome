import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface CartBarProps {
  itemCount: number;
  totalLabel: string;
  onPress: () => void;
  bottomOffset?: number;
}

export function CartBar({ itemCount, totalLabel, onPress, bottomOffset = 20 }: CartBarProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cartBar, { bottom: bottomOffset }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.cartBarCount}>
        <Text style={styles.cartBarCountText}>{itemCount}</Text>
      </View>
      <Text style={styles.cartBarText}>Voir la commande</Text>
      <Text style={styles.cartBarTotal}>{totalLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBarCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarCountText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  cartBarText: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  cartBarTotal: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
