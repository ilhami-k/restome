import type { CartItem } from '../types';
import type { NewOrderItemInput } from './orders.service';

export function buildOrderItemInputs(orderId: string, items: CartItem[]): NewOrderItemInput[] {
  return items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      notes: item.notes || null,
      status: 'pending' as const,
    }))
  );
}
