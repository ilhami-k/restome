import { useEffect, useMemo, useState } from 'react';
import {
  createStatusUpdate,
  fetchKitchenOrderItems,
  subscribeToKitchenOrderItems,
  updateOrderItemStatus,
  type KitchenOrderItem,
} from '../../../services/orders.service';
import type { ItemStatus, KitchenStats } from '../../../types';

export interface GroupedKitchenOrder {
  tableNumber: number;
  createdAt: string;
  items: KitchenOrderItem[];
}

export function useKitchenOrders(filter: ItemStatus | 'all') {
  const [items, setItems] = useState<KitchenOrderItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      const nextItems = await fetchKitchenOrderItems();
      if (mounted) {
        setItems(nextItems);
      }
    }

    void loadOrders();
    const unsubscribe = subscribeToKitchenOrderItems(() => {
      void loadOrders();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const stats = useMemo<KitchenStats>(() => {
    return {
      pending: items.filter((item) => item.status === 'pending').length,
      preparing: items.filter((item) => item.status === 'preparing').length,
      ready: items.filter((item) => item.status === 'ready').length,
    };
  }, [items]);

  const groupedOrders = useMemo(() => {
    const grouped = items.reduce<Record<string, GroupedKitchenOrder>>((accumulator, item) => {
      const tableNumber = item.order?.session?.table?.number ?? 0;
      const key = `${tableNumber}-${item.order_id}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          tableNumber,
          createdAt: item.created_at,
          items: [],
        };
      }

      accumulator[key].items.push(item);
      return accumulator;
    }, {});

    return Object.values(grouped)
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

    const nextItems = await fetchKitchenOrderItems();
    setItems(nextItems);
  }

  return { stats, groupedOrders, setItemStatus };
}
