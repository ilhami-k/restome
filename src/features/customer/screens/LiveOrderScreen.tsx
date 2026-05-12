import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { LiveOrderBanner } from '../components/LiveOrderBanner';
import { LiveOrderItemCard } from '../components/LiveOrderItemCard';
import { useLiveOrder } from '../hooks/useLiveOrder';

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

      <LiveOrderBanner animated={animated} colors={colors} />

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        TABLE {table?.number ?? ''} · SUIVI EN DIRECT
      </Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <LiveOrderItemCard key={item.id} item={item} message={messagesByItemId[item.id]} colors={colors} />
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
