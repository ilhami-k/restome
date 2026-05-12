import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { KitchenMessages } from '../../../constants/messages';
import { KitchenMenuForm } from '../components/KitchenMenuForm';
import { KitchenMenuHeader } from '../components/KitchenMenuHeader';
import { KitchenMenuList } from '../components/KitchenMenuList';
import { KitchenMenuSearch } from '../components/KitchenMenuSearch';
import { useKitchenMenuItems } from '../hooks/useKitchenMenuItems';
import { emptyMenuForm, parseMenuItemForm } from '../utils/menu-form';
import type { MenuFormState } from '../utils/menu-form';
import type { Category, MenuItem } from '../../../types';

export default function MenuManagerScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<MenuFormState>(emptyMenuForm);
  const [customAllergenName, setCustomAllergenName] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>(KitchenMessages.itemUnavailable);
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

  async function handleToggleItem(item: MenuItem) {
    try {
      const message = item.available ? availabilityMessage.trim() || KitchenMessages.itemUnavailable : null;
      await toggleItemAvailability(item, message);
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
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function updateForm(updates: Partial<MenuFormState>) {
    setForm((current) => ({ ...current, ...updates }));
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
    const result = parseMenuItemForm(form);

    if (!result.input) {
      Alert.alert('Formulaire incomplet', result.errorMessage ?? 'Renseignez un nom et un prix valide.');
      return;
    }

    setSaving(true);
    try {
      await saveMenuItem(result.input, form.id);
      setForm(emptyMenuForm);
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

      <KitchenMenuHeader onBack={() => router.back()} />

      <KitchenMenuSearch
        search={search}
        availabilityMessage={availabilityMessage}
        onChangeSearch={setSearch}
        onChangeAvailabilityMessage={setAvailabilityMessage}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <KitchenMenuForm
          form={form}
          allergens={allergens}
          customAllergenName={customAllergenName}
          saving={saving}
          onChangeName={(name) => updateForm({ name })}
          onChangePrice={(price) => updateForm({ price })}
          onChangeImageUrl={(imageUrl) => updateForm({ imageUrl })}
          onChangeCategory={(category: Category) => updateForm({ category })}
          onToggleAllergen={toggleFormAllergen}
          onChangeCustomAllergenName={setCustomAllergenName}
          onAddAllergen={() => {
            void handleAddAllergen();
          }}
          onCancel={() => setForm(emptyMenuForm)}
          onSave={() => {
            void handleSaveMenuItem();
          }}
        />

        <KitchenMenuList
          categoryOrder={categoryOrder}
          filteredItemCount={filteredItems.length}
          itemsByCategory={itemsByCategory}
          onToggleItem={(item) => {
            void handleToggleItem(item);
          }}
          onEditItem={editItem}
        />
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
  list: {
    paddingBottom: 24,
  },
});
