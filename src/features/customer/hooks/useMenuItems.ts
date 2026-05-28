import { fetchMenuItems } from '../../../services/menu.service';
import { useAsyncData } from '../../../hooks/useAsyncData';
import type { Category, MenuItem } from '../../../types';

export function useMenuItems(category?: Category) {
  const { data: items, loading, error } = useAsyncData<MenuItem[]>(
    () => fetchMenuItems(category),
    [category],
    [],
    'Impossible de charger le menu.'
  );

  return { items, loading, error };
}
