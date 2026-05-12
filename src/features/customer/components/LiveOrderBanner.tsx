import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import type { getCustomerColors } from '../../../constants/colors';

type CustomerColors = ReturnType<typeof getCustomerColors>;

interface LiveOrderBannerProps {
  animated: boolean;
  colors: CustomerColors;
}

export function LiveOrderBanner({ animated, colors }: LiveOrderBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: colors.banner }]}>
      <Text style={styles.bannerTitle}>Commande confirmée</Text>
      <Text style={styles.bannerSubtitle}>La cuisine prépare votre commande</Text>
      {animated ? (
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.customerBanner,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.customerBorder,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
});
