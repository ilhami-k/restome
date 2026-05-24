import { useEffect, useState } from 'react';
import {
  fetchLiveOrderItems,
  fetchStatusUpdates,
  findOpenOrderBySessionId,
  subscribeToOrderBySessionId,
  subscribeToOrderItems,
  subscribeToStatusUpdates,
} from '../../../services/orders.service';
import type { Order, OrderItem, StatusUpdate } from '../../../types';

export function useLiveOrder(sessionId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [messagesByItemId, setMessagesByItemId] = useState<Record<string, string>>({});
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
    let subscribedOrderId: string | null = null;
    let unsubscribeOrderItems = () => {};
    let unsubscribeStatusUpdates = () => {};
    const unsubscribeOrder = subscribeToOrderBySessionId(currentSessionId, () => {
      void loadOrder();
    });

    function setMessagesFromUpdates(updates: StatusUpdate[]) {
      const nextMessages: Record<string, string> = {};
      for (const update of updates) {
        if (update.message) {
          nextMessages[update.order_item_id] = update.message;
        }
      }
      setMessagesByItemId(nextMessages);
    }

    async function loadOrder(): Promise<Order | null> {
      try {
        const nextOrder = await findOpenOrderBySessionId(currentSessionId);
        if (!mounted) {
          return null;
        }

        setOrder(nextOrder);

        if (nextOrder) {
          if (subscribedOrderId !== nextOrder.id) {
            unsubscribeOrderItems();
            subscribedOrderId = nextOrder.id;
            unsubscribeOrderItems = subscribeToOrderItems(nextOrder.id, () => {
              void loadOrder();
            });
          }

          const nextItems = await fetchLiveOrderItems(nextOrder.id);
          if (mounted) {
            setItems(nextItems);
            const itemIds = nextItems.map((item) => item.id);
            const updates = await fetchStatusUpdates(itemIds);
            if (mounted) {
              setMessagesFromUpdates(updates);
              unsubscribeStatusUpdates();
              unsubscribeStatusUpdates = subscribeToStatusUpdates(itemIds, (update) => {
                if (!update.message) {
                  return;
                }

                setMessagesByItemId((current) => ({
                  ...current,
                  [update.order_item_id]: update.message ?? '',
                }));
              });
            }
          }
        } else {
          unsubscribeOrderItems();
          subscribedOrderId = null;
          setItems([]);
          setMessagesByItemId({});
        }

        return nextOrder;
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      mounted = false;
      unsubscribeOrder();
      unsubscribeOrderItems();
      unsubscribeStatusUpdates();
    };
  }, [sessionId]);

  return { order, items, messagesByItemId, loading };
}
