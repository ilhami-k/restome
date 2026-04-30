import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { CATEGORY_LABELS, formatPrice } from '../../../constants/ui';
import { useKitchenMenuItems } from '../hooks/useKitchenMenuItems';
import { CATEGORIES, type Category, type MenuItem } from '../../../types';

interface MenuFormState {
  id?: string;
  name: string;
  price: string;
  category: Category;
  imageUrl: string;
  allergenIds: string[];
}

const emptyForm: MenuFormState = {
  name: '',
  price: '',
  category: 'starter',
  imageUrl: '',
  allergenIds: [],
};

export default function MenuManagerScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [customAllergenName, setCustomAllergenName] = useState('');
  const [saving, setSaving] = useState(false);
  const {
    allergens,
    filteredItems,
    itemsByCategory,
    categoryOrder,
    toggleItemAvailability,
    saveMenuItem,
    addAllergen,
  } = useKitchenMenuItems(search);

  async function handleToggleItem(item: (typeof filteredItems)[number]) {
    try {
      await toggleItemAvailability(item);
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la disponibilité.");
    }
  }

  function editItem(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      price: String(item.price),
      category: item.category,
      imageUrl: item.image_url ?? '',
      allergenIds: item.allergens?.map((allergen) => allergen.id) ?? [],
    });
  }

  function toggleFormAllergen(allergenId: string) {
    setForm((current) => ({
      ...current,
      allergenIds: current.allergenIds.includes(allergenId)
        ? current.allergenIds.filter((id) => id !== allergenId)
        : [...current.allergenIds, allergenId],
    }));
  }

  async function handleSaveMenuItem() {
    const name = form.name.trim();
    const price = Number(form.price.replace(',', '.'));

    if (!name || Number.isNaN(price) || price < 0) {
      Alert.alert('Formulaire incomplet', 'Renseignez un nom et un prix valide.');
      return;
    }

    setSaving(true);
    try {
      await saveMenuItem(
        {
          name,
          price,
          category: form.category,
          image_url: form.imageUrl.trim() || null,
          allergenIds: form.allergenIds,
        },
        form.id
      );
      setForm(emptyForm);
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer cet article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAllergen() {
    const name = customAllergenName.trim();
    if (!name) {
      return;
    }

    try {
      const allergen = await addAllergen(name);
      setCustomAllergenName('');
      setForm((current) => ({ ...current, allergenIds: [...current.allergenIds, allergen.id] }));
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter cet allergène.");
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
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{form.id ? 'Modifier un article' : 'Ajouter un article'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor={Colors.kitchenTextSecondary}
            value={form.name}
            onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Prix"
            placeholderTextColor={Colors.kitchenTextSecondary}
            value={form.price}
            onChangeText={(price) => setForm((current) => ({ ...current, price }))}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="URL de l'image"
            placeholderTextColor={Colors.kitchenTextSecondary}
            value={form.imageUrl}
            onChangeText={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
            autoCapitalize="none"
          />

          <View style={styles.chips}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                style={({ pressed }) => [
                  styles.chip,
                  form.category === category && styles.chipSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => setForm((current) => ({ ...current, category }))}
              >
                <Text style={[styles.chipText, form.category === category && styles.chipTextSelected]}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.formLabel}>Allergènes</Text>
          <View style={styles.chips}>
            {allergens.map((allergen) => {
              const selected = form.allergenIds.includes(allergen.id);
              return (
                <Pressable
                  key={allergen.id}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggleFormAllergen(allergen.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{allergen.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inlineRow}>
            <TextInput
              style={[styles.input, styles.inlineInput]}
              placeholder="Nouvel allergène"
              placeholderTextColor={Colors.kitchenTextSecondary}
              value={customAllergenName}
              onChangeText={setCustomAllergenName}
            />
            <Pressable style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]} onPress={() => void handleAddAllergen()}>
              <Text style={styles.smallButtonText}>Ajouter</Text>
            </Pressable>
          </View>

          <View style={styles.formActions}>
            {form.id ? (
              <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => setForm(emptyForm)}>
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.disabled]}
              onPress={() => void handleSaveMenuItem()}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </Pressable>
          </View>
        </View>

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
                  <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.pressed]} onPress={() => editItem(item)}>
                    <Text style={styles.editButtonText}>Editer</Text>
                  </Pressable>
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
  formCard: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.kitchenBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.kitchenTextSecondary,
    fontSize: 12,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
  },
  smallButton: {
    backgroundColor: Colors.kitchenBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    marginBottom: 10,
  },
  smallButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
  },
  secondaryButtonText: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
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
    marginRight: 10,
  },
  editButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Colors.kitchenBackground,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: Colors.kitchenTextSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
