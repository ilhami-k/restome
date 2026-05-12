import type { Category } from '../../../types';

export interface MenuFormState {
  id?: string;
  name: string;
  price: string;
  category: Category;
  imageUrl: string;
  allergenIds: string[];
}

export interface ParsedMenuItemForm {
  name: string;
  price: number;
  category: Category;
  image_url: string | null;
  allergenIds: string[];
}

export interface MenuFormParseResult {
  input: ParsedMenuItemForm | null;
  errorMessage: string | null;
}

export const emptyMenuForm: MenuFormState = {
  name: '',
  price: '',
  category: 'starter',
  imageUrl: '',
  allergenIds: [],
};

export function parseMenuItemForm(form: MenuFormState): MenuFormParseResult {
  const name = form.name.trim();
  const price = Number(form.price.replace(',', '.'));

  if (!name || Number.isNaN(price) || price < 0) {
    return {
      input: null,
      errorMessage: 'Renseignez un nom et un prix valide.',
    };
  }

  return {
    input: {
      name,
      price,
      category: form.category,
      image_url: form.imageUrl.trim() || null,
      allergenIds: form.allergenIds,
    },
    errorMessage: null,
  };
}
