import { z } from 'zod';
import { CATEGORIES } from '../../../types';
import type { Category } from '../../../types';

export const menuItemFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Renseignez un nom.'),
  price: z.string().trim().refine((value) => {
    const price = Number(value.replace(',', '.'));
    return !Number.isNaN(price) && price >= 0;
  }, 'Renseignez un prix valide.'),
  category: z.enum(CATEGORIES),
  imageUrl: z.string().trim(),
  allergenIds: z.array(z.string()),
});

export type MenuFormState = z.infer<typeof menuItemFormSchema>;

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
  const result = menuItemFormSchema.safeParse(form);

  if (!result.success) {
    return {
      input: null,
      errorMessage: result.error.issues[0]?.message ?? 'Renseignez un nom et un prix valide.',
    };
  }

  const formData = result.data;
  const price = Number(formData.price.replace(',', '.'));

  return {
    input: {
      name: formData.name,
      price,
      category: formData.category as Category,
      image_url: formData.imageUrl || null,
      allergenIds: formData.allergenIds,
    },
    errorMessage: null,
  };
}
