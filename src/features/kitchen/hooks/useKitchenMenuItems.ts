import { useEffect, useMemo, useState } from 'react';
import {
  createAllergen,
  createMenuItem,
  fetchAllergens,
  fetchKitchenMenuItems,
  updateMenuItem,
  updateMenuItemAvailability,
  type MenuItemInput,
} from '../../../services/menu.service';
import { CATEGORIES } from '../../../types';
import type { Allergen, MenuItem } from '../../../types';

export function useKitchenMenuItems(search: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [nextItems, nextAllergens] = await Promise.all([fetchKitchenMenuItems(), fetchAllergens()]);
      if (mounted) {
        setItems(nextItems);
        setAllergens(nextAllergens);
      }
    }

    void loadData();

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

  async function saveMenuItem(input: MenuItemInput, itemId?: string) {
    if (itemId) {
      await updateMenuItem(itemId, input);
    } else {
      await createMenuItem(input);
    }

    setItems(await fetchKitchenMenuItems());
  }

  async function addAllergen(name: string) {
    const allergen = await createAllergen(name);
    setAllergens((current) => [...current, allergen].sort((left, right) => left.name.localeCompare(right.name, 'fr')));
    return allergen;
  }

  return {
    allergens,
    filteredItems,
    itemsByCategory,
    categoryOrder: CATEGORIES,
    toggleItemAvailability,
    saveMenuItem,
    addAllergen,
  };
}
