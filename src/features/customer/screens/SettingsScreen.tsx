import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { useAllergenOptions } from '../hooks/useAllergenOptions';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { selectedAllergens, isLoading: isLoadingSettings, toggleAllergen, clearAllergens } = useUserSettings();
  const { allergens, isLoading, error } = useAllergenOptions();
  const colors = getCustomerColors(theme);

  const selectedIds = useMemo(
    () => new Set(selectedAllergens.map((allergen) => allergen.id)),
    [selectedAllergens]
  );
  const visibleAllergens = !isLoadingSettings && !isLoading && !error ? allergens : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Paramètres</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enregistrez vos allergènes sur cet appareil pour repérer plus vite les plats à risque.
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Apparence</Text>
        <View style={styles.themeRow}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            Mode {theme === 'dark' ? 'sombre' : 'clair'}
          </Text>
          <Pressable style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>Changer</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Mes allergies</Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>
          {selectedAllergens.length === 0
            ? 'Aucune allergie enregistrée'
            : `${selectedAllergens.length} allergie${selectedAllergens.length > 1 ? 's' : ''} sélectionnée${selectedAllergens.length > 1 ? 's' : ''}`}
        </Text>
        {selectedAllergens.length > 0 ? (
          <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={clearAllergens}>
            <Text style={styles.clearText}>Tout effacer</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={visibleAllergens}
        keyExtractor={(allergen) => allergen.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {isLoadingSettings || isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        renderItem={({ item: allergen }) => {
          const isSelected = selectedIds.has(allergen.id);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && styles.rowSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => toggleAllergen(allergen)}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{allergen.name}</Text>
                <Text style={[styles.rowText, { color: colors.textSecondary }]}>
                  {isSelected ? 'Pris en compte dans le menu' : 'Non sélectionné'}
                </Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 4,
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.customerText,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.customerTextSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: Colors.customerSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.customerTextSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  themeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  clearText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.statusUnavailable,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  loader: {
    marginTop: 32,
  },
  error: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.statusUnavailable,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.customerSurface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
  },
  rowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.customerBanner,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.customerText,
  },
  rowText: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    marginTop: 2,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.customerBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.customerBackground,
  },
  checkSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
