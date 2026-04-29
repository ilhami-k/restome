import { useEffect, useState } from 'react';
import { fetchMenuItems } from '../../../services/menu.service';
import type { Category, MenuItem } from '../../../types';

export function useMenuItems(category?: Category) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      setLoading(true);

      try {
        const nextItems = await fetchMenuItems(category);
        if (mounted) {
          setItems(nextItems);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le menu.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      mounted = false;
    };
  }, [category]);

  return { items, loading, error };
}
