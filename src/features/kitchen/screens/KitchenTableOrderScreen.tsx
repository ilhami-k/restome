import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';
import { KITCHEN_STATUS_FILTERS } from '../../../constants/ui';
import { KitchenHeader } from '../components/KitchenHeader';
import { OrderCard } from '../components/OrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useKitchenSessions } from '../hooks/useKitchenSessions';
import { confirmMarkUnavailable } from '../utils/order-actions';
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

  function confirmCloseSession() {
    Alert.alert(Messages.kitchen.closeSessionTitle, Messages.kitchen.closeSessionQuestion(`la ${title.toLowerCase()}`), [
      { text: Messages.common.cancel, style: 'cancel' },
      {
        text: Messages.common.close,
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
      Alert.alert(Messages.common.error, Messages.kitchen.closeSessionError);
    } finally {
      setClosing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <KitchenHeader
        title={title}
        style={styles.header}
        leading={
          <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.back}>Retour</Text>
          </Pressable>
        }
        closeLabel={closing ? Messages.kitchen.closeSessionClosing : Messages.common.close}
        onClose={confirmCloseSession}
        closeDisabled={closing}
      />

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
            onMarkUnavailable={(itemId) => confirmMarkUnavailable(setItemStatus, itemId)}
            onSendMessage={(itemId, message) => {
              void sendItemMessage(itemId, message);
            }}
          />
        )}
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>{Messages.kitchen.noActiveOrders}</Text> : null}
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
