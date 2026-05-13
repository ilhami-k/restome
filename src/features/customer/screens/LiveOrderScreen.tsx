import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { LiveOrderBanner } from '../components/LiveOrderBanner';
import { LiveOrderItemCard } from '../components/LiveOrderItemCard';
import { PostOrderTabBar } from '../components/PostOrderTabBar';
import { useLiveOrder } from '../hooks/useLiveOrder';

export default function LiveOrderScreen() {
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

      <PostOrderTabBar />
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
});
