import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { formatPrice } from '../../../constants/ui';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLiveOrder } from '../hooks/useLiveOrder';
import { PostOrderTabBar } from '../components/PostOrderTabBar';

export default function BillScreen() {
  const { session, table } = useSession();
  const { theme } = useTheme();
  const { items } = useLiveOrder(session?.id);
  const colors = getCustomerColors(theme);

  const total = items.reduce(
    (sum, item) => sum + (item.menu_item?.price ?? 0),
    0
  );

  function requestBill() {
    Alert.alert(
      "L'addition",
      "Un serveur va vous apporter l'addition à table."
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar style={colors.statusBar} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>L'addition</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Table {table?.number ?? ''} · {items.length} article
          {items.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[styles.row, { borderBottomColor: colors.border }]}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.menu_item?.name ?? 'Article'}
              </Text>
              {item.notes ? (
                <Text
                  style={[styles.itemNotes, { color: colors.textSecondary }]}
                >
                  "{item.notes}"
                </Text>
              ) : null}
            </View>
            <Text style={[styles.itemPrice, { color: colors.text }]}>
              {formatPrice(item.menu_item?.price ?? 0)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Aucun article commandé pour le moment
          </Text>
        }
      />

      {items.length > 0 ? (
        <View
          style={[
            styles.totalBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {formatPrice(total)}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={requestBill}
        disabled={items.length === 0}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          items.length === 0 && styles.disabled,
        ]}
      >
        <Text style={styles.buttonText}>Demander l'addition</Text>
      </Pressable>

      <PostOrderTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
