import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { ITEM_STATUS_LABELS } from '../../../constants/ui';
import { useLiveOrder } from '../hooks/useLiveOrder';
import type { ItemStatus } from '../../../types';

const STATUS_COLORS: Record<ItemStatus, string> = {
  pending: Colors.statusPending,
  preparing: Colors.statusPreparing,
  ready: Colors.statusReady,
  unavailable: Colors.statusUnavailable,
};

export default function LiveOrderScreen() {
  const router = useRouter();
  const { session, table } = useSession();
  const { theme } = useTheme();
  const { items, messagesByItemId } = useLiveOrder(session?.id);
  const [animated, setAnimated] = useState(true);
  const colors = getCustomerColors(theme);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colors.statusBar} />

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

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        TABLE {table?.number ?? ''} · SUIVI EN DIRECT
      </Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardLeft}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
              <View>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.menu_item?.name ?? 'Article'}</Text>
                {item.notes ? <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>“{item.notes}”</Text> : null}
                {messagesByItemId[item.id] ? (
                  <Text style={styles.itemMessage}>{messagesByItemId[item.id]}</Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
                {ITEM_STATUS_LABELS[item.status]}
              </Text>
            </View>
          </View>
        ))}

        {items.length === 0 ? <Text style={[styles.empty, { color: colors.textSecondary }]}>Aucun article en cours</Text> : null}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.addMoreButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
        onPress={() => router.push('/menu')}
      >
        <Text style={[styles.addMoreText, { color: colors.text }]}>+ Ajouter des articles</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
    paddingHorizontal: 20,
  },
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.customerTextMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 20,
  },
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
  empty: {
    textAlign: 'center',
    color: Colors.customerTextSecondary,
    marginTop: 40,
  },
  addMoreButton: {
    backgroundColor: Colors.customerSurface,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
  },
  addMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.customerText,
  },
  pressed: {
    opacity: 0.8,
  },
});
