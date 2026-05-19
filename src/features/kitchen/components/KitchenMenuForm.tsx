import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { Colors } from '../../../constants/colors';
import { CATEGORY_LABELS } from '../../../constants/ui';
import { CATEGORIES } from '../../../types';
import type { Allergen, Category } from '../../../types';
import type { Control, FieldErrors } from 'react-hook-form';
import type { MenuFormState } from '../utils/menu-form';

interface KitchenMenuFormProps {
  form: MenuFormState;
  control: Control<MenuFormState>;
  errors: FieldErrors<MenuFormState>;
  allergens: Allergen[];
  customAllergenName: string;
  imageUploading: boolean;
  saving: boolean;
  onChangeCategory: (category: Category) => void;
  onToggleAllergen: (allergenId: string) => void;
  onChangeCustomAllergenName: (name: string) => void;
  onAddAllergen: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function KitchenMenuForm({
  form,
  control,
  errors,
  allergens,
  customAllergenName,
  imageUploading,
  saving,
  onChangeCategory,
  onToggleAllergen,
  onChangeCustomAllergenName,
  onAddAllergen,
  onPickImage,
  onRemoveImage,
  onCancel,
  onSave,
}: KitchenMenuFormProps) {
  const imageButtonText = form.imageUrl ? "Changer l'image" : 'Choisir une image';

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{form.id ? 'Modifier un article' : 'Ajouter un article'}</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Nom"
            placeholderTextColor={Colors.kitchenTextSecondary}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}

      <Controller
        control={control}
        name="price"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            placeholder="Prix"
            placeholderTextColor={Colors.kitchenTextSecondary}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="decimal-pad"
          />
        )}
      />
      {errors.price ? <Text style={styles.errorText}>{errors.price.message}</Text> : null}

      <Controller
        control={control}
        name="imageUrl"
        render={({ field: { value } }) => (
          <View style={styles.imageField}>
            {value ? <Image source={{ uri: value }} style={styles.imagePreview} /> : null}
            <View style={styles.imageActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.smallButton,
                  styles.imageButton,
                  pressed && styles.pressed,
                  (saving || imageUploading) && styles.disabled,
                ]}
                onPress={onPickImage}
                disabled={saving || imageUploading}
              >
                <Text style={styles.smallButtonText}>
                  {imageUploading ? 'Envoi...' : imageButtonText}
                </Text>
              </Pressable>
              {value ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondarySmallButton,
                    pressed && styles.pressed,
                    (saving || imageUploading) && styles.disabled,
                  ]}
                  onPress={onRemoveImage}
                  disabled={saving || imageUploading}
                >
                  <Text style={styles.secondaryButtonText}>Retirer</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
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
            onPress={() => onChangeCategory(category)}
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
              onPress={() => onToggleAllergen(allergen.id)}
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
          onChangeText={onChangeCustomAllergenName}
        />
        <Pressable style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]} onPress={onAddAllergen}>
          <Text style={styles.smallButtonText}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.formActions}>
        {form.id ? (
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Annuler</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            (saving || imageUploading) && styles.disabled,
          ]}
          onPress={onSave}
          disabled={saving || imageUploading}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputError: {
    borderColor: Colors.statusUnavailable,
  },
  errorText: {
    color: Colors.statusUnavailable,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 8,
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
  imageField: {
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: Colors.kitchenBackground,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
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
  secondarySmallButton: {
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
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
