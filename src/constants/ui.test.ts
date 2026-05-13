import { describe, expect, it } from 'vitest';
import { containsSelectedAllergen } from './ui';
import type { Allergen, MenuItem } from '../types';

const gluten: Allergen = { id: 'gluten', name: 'Gluten' };
const milk: Allergen = { id: 'milk', name: 'Lait' };

const pasta: MenuItem = {
  id: 'menu-1',
  name: 'Pâtes',
  price: 14,
  category: 'main',
  available: true,
  image_url: null,
  created_at: '2026-04-30T00:00:00.000Z',
  allergens: [gluten],
};

describe('containsSelectedAllergen', () => {
  it('detects menu items that contain a saved allergen', () => {
    expect(containsSelectedAllergen(pasta, [gluten])).toBe(true);
  });

  it('keeps unrelated allergens out of the risk bucket', () => {
    expect(containsSelectedAllergen(pasta, [milk])).toBe(false);
  });
});
