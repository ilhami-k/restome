import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { formatPrice, getMatchingAllergens } from '../../../constants/ui';
import type { Category, MenuItem } from '../../../types';
import { CartBar } from '../components/CartBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { MenuHeader } from '../components/MenuHeader';
import { MenuItemRow } from '../components/MenuItemRow';
import { PostOrderTabBar } from '../components/PostOrderTabBar';
import { SuggestedItems } from '../components/SuggestedItems';
import { useMenuAvailabilityRealtime } from '../hooks/useMenuAvailabilityRealtime';
import { useMenuItems } from '../hooks/useMenuItems';
import { useSuggestedMenuItems } from '../hooks/useSuggestedMenuItems';

export default function MenuScreen() {
  const router = useRouter();
  const { table } = useSession();
  const { theme } = useTheme();
  const { selectedAllergens } = useUserSettings();
  const { items: cartItems, itemCount, total } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(undefined);
  const { items, loading } = useMenuItems(activeCategory);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const colors = getCustomerColors(theme);
  const suggestedItems = useSuggestedMenuItems(menuItems);

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
      router.push(`/${itemId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => (
      <MenuItemRow
        item={item}
        colors={colors}
        onOpen={openItem}
        matchingAllergens={getMatchingAllergens(item.allergens, selectedAllergens).map((allergen) => allergen.name)}
      />
    ),
    [colors, openItem, selectedAllergens]
  );

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

      <CategoryFilter activeCategory={activeCategory} colors={colors} onSelectCategory={setActiveCategory} />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={menuItems}
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
