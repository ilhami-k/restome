import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSession } from '../../../contexts/SessionContext';
import { Colors } from '../../../constants/colors';
import { useTableSession } from '../hooks/useTableSession';
import { notifySessionJoined, notifySessionOpened } from '../../../services/sessions.service';

const KITCHEN_QR_CODE = 'KITCHEN_001';

export default function QRScanScreen() {
  const router = useRouter();
  const { setSessionData } = useSession();
  const { loading, resolveSession } = useTableSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const { width } = useWindowDimensions();

  const scannerSize = useMemo(() => Math.min(Math.max(width - 80, 220), 320), [width]);
  const frameSize = useMemo(() => Math.round(scannerSize * 0.72), [scannerSize]);

  const goToMenu = useCallback(() => {
    router.push('/menu');
  }, [router]);

  const processQrCode = useCallback(
    async (qrCode: string) => {
      const trimmedCode = qrCode.trim();

      if (!trimmedCode) {
        Alert.alert('Code manquant', 'Saisissez un QR code de table valide.');
        return;
      }

      if (trimmedCode === KITCHEN_QR_CODE) {
        router.replace('/(kitchen)/login');
        return;
      }

      try {
        const result = await resolveSession(trimmedCode);

        if (result.joinedExisting) {
          Alert.alert(
            'Rejoindre la session ?',
            `La table ${result.table.number} a déjà une session en cours. Voulez-vous la rejoindre ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Rejoindre',
                onPress: () => {
                  setSessionData(result.session, result.table);
                  void notifySessionJoined(result.session.id, result.table.number);
                  goToMenu();
                },
              },
            ]
          );
          return;
        }

        setSessionData(result.session, result.table);
        void notifySessionOpened(result.session.id, result.table.number);
        goToMenu();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'TABLE_NOT_FOUND') {
          Alert.alert('QR code invalide', "Aucune table ne correspond à ce code.");
          return;
        }

        Alert.alert('Erreur', "Impossible de démarrer une session pour cette table.");
      }
    },
    [goToMenu, resolveSession, router, setSessionData]
  );

  const handleBarCode = useCallback(
    async ({ data }: { data: string }) => {
      if (loading) {
        return;
      }

      setScanning(false);
      await processQrCode(data);
    },
    [loading, processQrCode]
  );

  const toggleScanner = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (result.granted) {
        setScanning(true);
      }
      return;
    }

    setScanning((current) => !current);
  }, [permission?.granted, requestPermission]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>RestoMe</Text>
            <Text style={styles.tagline}>EXPÉRIENCE À TABLE</Text>
          </View>

          <View style={[styles.scannerContainer, { width: scannerSize, height: scannerSize }]}>
            {scanning && permission?.granted ? (
              <>
                <CameraView
                  style={[styles.camera, { width: scannerSize, height: scannerSize }]}
                  facing="back"
                  onBarcodeScanned={handleBarCode}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />
                <View style={styles.overlay}>
                  <View style={[styles.scanFrame, { width: frameSize, height: frameSize }]} />
                </View>
              </>
            ) : (
              <View style={[styles.placeholder, { width: scannerSize, height: scannerSize }]}>
                <View style={[styles.scanFrame, { width: frameSize, height: frameSize }]} />
              </View>
            )}
          </View>

          <Text style={styles.hint}>Scannez le QR code de votre table</Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={toggleScanner}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Scanner un QR code</Text>
            )}
          </Pressable>

          {showManual ? (
            <View style={styles.manualBox}>
              <TextInput
                style={styles.manualInput}
                placeholder="Saisir le QR code de la table"
                placeholderTextColor={Colors.customerTextSecondary}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="none"
              />
              <Pressable
                style={({ pressed }) => [styles.manualButton, pressed && styles.pressed]}
                onPress={() => {
                  void processQrCode(manualCode);
                }}
              >
                <Text style={styles.manualButtonText}>Valider</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => setShowManual(true)}
            >
              <Text style={styles.link}>Saisir le code manuellement</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.settingsLinkWrapper, pressed && styles.pressed]}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.link}>Mes paramètres</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.customerDarkBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    color: Colors.customerTextSecondary,
    marginTop: 4,
    letterSpacing: 2,
  },
  scannerContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  camera: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholder: {
    borderRadius: 16,
    backgroundColor: Colors.customerDarkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  scanFrame: {
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  hint: {
    color: Colors.customerDarkTextSecondary,
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    minWidth: 220,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  manualBox: {
    width: '100%',
    maxWidth: 320,
    marginTop: 8,
  },
  manualInput: {
    backgroundColor: Colors.customerDarkSurface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
    marginBottom: 12,
  },
  manualButton: {
    backgroundColor: Colors.customerSurface,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  manualButtonText: {
    color: Colors.customerText,
    fontSize: 15,
    fontWeight: '600',
  },
  link: {
    color: Colors.primaryLight,
    fontSize: 14,
    marginTop: 8,
  },
  settingsLinkWrapper: {
    marginTop: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
