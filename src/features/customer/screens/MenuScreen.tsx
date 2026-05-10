import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { CUSTOMER_CATEGORY_FILTERS, formatPrice, getMatchingAllergens } from '../../../constants/ui';
import type { Category, MenuItem } from '../../../types';
import { CartBar } from '../components/CartBar';
import { MenuItemRow } from '../components/MenuItemRow';
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

      <View style={styles.header}>
        <Text style={[styles.tableLabel, { color: colors.textMuted }]}>Table {table?.number ?? ''}</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/settings')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Paramètres</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.cartButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/order-summary')}
            >
              <Text style={[styles.cartIcon, { color: colors.text }]}>Panier</Text>
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
        {selectedAllergens.length > 0 ? (
          <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
            Allergies suivies: {selectedAllergens.map((allergen) => allergen.name).join(', ')}
          </Text>
        ) : (
          <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
            Ajoutez vos allergies dans Paramètres pour être averti sur les plats concernés.
          </Text>
        )}
      </View>

      {suggestedItems.length > 0 ? (
        <View style={styles.suggestionBox}>
          <Text style={[styles.suggestionTitle, { color: colors.text }]}>Suggestions</Text>
          <View style={styles.suggestionPills}>
            {suggestedItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.suggestionPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
                onPress={() => openItem(item.id)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.pills}>
        {CUSTOMER_CATEGORY_FILTERS.map((category) => (
          <Pressable
            key={category.label}
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeCategory === category.value && styles.pillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setActiveCategory(category.value)}
          >
            <Text
              style={[
                styles.pillText,
                { color: colors.textSecondary },
                activeCategory === category.value && styles.pillTextActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>

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
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tableLabel: {
    fontSize: 12,
    color: Colors.customerTextMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.customerText,
  },
  secondaryButton: {
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.customerText,
  },
  preferenceHint: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  cartButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.customerText,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  pills: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  suggestionBox: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  suggestionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: Colors.customerTextSecondary,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  loader: {
    marginTop: 24,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  pressed: {
    opacity: 0.8,
  },
});
