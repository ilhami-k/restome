import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useSession } from '../../../contexts/SessionContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors, getCustomerColors } from '../../../constants/colors';
import { formatPrice } from '../../../constants/ui';
import { useSubmitOrder } from '../hooks/useSubmitOrder';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { items, removeItem, clearCart, total, itemCount } = useCart();
  const { session, table } = useSession();
  const { theme } = useTheme();
  const { submitOrder, submitting } = useSubmitOrder();
  const colors = getCustomerColors(theme);

  async function placeOrder() {
    if (!session) {
      Alert.alert('Aucune session', "Scannez d'abord le QR code de votre table.");
      return;
    }

    if (items.length === 0) {
      return;
    }

    try {
      await submitOrder(session, items);
      clearCart();
      router.push('/live-order');
    } catch {
      Alert.alert('Commande impossible', "Une erreur est survenue lors de l'envoi de votre commande.");
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour au menu</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>Votre commande</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Table {table?.number ?? ''} · {itemCount} article{itemCount > 1 ? 's' : ''}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.cart_item_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.thumb, { backgroundColor: colors.surface }]}>
              {item.menu_item.image_url ? (
                <Image source={{ uri: item.menu_item.image_url }} style={styles.thumbImage} />
              ) : null}
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.menu_item.name}</Text>
              {item.notes ? <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>“{item.notes}”</Text> : null}
              <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                Quantité: {item.quantity} · {formatPrice(item.menu_item.price)} l'unité
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.itemPrice, { color: colors.text }]}>{formatPrice(item.menu_item.price * item.quantity)}</Text>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => removeItem(item.cart_item_id)}
              >
                <Text style={styles.remove}>Retirer</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Sous-total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabelBold, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValueBold, { color: colors.text }]}>{formatPrice(total)}</Text>
            </View>

            <View style={[styles.banner, { backgroundColor: colors.banner }]}>
              <Text style={styles.bannerText}>
                Une fois envoyée, la commande ne peut plus être modifiée. La cuisine commencera la préparation immédiatement.
              </Text>
            </View>

            <View style={styles.bottomSpacer} />
          </>
        }
      />

      <Pressable
        style={({ pressed }) => [
          styles.placeButton,
          pressed && styles.pressed,
          (submitting || items.length === 0) && styles.disabled,
        ]}
        onPress={() => {
          void placeOrder();
        }}
        disabled={submitting || items.length === 0}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.placeButtonText}>Envoyer la commande · {formatPrice(total)}</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerBackground,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 4,
    marginBottom: 8,
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
    marginBottom: 16,
  },
  list: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.customerSurface,
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbImage: {
    width: 48,
    height: 48,
  },
  rowContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.customerText,
  },
  itemNotes: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: Colors.customerTextMuted,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.customerText,
  },
  remove: {
    fontSize: 12,
    color: Colors.statusUnavailable,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.customerBorder,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.customerTextSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: Colors.customerText,
  },
  totalLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.customerText,
  },
  totalValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.customerText,
  },
  banner: {
    backgroundColor: Colors.customerBanner,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  placeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 100,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
