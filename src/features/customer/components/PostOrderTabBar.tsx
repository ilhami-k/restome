import React from 'react';
import { usePathname, useRouter } from 'expo-router';
import { BottomTabBar, type BottomTab } from '../../../components/BottomTabBar';
import { getCustomerColors } from '../../../constants/colors';
import { useTheme } from '../../../contexts/ThemeContext';

const TABS: BottomTab[] = [
  { key: '/menu', label: 'Menu' },
  { key: '/live-order', label: 'Ma commande' },
  { key: '/bill', label: 'Addition' },
];

export function PostOrderTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const colors = getCustomerColors(theme);

  const activeKey =
    TABS.find((tab) => pathname === tab.key)?.key ?? TABS[0].key;

  return (
    <BottomTabBar
      tabs={TABS}
      activeKey={activeKey}
      onPress={(key) => router.replace(key as never)}
      colors={colors}
    />
  );
}
