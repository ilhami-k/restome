import { supabase } from '../lib/supabase';
import type { Session } from '../types';

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
    .channel('kitchen_sessions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
