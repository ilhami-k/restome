import { useCallback, useEffect, useState } from 'react';
import {
  closeSession,
  fetchOpenSessions,
  subscribeToSessions,
} from '../../../services/sessions.service';
import type { Session } from '../../../types';

export function useKitchenSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await fetchOpenSessions());
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSessions() {
      setLoading(true);
      try {
        const nextSessions = await fetchOpenSessions();
        if (mounted) {
          setSessions(nextSessions);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les sessions.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

  return { sessions, loading, error, closeOpenSession, refreshSessions };
}
