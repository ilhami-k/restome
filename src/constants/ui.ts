import type { Allergen, Category, ItemStatus } from '../types';
import { CATEGORIES, ACTIVE_ITEM_STATUSES } from '../types';

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

export const KITCHEN_STATUS_FILTERS: { label: string; value: ItemStatus | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  ...ACTIVE_ITEM_STATUSES.map((status) => ({ label: ITEM_STATUS_LABELS[status], value: status as ItemStatus })),
];

export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
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
