import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

export interface BottomTab {
  key: string;
  label: string;
}

interface BarColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface BottomTabBarProps {
  tabs: BottomTab[];
  activeKey: string;
  onPress: (key: string) => void;
  colors: BarColors;
}

export function BottomTabBar({ tabs, activeKey, onPress, colors }: BottomTabBarProps) {
  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.safeArea,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.tab,
                isActive && { backgroundColor: colors.surface },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? Colors.primary : colors.textSecondary },
                  isActive && styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
