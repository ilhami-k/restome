import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors } from '../../../constants/colors';
import { KitchenMessages } from '../../../constants/messages';
import { KITCHEN_STATUS_FILTERS } from '../../../constants/ui';
import { OrderCard } from '../components/OrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import type { ItemStatus } from '../../../types';

export default function KitchenDashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [filter, setFilter] = useState<ItemStatus | 'all'>('all');
  const { stats, groupedOrders, setItemStatus } = useKitchenOrders(filter);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>CUISINE</Text>
            <Text style={styles.headerTitle}>Commandes en direct</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN DIRECT</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              onPress={() => router.push('/(kitchen)/menu-manager')}
            >
              <Text style={styles.menuButtonText}>Menu</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => {
                void logout();
              }}
            >
              <Text style={styles.logout}>Déconnexion</Text>
            </Pressable>
          </View>
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
              <Text
                style={[
                  styles.pillText,
                  filter === filterOption.value && styles.pillTextActive,
                ]}
              >
                {filterOption.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {groupedOrders.map((group) => (
          <OrderCard
            key={`${group.tableNumber}-${group.createdAt}`}
            group={group}
            onUpdateStatus={(itemId, status) => {
              void setItemStatus(itemId, status);
            }}
            onMarkUnavailable={markUnavailable}
          />
        ))}

        {groupedOrders.length === 0 ? <Text style={styles.empty}>Aucune commande</Text> : null}
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
    alignItems: 'flex-start',
  },
  headerLabel: {
    fontSize: 11,
    color: Colors.kitchenTextSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusReady + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.statusReady,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.statusReady,
  },
  menuButton: {
    backgroundColor: Colors.kitchenCard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  menuButtonText: {
    fontSize: 12,
    color: Colors.white,
  },
  logout: {
    fontSize: 12,
    color: Colors.kitchenTextSecondary,
  },
  stats: {
    flexDirection: 'row',
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
  pills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
  empty: {
    color: Colors.kitchenTextSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pressed: {
    opacity: 0.8,
  },
});
