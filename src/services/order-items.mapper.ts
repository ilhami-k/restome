import type { CartItem } from '../types';
import type { NewOrderItemInput } from './orders.service';

export function buildOrderItemInputs(orderId: string, items: CartItem[]): NewOrderItemInput[] {
  const orderItems: NewOrderItemInput[] = [];

  for (const item of items) {
    for (let index = 0; index < item.quantity; index += 1) {
      orderItems.push({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        notes: item.notes || null,
        status: 'pending',
      });
    }
  }

  return orderItems;
}
