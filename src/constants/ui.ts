import type { Allergen, Category, ItemStatus, MenuItem } from '../types';
import { CATEGORIES, ACTIVE_ITEM_STATUSES } from '../types';

const APP_LOCALE = 'fr-BE';

export const CATEGORY_LABELS: Record<Category, string> = {
  starter: 'Entrées',
  main: 'Plats',
  dessert: 'Desserts',
  drink: 'Boissons',
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prêt',
  unavailable: 'Indisponible',
};

export const CUSTOMER_CATEGORY_FILTERS: { label: string; value: Category | undefined }[] = [
  { label: 'Tout', value: undefined },
  ...CATEGORIES.map((cat) => ({ label: CATEGORY_LABELS[cat], value: cat as Category })),
];

export type CustomerMenuFilter = Category | 'allergens' | undefined;

export const CUSTOMER_MENU_FILTERS: { label: string; value: CustomerMenuFilter }[] = [
  ...CUSTOMER_CATEGORY_FILTERS,
  { label: 'Contient vos allergènes', value: 'allergens' },
];

export const KITCHEN_STATUS_FILTERS: { label: string; value: ItemStatus | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  ...ACTIVE_ITEM_STATUSES.map((status) => ({ label: ITEM_STATUS_LABELS[status], value: status as ItemStatus })),
];

export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
}

export function formatTime(value: string | number | Date): string {
  return new Date(value).toLocaleTimeString(APP_LOCALE, { hour: '2-digit', minute: '2-digit' });
}

export function getMatchingAllergens(
  itemAllergens: Allergen[] | undefined,
  selectedAllergens: Allergen[]
): Allergen[] {
  if (!itemAllergens?.length || !selectedAllergens.length) {
    return [];
  }
  const selectedIds = new Set(selectedAllergens.map((allergen) => allergen.id));
  return itemAllergens.filter((allergen) => selectedIds.has(allergen.id));
}

export function containsSelectedAllergen(item: MenuItem, selectedAllergens: Allergen[]): boolean {
  return getMatchingAllergens(item.allergens, selectedAllergens).length > 0;
}
