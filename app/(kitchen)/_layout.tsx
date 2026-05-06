import React from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function KitchenLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const isLoginRoute = segments[segments.length - 1] === 'login';

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && !isLoginRoute) {
    return <Redirect href="/login" />;
  }

  if (isAuthenticated && isLoginRoute) {
    return <Redirect href="/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
