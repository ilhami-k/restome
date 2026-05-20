import type { ThemeMode } from '../types';

export interface CustomerColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  banner: string;
  unavailableBackground: string;
  statusBar: 'light' | 'dark';
}

export const Colors = {
  // Brand
  primary: '#C4703E',
  primaryDark: '#A55A30',
  primaryLight: '#D98B5C',

  // Customer Light
  customerBackground: '#F5F0E8',
  customerSurface: '#FFFFFF',
  customerText: '#1C1C1E',
  customerTextSecondary: '#6E6E73',
  customerTextMuted: '#8E8E93',
  customerBorder: '#E5E0D8',
  customerBanner: '#FCEAE0',
  unavailableBackground: '#FFE5E5',

  // Customer Dark
  customerDarkBackground: '#121212',
  customerDarkSurface: '#1C1C1E',
  customerDarkText: '#FFFFFF',
  customerDarkTextSecondary: '#8E8E93',
  customerDarkTextMuted: '#6E6E73',
  customerDarkBanner: '#2A211C',
  customerDarkUnavailableBackground: '#3A1F1F',

  // Kitchen (always dark)
  kitchenBackground: '#121212',
  kitchenSurface: '#1C1C1E',
  kitchenCard: '#2C2C2E',
  kitchenText: '#FFFFFF',
  kitchenTextSecondary: '#8E8E93',
  kitchenBorder: '#3A3A3C',

  // Status
  statusReady: '#34C759',
  statusPreparing: '#FF9500',
  statusPending: '#8E8E93',
  statusUnavailable: '#FF3B30',
  statusUnavailableSoft: '#FF3B3020',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.3)',
} as const;

export function getCustomerColors(theme: ThemeMode): CustomerColors {
  if (theme === 'dark') {
    return {
      background: Colors.customerDarkBackground,
      surface: Colors.customerDarkSurface,
      text: Colors.customerDarkText,
      textSecondary: Colors.customerDarkTextSecondary,
      textMuted: Colors.customerDarkTextMuted,
      border: Colors.kitchenBorder,
      banner: Colors.customerDarkBanner,
      unavailableBackground: Colors.customerDarkUnavailableBackground,
      statusBar: 'light',
    };
  }

  return {
    background: Colors.customerBackground,
    surface: Colors.customerSurface,
    text: Colors.customerText,
    textSecondary: Colors.customerTextSecondary,
    textMuted: Colors.customerTextMuted,
    border: Colors.customerBorder,
    banner: Colors.customerBanner,
    unavailableBackground: Colors.unavailableBackground,
    statusBar: 'dark',
  };
}
