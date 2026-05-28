import { supabase } from './supabase';
import { randomId } from './ids';

export function createChannelName(name: string): string {
  return `${name}:${randomId()}`;
}

type PostgresChangeEvent = '*' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface PostgresChangeConfig {
  table: string;
  event?: PostgresChangeEvent;
  filter?: string;
}

/**
 * Subscribes to one or more `postgres_changes` streams on a single channel and
 * invokes `onChange` whenever any of them fire. Returns an unsubscribe function.
 */
export function subscribeToPostgresChanges(
  channelName: string,
  changes: PostgresChangeConfig[],
  onChange: () => void
): () => void {
  let channel = supabase.channel(channelName);

  for (const change of changes) {
    channel = channel.on(
      'postgres_changes',
      {
        event: change.event ?? '*',
        schema: 'public',
        table: change.table,
        ...(change.filter ? { filter: change.filter } : {}),
      },
      () => {
        onChange();
      }
    );
  }

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
