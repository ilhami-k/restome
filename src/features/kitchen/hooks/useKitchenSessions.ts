import { useCallback, useEffect, useState } from 'react';
import {
  closeSession,
  fetchOpenSessions,
  subscribeToSessions,
} from '../../../services/sessions.service';
import type { Session } from '../../../types';

export function useKitchenSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const refreshSessions = useCallback(async () => {
    setSessions(await fetchOpenSessions());
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSessions() {
      const nextSessions = await fetchOpenSessions();
      if (mounted) {
        setSessions(nextSessions);
      }
    }

    void loadSessions();
    const unsubscribe = subscribeToSessions(() => {
      void loadSessions();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function closeOpenSession(sessionId: string) {
    await closeSession(sessionId);
    await refreshSessions();
  }

  return { sessions, closeOpenSession, refreshSessions };
}
