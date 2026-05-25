import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addOrderHistory } from '../../../lib/db';
import { buildOrderItemInputs } from '../../../services/order-items.mapper';
import {
  getOrCreateOpenOrder,
  insertOrderItems,
  notifyOrderSubmitted,
} from '../../../services/orders.service';
import type { CartItem, Session } from '../../../types';

export function useSubmitOrder() {
  const db = useSQLiteContext();
  const [submitting, setSubmitting] = useState(false);

  async function submitOrder(session: Session, items: CartItem[]): Promise<void> {
    setSubmitting(true);

    try {
      const order = await getOrCreateOpenOrder(session.id);
      await insertOrderItems(buildOrderItemInputs(order.id, items));
      await notifyOrderSubmitted(session.id);

      try {
        for (const item of items) {
          for (let index = 0; index < item.quantity; index += 1) {
            await addOrderHistory(db, item.menu_item_id, item.menu_item.name);
          }
        }
      } catch {
        // Local suggestions are best-effort; the Supabase order has already been accepted.
      }
    } finally {
      setSubmitting(false);
    }
  }

  return { submitOrder, submitting };
}
