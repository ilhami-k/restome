import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors } from '../../../constants/colors';
import { Messages } from '../../../constants/messages';

const loginSchema = z.object({
  email: z.string().trim().email('Saisissez une adresse e-mail valide.'),
  password: z.string().trim().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      Alert.alert(Messages.kitchen.loginFailedTitle, Messages.kitchen.loginFailedMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.brand}>RestoMe</Text>
        <Text style={styles.tagline}>PORTAIL CUISINE</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="staff@restome.com"
              placeholderTextColor={Colors.kitchenTextSecondary}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          )}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}

        <Text style={styles.label}>Mot de passe</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={Colors.kitchenTextSecondary}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.scanButtonText}>Retour au scan QR</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kitchenBackground,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    color: Colors.kitchenTextSecondary,
    marginTop: 4,
    letterSpacing: 2,
  },
  form: {
    gap: 12,
  },
  label: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.kitchenCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.kitchenBorder,
  },
  inputError: {
    borderColor: Colors.statusUnavailable,
  },
  errorText: {
    color: Colors.statusUnavailable,
    fontSize: 12,
    marginTop: -6,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scanButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  scanButtonText: {
    color: Colors.kitchenTextSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
