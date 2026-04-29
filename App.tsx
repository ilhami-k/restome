import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SQLiteProvider } from 'expo-sqlite';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserSettingsProvider } from './src/contexts/UserSettingsContext';
import { SessionProvider } from './src/contexts/SessionContext';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { Colors } from './src/constants/colors';
import { initializeDatabase } from './src/lib/db';

interface AppProvidersProps {
  children: React.ReactNode;
}

function ConnectionOverlay() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const subscription = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });

    return () => {
      subscription();
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.offlineOverlay}>
      <View style={styles.offlineCard}>
        <Text style={styles.offlineTitle}>Pas de connexion</Text>
        <Text style={styles.offlineText}>
          RestoMe a besoin d'une connexion internet active pour le parcours client comme pour la cuisine.
        </Text>
      </View>
    </View>
  );
}

export function AppProviders({ children }: AppProvidersProps) {

  return (
    <GestureHandlerRootView style={styles.root}>
      <SQLiteProvider databaseName="restome.db" onInit={initializeDatabase}>
        <AuthProvider>
          <ThemeProvider>
            <UserSettingsProvider>
              <SessionProvider>
                <CartProvider>
                  <StatusBar style="auto" />
                  {children}
                  <ConnectionOverlay />
                </CartProvider>
              </SessionProvider>
            </UserSettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return <AppProviders>{null}</AppProviders>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  offlineCard: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '100%',
    maxWidth: 360,
  },
  offlineTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  offlineText: {
    color: Colors.kitchenTextSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
