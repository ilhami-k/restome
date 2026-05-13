import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors } from '../../../constants/colors';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import { useKitchenSessions } from '../hooks/useKitchenSessions';

export default function KitchenDashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { stats, groupedOrders, refreshOrders } = useKitchenOrders('all');
  const { sessions, closeOpenSession, refreshSessions } = useKitchenSessions();

  useFocusEffect(
    React.useCallback(() => {
      void refreshSessions();
      void refreshOrders();
    }, [refreshOrders, refreshSessions])
  );

  async function closeSessionAndRefresh(sessionId: string) {
    try {
      await closeOpenSession(sessionId);
      await refreshOrders();
    } catch {
      Alert.alert('Erreur', 'Impossible de fermer cette session.');
    }
  }

  function confirmCloseSession(sessionId: string, tableNumber?: number) {
    Alert.alert(
      'Fermer la session',
      `Fermer la session${tableNumber ? ` de la table ${tableNumber}` : ''} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fermer',
          style: 'destructive',
          onPress: () => {
            void closeSessionAndRefresh(sessionId);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Commandes</Text>
              <View style={styles.liveDot} />
            </View>
          </View>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => {
              void logout().then(() => {
                router.replace('/');
              });
            }}
            hitSlop={8}
          >
            <Text style={styles.logout}>Déconnexion</Text>
          </Pressable>
        </View>

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
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.sessionSection}>
          <Text style={styles.sectionTitle}>TABLES ACTIVES</Text>
          {sessions.map((session) => {
            const group = groupedOrders.find((entry) => entry.sessionId === session.id);
            const itemCount = group?.items.length ?? 0;

            return (
              <Pressable
                key={session.id}
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
                    {new Date(session.created_at).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.closeSessionButton, pressed && styles.pressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmCloseSession(session.id, session.table?.number);
                  }}
                >
                  <Text style={styles.closeSessionText}>Fermer</Text>
                </Pressable>
              </Pressable>
            );
          })}
          {sessions.length === 0 ? <Text style={styles.emptyInline}>Aucune session ouverte</Text> : null}
        </View>
      </ScrollView>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusReady,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sessionSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
    marginBottom: 8,
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
  closeSessionButton: {
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
  emptyInline: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
