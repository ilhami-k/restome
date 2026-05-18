import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import {
  containsSelectedAllergen,
  formatPrice,
  getMatchingAllergens,
  type CustomerMenuFilter,
} from '../../../constants/ui';
import type { MenuItem } from '../../../types';
import { CartBar } from '../components/CartBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { MenuHeader } from '../components/MenuHeader';
import { MenuItemRow } from '../components/MenuItemRow';
import { PostOrderTabBar } from '../components/PostOrderTabBar';
import { SuggestedItems } from '../components/SuggestedItems';
import { useMenuAvailabilityRealtime } from '../hooks/useMenuAvailabilityRealtime';
import { useMenuItems } from '../hooks/useMenuItems';
import { useSuggestedMenuItems } from '../hooks/useSuggestedMenuItems';

const EMPTY_MATCHING_ALLERGENS: string[] = [];

export default function MenuScreen() {
  const router = useRouter();
  const { table } = useSession();
  const { theme } = useTheme();
  const { selectedAllergens } = useUserSettings();
  const { items: cartItems, itemCount, total } = useCart();
  const [activeFilter, setActiveFilter] = useState<CustomerMenuFilter>(undefined);
  const category = activeFilter === 'allergens' ? undefined : activeFilter;
  const { items, loading, error } = useMenuItems(category);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const colors = useMemo(() => getCustomerColors(theme), [theme]);
  const suggestedItems = useSuggestedMenuItems(menuItems, selectedAllergens);
  const matchingAllergensByItemId = useMemo(() => {
    const nextMap = new Map<string, string[]>();

    for (const item of menuItems) {
      nextMap.set(
        item.id,
        getMatchingAllergens(item.allergens, selectedAllergens).map((allergen) => allergen.name)
      );
    }

    return nextMap;
  }, [menuItems, selectedAllergens]);

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  const handleAvailabilityUpdate = useCallback((id: string, available: boolean, availabilityMessage: string | null) => {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, available, availability_message: availabilityMessage } : item
      )
    );
  }, []);

  useMenuAvailabilityRealtime(handleAvailabilityUpdate);

  const openItem = useCallback(
    (itemId: string) => {
      router.push({ pathname: '/items/[itemId]', params: { itemId } });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => (
      <MenuItemRow
        item={item}
        colors={colors}
        onOpen={openItem}
        matchingAllergens={matchingAllergensByItemId.get(item.id) ?? EMPTY_MATCHING_ALLERGENS}
      />
    ),
    [colors, matchingAllergensByItemId, openItem]
  );

  const displayedItems = useMemo(() => menuItems.filter((item) => {
    const hasSelectedAllergen = containsSelectedAllergen(item, selectedAllergens);
    return activeFilter === 'allergens' ? hasSelectedAllergen : !hasSelectedAllergen;
  }), [activeFilter, menuItems, selectedAllergens]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      <MenuHeader
        tableNumber={table?.number}
        itemCount={itemCount}
        selectedAllergens={selectedAllergens}
        colors={colors}
        onOpenSettings={() => router.push('/settings')}
        onOpenCart={() => router.push('/order-summary')}
      />

      <SuggestedItems items={suggestedItems} colors={colors} onOpenItem={openItem} />

      <CategoryFilter activeFilter={activeFilter} colors={colors} onSelectFilter={setActiveFilter} />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {cartItems.length > 0 ? (
        <CartBar
          itemCount={itemCount}
          totalLabel={formatPrice(total)}
          onPress={() => router.push('/order-summary')}
          bottomOffset={80}
        />
      ) : null}

      <PostOrderTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    marginTop: 24,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
