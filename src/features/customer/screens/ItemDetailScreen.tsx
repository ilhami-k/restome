import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { formatPrice, getMatchingAllergens } from '../../../constants/ui';
import { useMenuItems } from '../hooks/useMenuItems';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { itemId: itemIdParam } = useLocalSearchParams<{ itemId?: string | string[] }>();
  const { width } = useWindowDimensions();
  const { addItem } = useCart();
  const { theme } = useTheme();
  const { items } = useMenuItems();
  const { selectedAllergens } = useUserSettings();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const colors = getCustomerColors(theme);

  const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;
  const item = items.find((menuItem) => menuItem.id === itemId);
  const imageHeight = useMemo(() => Math.min(Math.max(width * 0.72, 240), 360), [width]);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.missingState}>
          <Text style={[styles.title, { color: colors.text }]}>Plat introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = item.price * quantity;
  const matchingAllergens = getMatchingAllergens(item.allergens, selectedAllergens);
  const unavailableMessage = item.availability_message || "Ce plat n'est pas disponible pour le moment.";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageBox, { height: imageHeight }]}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={[styles.image, { height: imageHeight }]} />
          ) : (
            <View style={[styles.imagePlaceholder, { height: imageHeight, backgroundColor: colors.surface }]} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.allergens && item.allergens.length > 0
              ? item.allergens.map((allergen) => allergen.name).join(', ')
              : 'Aucun allergène renseigné'}
          </Text>

          {matchingAllergens.length > 0 ? (
            <View style={[styles.warningCard, { backgroundColor: colors.unavailableBackground }]}>
              <Text style={styles.warningTitle}>Attention allergènes</Text>
              <Text style={styles.warningText}>
                Ce plat contient: {matchingAllergens.map((allergen) => allergen.name).join(', ')}.
              </Text>
            </View>
          ) : null}

          {!item.available ? (
            <View style={[styles.warningCard, { backgroundColor: colors.unavailableBackground }]}>
              <Text style={styles.warningTitle}>Indisponible</Text>
              <Text style={styles.warningText}>{unavailableMessage}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.textMuted }]}>QUANTITE</Text>
          <View style={styles.stepper}>
            <Pressable
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>-</Text>
            </Pressable>
            <Text style={[styles.stepperValue, { color: colors.text }]}>{quantity}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => setQuantity((current) => current + 1)}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>+</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>INSTRUCTIONS</Text>
          <TextInput
            style={[
              styles.notesInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Ex. sans oignons, attention à une cuisson particulière..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed, !item.available && styles.disabled]}
        onPress={() => {
          if (!item.available) {
            return;
          }

          addItem(item, quantity, notes);
          router.back();
        }}
        disabled={!item.available}
      >
        <Text style={styles.addButtonText}>
          {item.available ? `Ajouter à la commande - ${formatPrice(totalPrice)}` : 'Indisponible'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  imageBox: {
    width: '100%',
    backgroundColor: Colors.customerSurface,
  },
  image: {
    width: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: Colors.customerBorder,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.customerText,
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.customerTextSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: Colors.unavailableBackground,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.statusUnavailable,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: Colors.customerText,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.customerTextSecondary,
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.customerSurface,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 18,
    color: Colors.customerText,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.customerText,
    minWidth: 24,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: Colors.customerSurface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.customerText,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 100,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: Colors.customerText,
    textAlign: 'center',
    marginTop: 40,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
