import { describe, expect, it } from 'vitest';
import { buildOrderItemInputs } from './order-items.mapper';
import type { CartItem } from '../types';

const menuItem = {
  id: 'menu-1',
  name: 'Burger',
  price: 12,
  category: 'main',
  available: true,
  image_url: null,
  created_at: '2026-04-30T00:00:00.000Z',
} as const;

describe('buildOrderItemInputs', () => {
  it('expands cart quantity into immutable order item rows', () => {
    const items: CartItem[] = [
      {
        cart_item_id: 'cart-1',
        menu_item_id: menuItem.id,
        menu_item: menuItem,
        quantity: 3,
        notes: 'sans oignons',
      },
    ];

    expect(buildOrderItemInputs('order-1', items)).toEqual([
      {
        order_id: 'order-1',
        menu_item_id: menuItem.id,
        notes: 'sans oignons',
        status: 'pending',
      },
      {
        order_id: 'order-1',
        menu_item_id: menuItem.id,
        notes: 'sans oignons',
        status: 'pending',
      },
      {
        order_id: 'order-1',
        menu_item_id: menuItem.id,
        notes: 'sans oignons',
        status: 'pending',
      },
    ]);
  });

  it('stores empty notes as null', () => {
    const items: CartItem[] = [
      {
        cart_item_id: 'cart-1',
        menu_item_id: menuItem.id,
        menu_item: menuItem,
        quantity: 1,
        notes: '',
      },
    ];

    expect(buildOrderItemInputs('order-1', items)[0].notes).toBeNull();
  });
});
