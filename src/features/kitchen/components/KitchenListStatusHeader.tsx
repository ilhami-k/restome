import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../../constants/colors';
import { kitchenScreenStyles } from '../styles/screenStyles';

interface KitchenListStatusHeaderProps {
  loading: boolean;
  error: string | null;
}

/** Loading spinner / error message rendered as the kitchen list header. */
export function KitchenListStatusHeader({ loading, error }: KitchenListStatusHeaderProps) {
  return (
    <>
      {loading ? <ActivityIndicator color={Colors.primary} style={kitchenScreenStyles.loader} /> : null}
      {error ? <Text style={kitchenScreenStyles.errorText}>{error}</Text> : null}
    </>
  );
}
