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
      const nextSuggestions: MenuItem[] = [];

      for (const id of ids) {
        const item = items.find(
          (menuItem) =>
            menuItem.id === id &&
            menuItem.available &&
            !containsSelectedAllergen(menuItem, selectedAllergens)
        );

        if (item) {
          nextSuggestions.push(item);
        }
      }

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
