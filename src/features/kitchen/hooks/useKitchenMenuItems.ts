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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [nextItems, nextAllergens] = await Promise.all([fetchKitchenMenuItems(), fetchAllergens()]);
        if (mounted) {
          setItems(nextItems);
          setAllergens(nextAllergens);
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

  async function toggleItemAvailability(item: MenuItem, message: string | null) {
    const nextAvailable = !item.available;

    await updateMenuItemAvailability(item.id, nextAvailable, message);
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, available: nextAvailable, availability_message: nextAvailable ? null : message }
          : entry
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
    loading,
    error,
    toggleItemAvailability,
    saveMenuItem,
    addAllergen,
  };
}
