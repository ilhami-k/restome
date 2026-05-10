import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getSuggestedMenuItemIds } from '../../../lib/db';
import type { MenuItem } from '../../../types';

export function useSuggestedMenuItems(items: MenuItem[]) {
  const db = useSQLiteContext();
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadSuggestions() {
      const ids = await getSuggestedMenuItemIds(db);
      const nextSuggestions = ids
        .map((id) => items.find((item) => item.id === id && item.available))
        .filter(Boolean) as MenuItem[];

      if (mounted) {
        setSuggestedItems(nextSuggestions);
      }
    }

    void loadSuggestions();

    return () => {
      mounted = false;
    };
  }, [db, items]);

  return suggestedItems;
}
