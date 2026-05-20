import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Colors } from '../../../constants/colors';
import { KitchenMessages, Messages } from '../../../constants/messages';
import { KitchenAvailabilityMessage } from '../components/KitchenAvailabilityMessage';
import { KitchenMenuForm } from '../components/KitchenMenuForm';
import { KitchenMenuHeader } from '../components/KitchenMenuHeader';
import { KitchenMenuList } from '../components/KitchenMenuList';
import type { KitchenMenuListEntry } from '../components/KitchenMenuList';
import { KitchenMenuSearch } from '../components/KitchenMenuSearch';
import { useKitchenMenuItems } from '../hooks/useKitchenMenuItems';
import { emptyMenuForm, menuItemFormSchema, parseMenuItemForm } from '../utils/menu-form';
import { uploadMenuItemImage } from '../../../services/menu.service';
import type { MenuFormState } from '../utils/menu-form';
import type { Category, MenuItem } from '../../../types';

export default function MenuManagerScreen() {
  const listRef = useRef<FlatList<KitchenMenuListEntry>>(null);
  const [search, setSearch] = useState('');
  const [customAllergenName, setCustomAllergenName] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>(KitchenMessages.itemUnavailable);
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<MenuFormState>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: emptyMenuForm,
    mode: 'onBlur',
  });
  const form = watch();
  const {
    allergens,
    filteredItems,
    itemsByCategory,
    categoryOrder,
    loading,
    error,
    toggleItemAvailability,
    saveMenuItem,
    addAllergen,
  } = useKitchenMenuItems(search);

  async function handleToggleItem(item: MenuItem) {
    try {
      const message = item.available ? availabilityMessage.trim() || KitchenMessages.itemUnavailable : null;
      await toggleItemAvailability(item, message);
    } catch {
      Alert.alert(Messages.common.error, KitchenMessages.availabilityUpdateError);
    }
  }

  function editItem(item: MenuItem) {
    reset({
      id: item.id,
      name: item.name,
      price: String(item.price),
      category: item.category,
      imageUrl: item.image_url ?? '',
      allergenIds: item.allergens?.map((allergen) => allergen.id) ?? [],
    });
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function toggleFormAllergen(allergenId: string) {
    const allergenIds = getValues('allergenIds');
    const nextIds = allergenIds.includes(allergenId)
      ? allergenIds.filter((id) => id !== allergenId)
      : [...allergenIds, allergenId];

    setValue('allergenIds', nextIds, { shouldDirty: true, shouldValidate: true });
  }

  async function handleSaveMenuItem(formData: MenuFormState) {
    const currentId = formData.id;
    const result = parseMenuItemForm(formData);

    if (!result.input) {
      Alert.alert(KitchenMessages.incompleteFormTitle, result.errorMessage ?? KitchenMessages.incompleteFormMessage);
      return;
    }

    setSaving(true);
    try {
      await saveMenuItem(result.input, currentId);
      reset(emptyMenuForm);
    } catch {
      Alert.alert(Messages.common.error, KitchenMessages.saveMenuItemError);
    } finally {
      setSaving(false);
    }
  }

  const submitMenuItem = handleSubmit(
    (formData) => {
      void handleSaveMenuItem(formData);
    },
    () => {
      Alert.alert(KitchenMessages.incompleteFormTitle, KitchenMessages.incompleteFormMessage);
    }
  );

  async function handleAddAllergen() {
    const name = customAllergenName.trim();
    if (!name) {
      return;
    }

    try {
      const allergen = await addAllergen(name);
      setCustomAllergenName('');
      setValue('allergenIds', [...getValues('allergenIds'), allergen.id], {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch {
      Alert.alert(Messages.common.error, KitchenMessages.addAllergenError);
    }
  }

  async function handlePickMenuImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(KitchenMessages.photoPermissionTitle, KitchenMessages.photoPermissionMessage);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const image = result.assets[0];
    if (!image?.base64) {
      Alert.alert(Messages.common.error, KitchenMessages.readImageError);
      return;
    }

    setImageUploading(true);
    try {
      const imageUrl = await uploadMenuItemImage({
        base64: image.base64,
        fileName: image.fileName,
        mimeType: image.mimeType,
      });
      setValue('imageUrl', imageUrl, { shouldDirty: true, shouldValidate: true });
    } catch {
      Alert.alert(Messages.common.error, KitchenMessages.uploadImageError);
    } finally {
      setImageUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <KitchenMenuHeader />

      <KitchenMenuSearch
        search={search}
        onChangeSearch={setSearch}
      />

      <KitchenMenuList
        listRef={listRef}
        categoryOrder={categoryOrder}
        filteredItemCount={loading || error ? -1 : filteredItems.length}
        itemsByCategory={itemsByCategory}
        ListHeaderComponent={
          <>
            <KitchenAvailabilityMessage value={availabilityMessage} onChange={setAvailabilityMessage} />

            <KitchenMenuForm
              form={form}
              control={control}
              errors={errors}
              allergens={allergens}
              customAllergenName={customAllergenName}
              imageUploading={imageUploading}
              saving={saving}
              onChangeCategory={(category: Category) =>
                setValue('category', category, { shouldDirty: true, shouldValidate: true })
              }
              onToggleAllergen={toggleFormAllergen}
              onChangeCustomAllergenName={setCustomAllergenName}
              onAddAllergen={() => {
                void handleAddAllergen();
              }}
              onPickImage={() => {
                void handlePickMenuImage();
              }}
              onRemoveImage={() => setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true })}
              onCancel={() => reset(emptyMenuForm)}
              onSave={() => {
                void submitMenuItem();
              }}
            />

            {loading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        onToggleItem={(item) => {
          void handleToggleItem(item);
        }}
        onEditItem={editItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kitchenBackground,
    paddingHorizontal: 16,
  },
  loader: {
    marginVertical: 18,
  },
  errorText: {
    color: Colors.statusUnavailable,
    textAlign: 'center',
    marginVertical: 18,
  },
});
