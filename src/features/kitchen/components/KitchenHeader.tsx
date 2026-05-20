import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';

interface KitchenHeaderProps {
  title: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  closeLabel?: string;
  onClose?: () => void;
  closeDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function KitchenHeader({
  title,
  leading,
  trailing,
  closeLabel = Messages.common.close,
  onClose,
  closeDisabled,
  style,
}: KitchenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {leading}
      <View style={styles.headerTop}>
        <View style={styles.titleRow}>
          <View style={styles.activeDot} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {trailing ??
          (onClose ? (
            <Pressable
              style={({ pressed }) => [styles.closeSessionButton, pressed && styles.pressed]}
              onPress={onClose}
              disabled={closeDisabled}
            >
              <Text style={styles.closeSessionText}>{closeLabel}</Text>
            </Pressable>
          ) : null)}
      </View>
    </View>
  );
}

export const kitchenHeaderStyles = StyleSheet.create({
  errorText: {
    color: Colors.statusUnavailable,
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusReady,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  closeSessionButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.statusUnavailableSoft,
  },
  closeSessionText: {
    color: Colors.statusUnavailable,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
