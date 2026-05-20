import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';
import { formatTime } from '../../../constants/ui';
import { KitchenHeader, kitchenHeaderStyles } from '../components/KitchenHeader';
import { OrderCard } from '../components/OrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useKitchenSessions } from '../hooks/useKitchenSessions';
import { subscribeToSessionJoins } from '../../../services/sessions.service';
import { confirmMarkUnavailable } from '../utils/order-actions';
import type { GroupedKitchenOrder } from '../hooks/useKitchenOrders';
import type { Session } from '../../../types';

type DashboardEntry =
  | { id: string; type: 'section'; title: string }
  | { id: string; type: 'session'; session: Session; itemCount: number }
  | { id: string; type: 'order'; group: GroupedKitchenOrder }
  | { id: string; type: 'empty'; text: string };

export default function KitchenDashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    stats,
    groupedOrders,
    loading: ordersLoading,
    error: ordersError,
    refreshOrders,
    setItemStatus,
    sendItemMessage,
  } = useKitchenOrders('all');
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    closeOpenSession,
    refreshSessions,
  } = useKitchenSessions();

  useFocusEffect(
    React.useCallback(() => {
      void refreshSessions();
      void refreshOrders();
    }, [refreshOrders, refreshSessions])
  );

  React.useEffect(() => {
    return subscribeToSessionJoins((notification) => {
      if (notification.type === 'opened') {
        Alert.alert(Messages.kitchen.tableOpenedTitle, Messages.kitchen.tableOpened(notification.tableNumber));
      }
      void refreshSessions();
    });
  }, [refreshSessions]);

  async function closeSessionAndRefresh(sessionId: string) {
    try {
      await closeOpenSession(sessionId);
      await refreshOrders();
    } catch {
      Alert.alert(Messages.common.error, Messages.kitchen.closeSessionError);
    }
  }

  function confirmCloseSession(sessionId: string, tableNumber?: number) {
    Alert.alert(
      Messages.kitchen.closeSessionTitle,
      Messages.kitchen.closeSessionQuestion(tableNumber ? `la table ${tableNumber}` : ''),
      [
        { text: Messages.common.cancel, style: 'cancel' },
        {
          text: Messages.common.close,
          style: 'destructive',
          onPress: () => {
            void closeSessionAndRefresh(sessionId);
          },
        },
      ]
    );
  }

  const entries: DashboardEntry[] = [
    { id: 'sessions-title', type: 'section', title: Messages.kitchen.activeTablesTitle },
    ...(sessions.length > 0
      ? sessions.map((session) => {
          const group = groupedOrders.find((entry) => entry.sessionId === session.id);
          return {
            id: `session-${session.id}`,
            type: 'session' as const,
            session,
            itemCount: group?.items.length ?? 0,
          };
        })
      : [{ id: 'sessions-empty', type: 'empty' as const, text: Messages.kitchen.noOpenSession }]),
    { id: 'orders-title', type: 'section', title: Messages.kitchen.liveQueueTitle },
    ...(groupedOrders.length > 0
      ? groupedOrders.map((group) => ({
          id: `order-${group.sessionId}-${group.orderId}`,
          type: 'order' as const,
          group,
        }))
      : [{ id: 'orders-empty', type: 'empty' as const, text: Messages.kitchen.noActiveOrders }]),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <KitchenHeader
              title={Messages.kitchen.ordersTitle}
              trailing={
                <Pressable
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => {
                    void logout().then(() => {
                      router.replace('/');
                    });
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.logout}>{Messages.kitchen.logout}</Text>
                </Pressable>
              }
            />

            <View style={styles.stats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>EN ATTENTE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.preparing}</Text>
                <Text style={styles.statLabel}>EN PRÉPARATION</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.ready}</Text>
                <Text style={styles.statLabel}>PRÊTES</Text>
              </View>
            </View>

            {ordersLoading || sessionsLoading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : null}
            {ordersError ? <Text style={kitchenHeaderStyles.errorText}>{ordersError}</Text> : null}
            {sessionsError ? <Text style={kitchenHeaderStyles.errorText}>{sessionsError}</Text> : null}
          </View>
        }
        renderItem={({ item: entry }) => {
          if (entry.type === 'section') {
            return <Text style={styles.sectionTitle}>{entry.title}</Text>;
          }

          if (entry.type === 'empty') {
            return <Text style={styles.emptyInline}>{entry.text}</Text>;
          }

          if (entry.type === 'order') {
            return (
              <OrderCard
                group={entry.group}
                onUpdateStatus={(itemId, status) => {
                  void setItemStatus(itemId, status);
                }}
                onMarkUnavailable={(itemId) => confirmMarkUnavailable(setItemStatus, itemId)}
                onSendMessage={(itemId, message) => {
                  void sendItemMessage(itemId, message);
                }}
              />
            );
          }

          const { session, itemCount } = entry;
          return (
              <Pressable
                style={({ pressed }) => [styles.sessionRow, pressed && styles.pressed]}
                onPress={() =>
                  router.push({
                    pathname: '/(kitchen)/tables/[sessionId]',
                    params: {
                      sessionId: session.id,
                      tableNumber: String(session.table?.number ?? ''),
                    },
                  })
                }
              >
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionTitleRow}>
                    <View style={styles.activeDot} />
                    <Text style={styles.sessionTitle}>Table {session.table?.number ?? '-'}</Text>
                  </View>
                  <Text style={styles.sessionMeta}>
                    {itemCount} article{itemCount > 1 ? 's' : ''} actif{itemCount > 1 ? 's' : ''} · ouverte à{' '}
                    {formatTime(session.created_at)}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.sessionCloseButton, pressed && styles.pressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmCloseSession(session.id, session.table?.number);
                  }}
                >
                  <Text style={styles.sessionCloseText}>{Messages.common.close}</Text>
                </Pressable>
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
    backgroundColor: Colors.kitchenBackground,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  logout: {
    fontSize: 13,
    color: Colors.kitchenTextSecondary,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.kitchenTextSecondary,
    marginTop: 2,
    letterSpacing: 0.7,
  },
  loader: {
    marginTop: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
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
  sessionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  sessionMeta: {
    color: Colors.kitchenTextSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sessionCloseButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.statusUnavailableSoft,
  },
  sessionCloseText: {
    color: Colors.statusUnavailable,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyInline: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
