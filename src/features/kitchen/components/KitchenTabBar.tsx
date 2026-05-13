import React from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar, type BottomTab } from '../../../components/BottomTabBar';
import { Colors } from '../../../constants/colors';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Commandes',
  'menu-manager': 'Menu',
};

const KITCHEN_BAR_COLORS = {
  background: Colors.kitchenSurface,
  surface: Colors.kitchenCard,
  text: Colors.kitchenText,
  textSecondary: Colors.kitchenTextSecondary,
  border: Colors.kitchenBorder,
};

export function KitchenTabBar({ state, navigation }: BottomTabBarProps) {
  const tabs: BottomTab[] = state.routes
    .filter((route) => TAB_LABELS[route.name])
    .map((route) => ({ key: route.name, label: TAB_LABELS[route.name] }));

  const activeKey = state.routes[state.index]?.name ?? tabs[0]?.key ?? '';

  return (
    <BottomTabBar
      tabs={tabs}
      activeKey={activeKey}
      onPress={(key) => navigation.navigate(key as never)}
      colors={KITCHEN_BAR_COLORS}
    />
  );
}
