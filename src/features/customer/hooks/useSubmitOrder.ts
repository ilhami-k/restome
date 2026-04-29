import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addOrderHistory } from '../../../lib/db';
import { createOpenOrder, findOpenOrderBySessionId, insertOrderItems } from '../../../services/orders.service';
import type { CartItem, Session } from '../../../types';

export function useSubmitOrder() {
  const db = useSQLiteContext();
  const [submitting, setSubmitting] = useState(false);

  async function submitOrder(session: Session, items: CartItem[]): Promise<void> {
    setSubmitting(true);

    try {
      const existingOrder = await findOpenOrderBySessionId(session.id);
      const order = existingOrder ?? (await createOpenOrder(session.id));

      await insertOrderItems(
        items.map((item) => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          notes: item.notes || null,
          status: 'pending',
        }))
      );

      for (const item of items) {
        await addOrderHistory(db, item.menu_item_id, item.menu_item.name);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return { submitOrder, submitting };
}
