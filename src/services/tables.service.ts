import { supabase } from '../lib/supabase';
import type { Table } from '../types';

export async function findTableByQrCode(qrCode: string): Promise<Table | null> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('qr_code', qrCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Table | null;
}
