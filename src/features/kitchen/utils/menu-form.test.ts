import { describe, expect, it } from 'vitest';
import { parseMenuItemForm } from './menu-form';
import type { MenuFormState } from './menu-form';

const validForm: MenuFormState = {
  name: 'Risotto',
  price: '12.50',
  category: 'main',
  imageUrl: 'https://example.com/risotto.jpg',
  allergenIds: ['milk'],
};

describe('parseMenuItemForm', () => {
  it('trims fields and parses decimal comma prices', () => {
    const result = parseMenuItemForm({
      ...validForm,
      name: '  Tarte citron  ',
      price: '8,75',
      imageUrl: '  ',
    });

    expect(result.errorMessage).toBeNull();
    expect(result.input).toEqual({
      name: 'Tarte citron',
      price: 8.75,
      category: 'main',
      image_url: null,
      allergenIds: ['milk'],
    });
  });

  it('rejects missing names and invalid prices', () => {
    expect(parseMenuItemForm({ ...validForm, name: '' }).input).toBeNull();
    expect(parseMenuItemForm({ ...validForm, price: 'abc' }).input).toBeNull();
    expect(parseMenuItemForm({ ...validForm, price: '-1' }).input).toBeNull();
  });
});
