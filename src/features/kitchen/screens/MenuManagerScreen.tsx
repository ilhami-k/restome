import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { CATEGORY_LABELS, formatPrice } from '../../../constants/ui';
import { useKitchenMenuItems } from '../hooks/useKitchenMenuItems';

export default function MenuManagerScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { filteredItems, itemsByCategory, categoryOrder, toggleItemAvailability } = useKitchenMenuItems(search);

  async function handleToggleItem(item: (typeof filteredItems)[number]) {
    try {
      await toggleItemAvailability(item);
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la disponibilité.");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.headerLabel}>GESTION</Text>
          <Text style={styles.headerTitle}>Menu</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un article..."
          placeholderTextColor={Colors.kitchenTextSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {categoryOrder.map((category) => {
          const categoryItems = itemsByCategory[category];
          if (categoryItems.length === 0) {
            return null;
          }

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{CATEGORY_LABELS[category].toUpperCase()}</Text>
              {categoryItems.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Switch
                    value={item.available}
                    onValueChange={() => {
                      void handleToggleItem(item);
                    }}
                    trackColor={{ false: Colors.kitchenBorder, true: Colors.primary + '80' }}
                    thumbColor={item.available ? Colors.primary : Colors.kitchenTextSecondary}
                  />
                  <View style={styles.rowContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.available ? 'Visible dans le menu' : 'Masqué côté client'}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>
              ))}
            </View>
          );
        })}

        {filteredItems.length === 0 ? <Text style={styles.empty}>Aucun article trouvé</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kitchenBackground,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  back: {
    fontSize: 20,
    color: Colors.white,
  },
  headerLabel: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
  },
  list: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  rowContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  itemMeta: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  empty: {
    color: Colors.kitchenTextSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pressed: {
    opacity: 0.8,
  },
});
