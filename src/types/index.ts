export const ITEM_STATUSES = ['pending', 'preparing', 'ready', 'unavailable'] as const;
export type ItemStatus = typeof ITEM_STATUSES[number];

export const ACTIVE_ITEM_STATUSES = ['pending', 'preparing', 'ready'] as const;
export type ActiveItemStatus = typeof ACTIVE_ITEM_STATUSES[number];

export const SESSION_STATUSES = ['open', 'closed'] as const;
export type SessionStatus = typeof SESSION_STATUSES[number];

export const ORDER_STATUSES = ['open', 'closed', 'paid'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const CATEGORIES = ['starter', 'main', 'dessert', 'drink'] as const;
export type Category = typeof CATEGORIES[number];

export const THEME_MODES = ['light', 'dark'] as const;
export type ThemeMode = typeof THEME_MODES[number];

export interface Table {
  id: string;
  number: number;
  qr_code: string;
}

export interface Session {
  id: string;
  table_id: string;
  status: SessionStatus;
  created_at: string;
  closed_at: string | null;
  table?: Table;
}

export interface Allergen {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  available: boolean;
  image_url: string | null;
  created_at: string;
  allergens?: Allergen[];
}

export interface Order {
  id: string;
  session_id: string;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  notes: string | null;
  status: ItemStatus;
  created_at: string;
  menu_item?: MenuItem;
}

export interface StatusUpdate {
  id: string;
  order_item_id: string;
  message: string | null;
  created_at: string;
}

export interface CartItem {
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  notes: string;
}

export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
}
