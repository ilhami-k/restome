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
