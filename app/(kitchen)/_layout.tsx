import React, { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { KitchenTabBar } from '../../src/features/kitchen/components/KitchenTabBar';

export default function KitchenLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const isLoginRoute = segments[segments.length - 1] === 'login';

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !isLoginRoute) {
      router.replace('/(kitchen)/login');
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      router.replace('/(kitchen)/dashboard');
    }
  }, [isAuthenticated, isLoading, isLoginRoute, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (isLoginRoute ? null : <KitchenTabBar {...props} />)}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="queue" options={{ href: null }} />
      <Tabs.Screen name="tables/[sessionId]" options={{ href: null }} />
      <Tabs.Screen name="menu-manager" />
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}
