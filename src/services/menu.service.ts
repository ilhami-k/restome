import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import type { Allergen, Category, MenuItem } from '../types';

type MenuRow = Omit<MenuItem, 'allergens'> & {
  allergens?: Array<{ allergen: Allergen | null }>;
};

export interface MenuItemInput {
  name: string;
  price: number;
  category: Category;
  image_url: string | null;
  allergenIds: string[];
}

export interface MenuImageUpload {
  base64: string;
  fileName: string | null | undefined;
  mimeType: string | null | undefined;
}

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
    .select('*, allergens:menu_item_allergens(allergen:allergens(id, name))')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MenuRow[]).map(mapMenuRow);
}

export async function updateMenuItemAvailability(
  menuItemId: string,
  available: boolean,
  availabilityMessage: string | null
): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ available, availability_message: available ? null : availabilityMessage })
    .eq('id', menuItemId);

  if (error) {
    throw error;
  }
}

export async function createMenuItem(input: MenuItemInput): Promise<void> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: input.name,
      price: input.price,
      category: input.category,
      image_url: input.image_url,
      available: true,
      availability_message: null,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create menu item');
  }

  await replaceMenuItemAllergens(data.id as string, input.allergenIds);
}

export async function updateMenuItem(menuItemId: string, input: MenuItemInput): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({
      name: input.name,
      price: input.price,
      category: input.category,
      image_url: input.image_url,
    })
    .eq('id', menuItemId);

  if (error) {
    throw error;
  }

  await replaceMenuItemAllergens(menuItemId, input.allergenIds);
}

async function replaceMenuItemAllergens(menuItemId: string, allergenIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('menu_item_allergens')
    .delete()
    .eq('menu_item_id', menuItemId);

  if (deleteError) {
    throw deleteError;
  }

  if (allergenIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from('menu_item_allergens').insert(
    allergenIds.map((allergenId) => ({
      menu_item_id: menuItemId,
      allergen_id: allergenId,
    }))
  );

  if (insertError) {
    throw insertError;
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

export async function createAllergen(name: string): Promise<Allergen> {
  const { data, error } = await supabase
    .from('allergens')
    .insert({ name })
    .select('id, name')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create allergen');
  }

  return data as Allergen;
}

export async function uploadMenuItemImage(image: MenuImageUpload): Promise<string> {
  const contentType = image.mimeType ?? 'image/jpeg';
  const extension = getImageExtension(image.fileName, contentType);
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const path = `menu-items/${fileName}`;

  const { error } = await supabase.storage
    .from('menu-images')
    .upload(path, decode(image.base64), {
      contentType,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}

function getImageExtension(fileName: string | null | undefined, mimeType: string): string {
  const nameExtension = fileName?.split('.').pop()?.toLowerCase();
  if (nameExtension && ['jpg', 'jpeg', 'png', 'webp'].includes(nameExtension)) {
    return nameExtension === 'jpg' ? 'jpeg' : nameExtension;
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpeg';
}

export function subscribeToMenuAvailability(
  onUpdate: (menuItemId: string, available: boolean, availabilityMessage: string | null) => void
) {
  const channel = supabase
    .channel(createChannelName('menu_availability'))
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'menu_items',
      },
      (payload) => {
        const newRecord = payload.new as {
          id: string;
          available: boolean;
          availability_message: string | null;
        };
        onUpdate(newRecord.id, newRecord.available, newRecord.availability_message);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function createChannelName(name: string): string {
  return `${name}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
