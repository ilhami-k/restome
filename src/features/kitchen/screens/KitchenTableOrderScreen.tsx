import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';
import { KITCHEN_STATUS_FILTERS } from '../../../constants/ui';
import { KitchenHeader } from '../components/KitchenHeader';
import { KitchenBackButton } from '../components/KitchenBackButton';
import { KitchenListStatusHeader } from '../components/KitchenListStatusHeader';
import { OrderCard } from '../components/OrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useKitchenSessions } from '../hooks/useKitchenSessions';
import { useOrderItemActions } from '../hooks/useOrderItemActions';
import { confirmMarkUnavailable } from '../utils/order-actions';
import { kitchenScreenStyles } from '../styles/screenStyles';
import type { ItemStatus } from '../../../types';

export default function KitchenTableOrderScreen() {
  const router = useRouter();
  const { sessionId, tableNumber } = useLocalSearchParams<{ sessionId: string; tableNumber?: string }>();
  const currentSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all');
  const [closing, setClosing] = useState(false);
  const { groupedOrders, loading, error, setItemStatus, sendItemMessage } = useKitchenOrders(filter, currentSessionId);
  const { closeOpenSession } = useKitchenSessions();
  const { updateItemStatus, sendMessage } = useOrderItemActions({ setItemStatus, sendItemMessage });
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
    <SafeAreaView style={kitchenScreenStyles.container} edges={['top']}>
      <StatusBar style="light" />

      <KitchenHeader
        title={title}
        style={kitchenScreenStyles.header}
        leading={<KitchenBackButton label="Retour" onPress={() => router.back()} />}
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
        contentContainerStyle={kitchenScreenStyles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<KitchenListStatusHeader loading={loading} error={error} />}
        renderItem={({ item: group }) => (
          <OrderCard
            group={group}
            onUpdateStatus={(itemId, status) => {
              void updateItemStatus(itemId, status);
            }}
            onMarkUnavailable={(itemId) => confirmMarkUnavailable(updateItemStatus, itemId)}
            onSendMessage={sendMessage}
          />
        )}
        ListEmptyComponent={
          !loading && !error ? <Text style={kitchenScreenStyles.empty}>{Messages.kitchen.noActiveOrders}</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.8,
  },
});
