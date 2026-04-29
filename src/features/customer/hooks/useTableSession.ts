import { useState } from 'react';
import { createOpenSession, findOpenSessionByTableId } from '../../../services/sessions.service';
import { findTableByQrCode } from '../../../services/tables.service';
import type { Session, Table } from '../../../types';

interface TableSessionResult {
  table: Table;
  session: Session;
  joinedExisting: boolean;
}

export function useTableSession() {
  const [loading, setLoading] = useState(false);

  async function resolveSession(qrCode: string): Promise<TableSessionResult> {
    setLoading(true);
    try {
      const trimmedCode = qrCode.trim();
      const table = await findTableByQrCode(trimmedCode);

      if (!table) {
        throw new Error('TABLE_NOT_FOUND');
      }

      const existingSession = await findOpenSessionByTableId(table.id);
      if (existingSession) {
        return { table, session: existingSession, joinedExisting: true };
      }

      const session = await createOpenSession(table.id);
      return { table, session, joinedExisting: false };
    } finally {
      setLoading(false);
    }
  }

  return { loading, resolveSession };
}
