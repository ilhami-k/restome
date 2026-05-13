import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { containsSelectedAllergen } from '../../../constants/ui';
import { getSuggestedMenuItemIds } from '../../../lib/db';
import type { Allergen, MenuItem } from '../../../types';

export function useSuggestedMenuItems(items: MenuItem[], selectedAllergens: Allergen[]) {
  const db = useSQLiteContext();
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadSuggestions() {
      const ids = await getSuggestedMenuItemIds(db);
      const nextSuggestions = ids
        .map((id) =>
          items.find(
            (item) => item.id === id && item.available && !containsSelectedAllergen(item, selectedAllergens)
          )
        )
        .filter(Boolean) as MenuItem[];

      if (mounted) {
        setSuggestedItems(nextSuggestions);
      }
    }

    void loadSuggestions();

    return () => {
      mounted = false;
    };
  }, [db, items, selectedAllergens]);

  return suggestedItems;
}
