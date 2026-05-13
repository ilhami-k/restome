import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface KitchenMenuSearchProps {
  search: string;
  onChangeSearch: (value: string) => void;
}

export function KitchenMenuSearch({
  search,
  onChangeSearch,
}: KitchenMenuSearchProps) {
  return (
    <View style={styles.searchBox}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un article..."
        placeholderTextColor={Colors.kitchenTextSecondary}
        value={search}
        onChangeText={onChangeSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
  },
});
