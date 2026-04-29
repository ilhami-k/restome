import { supabase } from '../lib/supabase';
import { ACTIVE_ITEM_STATUSES } from '../types';
import type { ItemStatus, Order, OrderItem } from '../types';

export interface NewOrderItemInput {
  order_id: string;
  menu_item_id: string;
  notes: string | null;
  status: ItemStatus;
}

export async function findOpenOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'open')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Order | null;
}

export async function createOpenOrder(sessionId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ session_id: sessionId, status: 'open' })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create order');
  }

  return data as Order;
}

export async function insertOrderItems(items: NewOrderItemInput[]): Promise<void> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) {
    throw error;
  }
}

export async function fetchLiveOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, menu_item:menu_items(*)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderItem[];
}

export function subscribeToSessionOrderItems(sessionId: string, onChange: () => void) {
  const channel = supabase
    .channel(`order_items:${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export interface KitchenOrderItem extends OrderItem {
  order?: {
    session?: {
      table?: {
        number?: number;
      };
    };
  };
}

export async function fetchKitchenOrderItems(): Promise<KitchenOrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, menu_item:menu_items(*), order:orders(session:sessions(table:tables(number))))')
    .in('status', [...ACTIVE_ITEM_STATUSES])
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as KitchenOrderItem[];
}

export async function updateOrderItemStatus(itemId: string, status: ItemStatus): Promise<void> {
  const { error } = await supabase
    .from('order_items')
    .update({ status })
    .eq('id', itemId);

  if (error) {
    throw error;
  }
}

export async function createStatusUpdate(orderItemId: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('status_updates')
    .insert({ order_item_id: orderItemId, message });

  if (error) {
    throw error;
  }
}

export function subscribeToKitchenOrderItems(onChange: () => void) {
  const channel = supabase
    .channel('kitchen_order_items')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToStatusUpdates(
  orderItemIds: string[],
  onUpdate: (itemId: string, status: ItemStatus, message?: string) => void
) {
  const channel = supabase
    .channel('status_updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'status_updates',
        filter: `order_item_id=in.(${orderItemIds.join(',')})`,
      },
      (payload) => {
        const newRecord = payload.new as { order_item_id: string; message: string | null };
        onUpdate(newRecord.order_item_id, 'ready', newRecord.message ?? undefined);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
