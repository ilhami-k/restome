import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export async function getCurrentAuthSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Invalid Refresh Token') || message.includes('Refresh Token Not Found')) {
      await supabase.auth.signOut({ scope: 'local' });
      return null;
    }

    throw error;
  }
}

export function subscribeToAuthStateChange(onChange: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
}
