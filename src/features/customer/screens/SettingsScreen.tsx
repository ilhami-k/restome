import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { Colors } from '../../../constants/colors';
import { useAllergenOptions } from '../hooks/useAllergenOptions';

export default function SettingsScreen() {
  const router = useRouter();
  const { selectedAllergens, isLoading: isLoadingSettings, toggleAllergen, clearAllergens } = useUserSettings();
  const { allergens, isLoading, error } = useAllergenOptions();

  const selectedIds = useMemo(
    () => new Set(selectedAllergens.map((allergen) => allergen.id)),
    [selectedAllergens]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>
          Enregistrez vos allergènes sur cet appareil pour repérer plus vite les plats à risque.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Mes allergies</Text>
        <Text style={styles.summaryValue}>
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

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoadingSettings || isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLoadingSettings && !isLoading && !error
          ? allergens.map((allergen) => {
              const isSelected = selectedIds.has(allergen.id);

              return (
                <Pressable
                  key={allergen.id}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && styles.rowSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggleAllergen(allergen)}
                >
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle}>{allergen.name}</Text>
                    <Text style={styles.rowText}>
                      {isSelected ? 'Pris en compte dans le menu' : 'Non sélectionné'}
                    </Text>
                  </View>
                  <View style={[styles.check, isSelected && styles.checkSelected]}>
                    {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
                  </View>
                </Pressable>
              );
            })
          : null}
      </ScrollView>
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
    color: Colors.customerText,
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
