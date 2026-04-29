import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Session, Table } from '../types';

interface SessionContextValue {
  session: Session | null;
  table: Table | null;
  setSessionData: (session: Session, table: Table) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  table: null,
  setSessionData: () => {},
  clearSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [table, setTable] = useState<Table | null>(null);

  const setSessionData = useCallback((s: Session, t: Table) => {
    setSession(s);
    setTable(t);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setTable(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, table, setSessionData, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
