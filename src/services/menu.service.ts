import { supabase } from '../lib/supabase';
import type { Allergen, Category, MenuItem } from '../types';

type MenuRow = Omit<MenuItem, 'allergens'> & {
  allergens?: Array<{ allergen: Allergen | null }>;
};

function mapMenuRow(row: MenuRow): MenuItem {
  return {
    ...row,
    allergens: ((row.allergens ?? []).map((entry) => entry.allergen).filter(Boolean) as Allergen[]),
  };
}

export async function fetchMenuItems(category?: Category): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*, allergens:menu_item_allergens(allergen:allergens(id, name))');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  return ((data ?? []) as MenuRow[]).map(mapMenuRow);
}

export async function fetchKitchenMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as MenuItem[];
}

export async function updateMenuItemAvailability(menuItemId: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ available })
    .eq('id', menuItemId);

  if (error) {
    throw error;
  }
}

export async function fetchAllergens(): Promise<Allergen[]> {
  const { data, error } = await supabase
    .from('allergens')
    .select('id, name')
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as Allergen[];
}

export function subscribeToMenuAvailability(onUpdate: (menuItemId: string, available: boolean) => void) {
  const channel = supabase
    .channel('menu_availability')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'menu_items',
      },
      (payload) => {
        const newRecord = payload.new as { id: string; available: boolean };
        onUpdate(newRecord.id, newRecord.available);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
