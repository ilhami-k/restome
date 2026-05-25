import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';
import { formatRelativeTime } from '../../../constants/ui';
import { KitchenHeader } from '../components/KitchenHeader';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { confirmMarkUnavailable } from '../utils/order-actions';
import type { ItemStatus } from '../../../types';
import type { KitchenOrderItem } from '../../../services/orders.service';

type QueueTab = 'pending' | 'preparing' | 'ready';

const TABS: { key: QueueTab; label: string }[] = [
  { key: 'pending', label: Messages.kitchen.liveQueueTabPending },
  { key: 'preparing', label: Messages.kitchen.liveQueueTabPreparing },
  { key: 'ready', label: Messages.kitchen.liveQueueTabReady },
];

const TAB_COLORS: Record<QueueTab, string> = {
  pending: Colors.statusPending,
  preparing: Colors.statusPreparing,
  ready: Colors.statusReady,
};

interface FlatTicket {
  item: KitchenOrderItem;
  tableNumber: number;
}

export default function KitchenQueueScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QueueTab>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});

  const { stats, groupedOrders, loading, error, setItemStatus, sendItemMessage } =
    useKitchenOrders('all');
  const didAutoSelectTab = useRef(false);

  useEffect(() => {
    if (didAutoSelectTab.current || loading) {
      return;
    }
    if (stats[activeTab] > 0) {
      didAutoSelectTab.current = true;
      return;
    }
    const firstPopulated = TABS.find((tab) => stats[tab.key] > 0);
    if (firstPopulated) {
      setActiveTab(firstPopulated.key);
    }
    didAutoSelectTab.current = true;
  }, [activeTab, loading, stats]);

  const tickets = useMemo<FlatTicket[]>(() => {
    const flat: FlatTicket[] = [];
    for (const group of groupedOrders) {
      for (const item of group.items) {
        flat.push({ item, tableNumber: group.tableNumber });
      }
    }
    return flat
      .filter((ticket) => ticket.item.status === activeTab)
      .sort(
        (a, b) =>
          new Date(a.item.created_at).getTime() - new Date(b.item.created_at).getTime()
      );
  }, [groupedOrders, activeTab]);

  async function updateItemStatus(itemId: string, status: ItemStatus, message?: string) {
    try {
      await setItemStatus(itemId, status, message);
    } catch {
      Alert.alert(Messages.common.error, Messages.kitchen.orderActionError);
    }
  }

  async function sendMessage(itemId: string) {
    const message = draftMessages[itemId]?.trim();
    if (!message) {
      return;
    }
    try {
      await sendItemMessage(itemId, message);
      setDraftMessages((current) => ({ ...current, [itemId]: '' }));
    } catch {
      Alert.alert(Messages.common.error, Messages.kitchen.orderActionError);
    }
  }

  function primaryActionFor(status: ItemStatus): { label: string; next: ItemStatus; color: string } | null {
    if (status === 'pending') {
      return { label: Messages.kitchen.startPreparation, next: 'preparing', color: Colors.statusPreparing };
    }
    if (status === 'preparing') {
      return { label: Messages.kitchen.markReady, next: 'ready', color: Colors.statusReady };
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <KitchenHeader
        title={Messages.kitchen.liveQueueTitle}
        style={styles.header}
        leading={
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <View style={styles.backButtonContent}>
              <Ionicons name="arrow-back" size={15} color={Colors.kitchenTextSecondary} />
              <Text style={styles.back}>{Messages.kitchen.liveQueueBack}</Text>
            </View>
          </Pressable>
        }
      />

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const count = stats[tab.key];
          return (
            <Pressable
              key={tab.key}
              style={({ pressed }) => [
                styles.tab,
                isActive && { backgroundColor: TAB_COLORS[tab.key] + '25', borderColor: TAB_COLORS[tab.key] },
                pressed && styles.pressed,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, isActive && { color: TAB_COLORS[tab.key] }]}>{tab.label}</Text>
              <Text style={[styles.tabCount, isActive && { color: TAB_COLORS[tab.key] }]}>{count}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(ticket) => ticket.item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {loading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.empty}>{Messages.kitchen.liveQueueEmpty}</Text>
          ) : null
        }
        renderItem={({ item: ticket }) => {
          const expanded = expandedId === ticket.item.id;
          const primary = primaryActionFor(ticket.item.status);
          const draft = draftMessages[ticket.item.id] ?? '';
          return (
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [styles.rowHeader, pressed && styles.pressed]}
                onPress={() => setExpandedId(expanded ? null : ticket.item.id)}
              >
                <View style={[styles.tableBadge, { backgroundColor: TAB_COLORS[activeTab] }]}>
                  <Text style={styles.tableBadgeText}>{ticket.tableNumber || '?'}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {ticket.item.menu_item?.name ?? 'Article'}
                  </Text>
                  {ticket.item.notes ? (
                    <Text style={styles.rowNotes} numberOfLines={1}>
                      “{ticket.item.notes}”
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.rowAge}>{formatRelativeTime(ticket.item.created_at)}</Text>
              </Pressable>

              {expanded ? (
                <View style={styles.expanded}>
                  <View style={styles.actions}>
                    {primary ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionBtn,
                          { backgroundColor: primary.color + '25' },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          void updateItemStatus(ticket.item.id, primary.next);
                        }}
                      >
                        <Text style={[styles.actionText, { color: primary.color }]}>{primary.label}</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: Colors.statusUnavailable + '25' },
                        pressed && styles.pressed,
                      ]}
                      onPress={() => confirmMarkUnavailable(updateItemStatus, ticket.item.id)}
                    >
                      <Text style={[styles.actionText, { color: Colors.statusUnavailable }]}>
                        {Messages.kitchen.markUnavailable}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.messageRow}>
                    <TextInput
                      style={styles.messageInput}
                      placeholder={Messages.kitchen.messagePlaceholder}
                      placeholderTextColor={Colors.kitchenTextSecondary}
                      value={draft}
                      onChangeText={(text) =>
                        setDraftMessages((current) => ({ ...current, [ticket.item.id]: text }))
                      }
                    />
                    <Pressable
                      style={({ pressed }) => [styles.messageButton, pressed && styles.pressed]}
                      onPress={() => {
                        void sendMessage(ticket.item.id);
                      }}
                    >
                      <Text style={styles.messageButtonText}>{Messages.kitchen.messageSend}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          );
        }}
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
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.kitchenCard,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: Colors.kitchenTextSecondary,
  },
  tabCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
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
    fontSize: 13,
  },
  row: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  tableBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  rowNotes: {
    color: Colors.kitchenTextSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  rowAge: {
    color: Colors.kitchenTextSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  expanded: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.kitchenBorder,
    paddingTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    color: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  messageButton: {
    backgroundColor: Colors.kitchenBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  messageButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
