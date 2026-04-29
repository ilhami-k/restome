import React from 'react';
import { Stack } from 'expo-router';
import { AppProviders } from '../App';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
