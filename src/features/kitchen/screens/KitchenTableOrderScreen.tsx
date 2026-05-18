import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { KitchenMessages } from '../../../constants/messages';
import { KITCHEN_STATUS_FILTERS } from '../../../constants/ui';
import { OrderCard } from '../components/OrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useKitchenSessions } from '../hooks/useKitchenSessions';
import type { ItemStatus } from '../../../types';

export default function KitchenTableOrderScreen() {
  const router = useRouter();
  const { sessionId, tableNumber } = useLocalSearchParams<{ sessionId: string; tableNumber?: string }>();
  const currentSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all');
  const [closing, setClosing] = useState(false);
  const { groupedOrders, loading, error, setItemStatus, sendItemMessage } = useKitchenOrders(filter, currentSessionId);
  const { closeOpenSession } = useKitchenSessions();
  const title = tableNumber ? `Table ${tableNumber}` : 'Table';

  function markUnavailable(itemId: string) {
    Alert.alert('Marquer indisponible', "Notifier le client que l'article n'est pas disponible ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: () => {
          void setItemStatus(itemId, 'unavailable', KitchenMessages.itemUnavailable);
        },
      },
    ]);
  }

  function confirmCloseSession() {
    Alert.alert('Fermer la session', `Fermer la session de la ${title.toLowerCase()} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Fermer',
        style: 'destructive',
        onPress: () => {
          void closeSessionAndReturn();
        },
      },
    ]);
  }

  async function closeSessionAndReturn() {
    if (!currentSessionId || closing) {
      return;
    }

    setClosing(true);
    try {
      await closeOpenSession(currentSessionId);
      router.replace('/(kitchen)/dashboard');
    } catch {
      Alert.alert('Erreur', 'Impossible de fermer cette session.');
    } finally {
      setClosing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>Retour</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.activeDot} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.closeSessionButton, pressed && styles.pressed]}
          onPress={confirmCloseSession}
          disabled={closing}
        >
          <Text style={styles.closeSessionText}>{closing ? 'Fermeture...' : 'Fermer'}</Text>
        </Pressable>
      </View>

      <View style={styles.pills}>
        {KITCHEN_STATUS_FILTERS.map((filterOption) => (
          <Pressable
            key={filterOption.label}
            style={({ pressed }) => [
              styles.pill,
              filter === filterOption.value && styles.pillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setFilter(filterOption.value)}
          >
            <Text style={[styles.pillText, filter === filterOption.value && styles.pillTextActive]}>
              {filterOption.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={groupedOrders}
        keyExtractor={(group) => `${group.sessionId}-${group.orderId}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {loading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        renderItem={({ item: group }) => (
          <OrderCard
            group={group}
            onUpdateStatus={(itemId, status) => {
              void setItemStatus(itemId, status);
            }}
            onMarkUnavailable={markUnavailable}
            onSendMessage={(itemId, message) => {
              void sendItemMessage(itemId, message);
            }}
          />
        )}
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>Aucune commande active</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kitchenBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  back: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusReady,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  closeSessionButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.statusUnavailable + '20',
  },
  closeSessionText: {
    color: Colors.statusUnavailable,
    fontSize: 12,
    fontWeight: '700',
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.kitchenCard,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: Colors.kitchenTextSecondary,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: Colors.statusUnavailable,
    textAlign: 'center',
    marginTop: 24,
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
