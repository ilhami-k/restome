import { supabase } from '../lib/supabase';
import { createChannelName, subscribeToPostgresChanges } from '../lib/realtime';
import { ACTIVE_ITEM_STATUSES } from '../types';
import type { ItemStatus, Order, OrderItem, StatusUpdate } from '../types';

const KITCHEN_ORDERS_CHANNEL = 'kitchen_orders';

export interface OrderSubmittedNotification {
  sessionId: string;
  submittedAt: string;
}

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

  if (error && isUniqueViolation(error)) {
    const existingOrder = await findOpenOrderBySessionId(sessionId);
    if (existingOrder) {
      return existingOrder;
    }
  }

  if (error || !data) {
    throw error ?? new Error('Failed to create order');
  }

  return data as Order;
}

export async function getOrCreateOpenOrder(sessionId: string): Promise<Order> {
  const existingOrder = await findOpenOrderBySessionId(sessionId);
  return existingOrder ?? createOpenOrder(sessionId);
}

export async function insertOrderItems(items: NewOrderItemInput[]): Promise<void> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) {
    throw error;
  }
}

export function notifyOrderSubmitted(sessionId: string): Promise<void> {
  const channel = supabase.channel(KITCHEN_ORDERS_CHANNEL, {
    config: {
      broadcast: { ack: true },
    },
  });
  const payload: OrderSubmittedNotification = {
    sessionId,
    submittedAt: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      void supabase.removeChannel(channel);
      resolve();
    }, 5000);

    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        return;
      }

      clearTimeout(timeout);
      void channel
        .send({ type: 'broadcast', event: 'order_submitted', payload })
        .finally(() => {
          void supabase.removeChannel(channel);
          resolve();
        });
    });
  });
}

export function subscribeToOrderSubmissions(
  onSubmit: (notification: OrderSubmittedNotification) => void
) {
  const channel = supabase
    .channel(KITCHEN_ORDERS_CHANNEL)
    .on('broadcast', { event: 'order_submitted' }, (payload) => {
      onSubmit(payload.payload as OrderSubmittedNotification);
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
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

export function subscribeToOrderItems(orderId: string, onChange: () => void) {
  return subscribeToPostgresChanges(
    createChannelName(`order_items:${orderId}`),
    [{ table: 'order_items', filter: `order_id=eq.${orderId}` }],
    onChange
  );
}

export function subscribeToOrderBySessionId(sessionId: string, onChange: () => void) {
  return subscribeToPostgresChanges(
    createChannelName(`orders:${sessionId}`),
    [{ table: 'orders', filter: `session_id=eq.${sessionId}` }],
    onChange
  );
}

export interface KitchenOrderItem extends OrderItem {
  order?: {
    id?: string;
    status?: string;
    session?: {
      id?: string;
      status?: string;
      table?: {
        number?: number;
      };
    };
  };
}

export async function fetchKitchenOrderItems(sessionId?: string): Promise<KitchenOrderItem[]> {
  let query = supabase
    .from('order_items')
    .select('*, menu_item:menu_items(*), order:orders!inner(id, status, session:sessions!inner(id, status, table:tables(number)))')
    .in('status', [...ACTIVE_ITEM_STATUSES])
    .eq('order.status', 'open')
    .eq('order.session.status', 'open')
    .order('created_at', { ascending: true });

  if (sessionId) {
    query = query.eq('order.session_id', sessionId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as KitchenOrderItem[];
}

export async function closeOpenOrderBySessionId(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'closed' })
    .eq('session_id', sessionId)
    .eq('status', 'open');

  if (error) {
    throw error;
  }
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

export async function fetchStatusUpdates(orderItemIds: string[]): Promise<StatusUpdate[]> {
  if (orderItemIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('status_updates')
    .select('*')
    .in('order_item_id', orderItemIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as StatusUpdate[];
}

export function subscribeToKitchenOrderItems(onChange: () => void) {
  return subscribeToPostgresChanges(
    createChannelName('kitchen_order_items'),
    [{ table: 'order_items' }, { table: 'orders' }, { table: 'sessions' }],
    onChange
  );
}

export function subscribeToStatusUpdates(
  orderItemIds: string[],
  onUpdate: (update: StatusUpdate) => void
) {
  if (orderItemIds.length === 0) {
    return () => {};
  }

  const channel = supabase
    .channel(createChannelName(`status_updates:${orderItemIds.join(':')}`))
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'status_updates',
        filter: `order_item_id=in.(${orderItemIds.join(',')})`,
      },
      (payload) => {
        onUpdate(payload.new as StatusUpdate);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function isUniqueViolation(error: { code?: string }): boolean {
  return error.code === '23505';
}
