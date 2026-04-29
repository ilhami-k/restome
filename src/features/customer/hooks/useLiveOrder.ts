import { useEffect, useState } from 'react';
import {
  fetchLiveOrderItems,
  findOpenOrderBySessionId,
  subscribeToSessionOrderItems,
} from '../../../services/orders.service';
import type { Order, OrderItem } from '../../../types';

export function useLiveOrder(sessionId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setOrder(null);
      setItems([]);
      setLoading(false);
      return;
    }

    const currentSessionId = sessionId;
    let mounted = true;

    async function loadOrder() {
      try {
        const nextOrder = await findOpenOrderBySessionId(currentSessionId);
        if (!mounted) {
          return;
        }

        setOrder(nextOrder);

        if (nextOrder) {
          const nextItems = await fetchLiveOrderItems(nextOrder.id);
          if (mounted) {
            setItems(nextItems);
          }
        } else {
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadOrder();
    const unsubscribe = subscribeToSessionOrderItems(currentSessionId, () => {
      void loadOrder();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [sessionId]);

  return { order, items, loading };
}
