import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCart } from '../../../contexts/CartContext';
import { useSession } from '../../../contexts/SessionContext';
import { Colors } from '../../../constants/colors';
import { formatPrice } from '../../../constants/ui';
import { useSubmitOrder } from '../hooks/useSubmitOrder';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { items, removeItem, clearCart, total, itemCount } = useCart();
  const { session, table } = useSession();
  const { submitOrder, submitting } = useSubmitOrder();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour au menu</Text>
      </Pressable>

      <Text style={styles.title}>Votre commande</Text>
      <Text style={styles.subtitle}>
        Table {table?.number ?? ''} · {itemCount} article{itemCount > 1 ? 's' : ''}
      </Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.cart_item_id} style={styles.row}>
            <View style={styles.thumb}>
              {item.menu_item.image_url ? (
                <Image source={{ uri: item.menu_item.image_url }} style={styles.thumbImage} />
              ) : null}
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.itemName}>{item.menu_item.name}</Text>
              {item.notes ? <Text style={styles.itemNotes}>“{item.notes}”</Text> : null}
              <Text style={styles.itemMeta}>
                Quantité: {item.quantity} · {formatPrice(item.menu_item.price)} l'unité
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.itemPrice}>{formatPrice(item.menu_item.price * item.quantity)}</Text>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => removeItem(item.cart_item_id)}
              >
                <Text style={styles.remove}>Retirer</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sous-total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabelBold}>Total</Text>
          <Text style={styles.totalValueBold}>{formatPrice(total)}</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Une fois envoyée, la commande ne peut plus être modifiée. La cuisine commencera la préparation immédiatement.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

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
