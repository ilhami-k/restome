import { useEffect, useMemo, useState } from 'react';
import { fetchKitchenMenuItems, updateMenuItemAvailability } from '../../../services/menu.service';
import { CATEGORIES } from '../../../types';
import type { MenuItem } from '../../../types';

export function useKitchenMenuItems(search: string) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      const nextItems = await fetchKitchenMenuItems();
      if (mounted) {
        setItems(nextItems);
      }
    }

    void loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const itemsByCategory = useMemo(() => {
    return CATEGORIES.reduce<Record<string, MenuItem[]>>((accumulator, category) => {
      accumulator[category] = filteredItems.filter((item) => item.category === category);
      return accumulator;
    }, {});
  }, [filteredItems]);

  async function toggleItemAvailability(item: MenuItem) {
    await updateMenuItemAvailability(item.id, !item.available);
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, available: !entry.available } : entry
      )
    );
  }

  return { filteredItems, itemsByCategory, categoryOrder: CATEGORIES, toggleItemAvailability };
}
