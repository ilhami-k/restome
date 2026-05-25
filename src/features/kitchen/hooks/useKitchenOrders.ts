import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createStatusUpdate,
  fetchKitchenOrderItems,
  subscribeToKitchenOrderItems,
  subscribeToOrderSubmissions,
  updateOrderItemStatus,
  type KitchenOrderItem,
} from '../../../services/orders.service';
import type { ItemStatus, KitchenStats } from '../../../types';

export interface GroupedKitchenOrder {
  sessionId: string;
  orderId: string;
  tableNumber: number;
  createdAt: string;
  items: KitchenOrderItem[];
}

export function useKitchenOrders(filter: ItemStatus | 'all', sessionId?: string) {
  const [items, setItems] = useState<KitchenOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchKitchenOrderItems(sessionId));
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setLoading(true);
      try {
        const nextItems = await fetchKitchenOrderItems(sessionId);
        if (mounted) {
          setItems(nextItems);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les commandes.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadOrders();
    const unsubscribePostgres = subscribeToKitchenOrderItems(() => {
      void loadOrders();
    });
    const unsubscribeSubmissions = subscribeToOrderSubmissions(() => {
      void loadOrders();
    });

    return () => {
      mounted = false;
      unsubscribePostgres();
      unsubscribeSubmissions();
    };
  }, [sessionId]);

  const stats = useMemo<KitchenStats>(() => {
    return {
      pending: items.filter((item) => item.status === 'pending').length,
      preparing: items.filter((item) => item.status === 'preparing').length,
      ready: items.filter((item) => item.status === 'ready').length,
    };
  }, [items]);

  const groupedOrders = useMemo(() => {
    const groupsByKey: Record<string, GroupedKitchenOrder> = {};

    for (const item of items) {
      const tableNumber = item.order?.session?.table?.number ?? 0;
      const itemSessionId = item.order?.session?.id ?? '';
      const orderId = item.order?.id ?? item.order_id;
      const key = `${itemSessionId}-${orderId}`;

      if (!groupsByKey[key]) {
        groupsByKey[key] = {
          sessionId: itemSessionId,
          orderId,
          tableNumber,
          createdAt: item.created_at,
          items: [],
        };
      }

      groupsByKey[key].items.push(item);
    }

    return Object.values(groupsByKey)
      .map((group) => ({
        ...group,
        items: filter === 'all' ? group.items : group.items.filter((item) => item.status === filter),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, items]);

  async function setItemStatus(itemId: string, status: ItemStatus, message?: string) {
    await updateOrderItemStatus(itemId, status);
    if (message) {
      await createStatusUpdate(itemId, message);
    }

    await refreshOrders();
  }

  async function sendItemMessage(itemId: string, message: string) {
    await createStatusUpdate(itemId, message);
  }

  return { stats, groupedOrders, loading, error, refreshOrders, setItemStatus, sendItemMessage };
}
