import { useMemo } from 'react';
import {
  createAllergen,
  createMenuItem,
  fetchAllergens,
  fetchKitchenMenuItems,
  updateMenuItem,
  updateMenuItemAvailability,
  type MenuItemInput,
} from '../../../services/menu.service';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { CATEGORIES } from '../../../types';
import type { Allergen, MenuItem } from '../../../types';

interface KitchenMenuData {
  items: MenuItem[];
  allergens: Allergen[];
}

export function useKitchenMenuItems(search: string) {
  const { data, setData, loading, error } = useAsyncData<KitchenMenuData>(
    async () => {
      const [items, allergens] = await Promise.all([fetchKitchenMenuItems(), fetchAllergens()]);
      return { items, allergens };
    },
    [],
    { items: [], allergens: [] },
    'Impossible de charger le menu.'
  );
  const { items, allergens } = data;

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const itemsByCategory = useMemo(() => {
    const nextItemsByCategory: Record<string, MenuItem[]> = {};

    for (const category of CATEGORIES) {
      nextItemsByCategory[category] = filteredItems.filter((item) => item.category === category);
    }

    return nextItemsByCategory;
  }, [filteredItems]);

  async function toggleItemAvailability(item: MenuItem, message: string | null) {
    const nextAvailable = !item.available;

    await updateMenuItemAvailability(item.id, nextAvailable, message);
    setData((current) => ({
      ...current,
      items: current.items.map((entry) =>
        entry.id === item.id
          ? { ...entry, available: nextAvailable, availability_message: nextAvailable ? null : message }
          : entry
      ),
    }));
  }

  async function saveMenuItem(input: MenuItemInput, itemId?: string) {
    if (itemId) {
      await updateMenuItem(itemId, input);
    } else {
      await createMenuItem(input);
    }

    const nextItems = await fetchKitchenMenuItems();
    setData((current) => ({ ...current, items: nextItems }));
  }

  async function addAllergen(name: string) {
    const allergen = await createAllergen(name);
    setData((current) => ({
      ...current,
      allergens: [...current.allergens, allergen].sort((left, right) =>
        left.name.localeCompare(right.name, 'fr')
      ),
    }));
    return allergen;
  }

  return {
    allergens,
    filteredItems,
    itemsByCategory,
    categoryOrder: CATEGORIES,
    loading,
    error,
    toggleItemAvailability,
    saveMenuItem,
    addAllergen,
  };
}
