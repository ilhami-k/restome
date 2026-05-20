import { supabase } from '../lib/supabase';
import type { Session } from '../types';
import { closeOpenOrderBySessionId } from './orders.service';

const SESSION_JOINS_CHANNEL = 'session_joins';

export interface SessionJoinNotification {
  sessionId: string;
  tableNumber: number;
  joinedAt: string;
  type?: 'opened' | 'joined';
}

export async function findOpenSessionByTableId(tableId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('table_id', tableId)
    .eq('status', 'open')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Session | null;
}

export async function createOpenSession(tableId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ table_id: tableId, status: 'open' })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create session');
  }

  return data as Session;
}

export async function fetchOpenSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, table:tables(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Session[];
}

export async function closeSession(sessionId: string): Promise<void> {
  await closeOpenOrderBySessionId(sessionId);

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    throw error;
  }
}

export function subscribeToSessions(onChange: () => void) {
  const channel = supabase
    .channel(createChannelName('kitchen_sessions'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function notifySessionJoined(sessionId: string, tableNumber: number): Promise<void> {
  await notifySessionChanged(sessionId, tableNumber, 'joined');
}

export async function notifySessionOpened(sessionId: string, tableNumber: number): Promise<void> {
  await notifySessionChanged(sessionId, tableNumber, 'opened');
}

async function notifySessionChanged(
  sessionId: string,
  tableNumber: number,
  type: 'opened' | 'joined'
): Promise<void> {
  const channel = supabase.channel(SESSION_JOINS_CHANNEL);

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      void supabase.removeChannel(channel);
      resolve();
    }, 2000);

    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        return;
      }

      clearTimeout(timeout);
      void channel
        .send({
          type: 'broadcast',
          event: 'session_joined',
          payload: {
            sessionId,
            tableNumber,
            joinedAt: new Date().toISOString(),
            type,
          } satisfies SessionJoinNotification,
        })
        .finally(() => {
          void supabase.removeChannel(channel);
          resolve();
        });
    });
  });
}

export function subscribeToSessionJoins(onJoin: (notification: SessionJoinNotification) => void) {
  const channel = supabase
    .channel(SESSION_JOINS_CHANNEL)
    .on('broadcast', { event: 'session_joined' }, (payload) => {
      onJoin(payload.payload as SessionJoinNotification);
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function createChannelName(name: string): string {
  return `${name}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
