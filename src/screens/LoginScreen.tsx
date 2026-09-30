import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { errorFeedback, successFeedback } from '@/lib/haptics';
import { CardSurface, Colors, DangerColors } from '@/theme/colors';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      successFeedback();
    } catch (err) {
      errorFeedback();
      setError(err instanceof ApiError ? err.message : 'Kunde inte logga in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.form}>
        <Text style={styles.title}>Faktureringssystemet</Text>
        <Text style={styles.subtitle}>Logga in för att se dina fakturor</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="E-post"
          placeholderTextColor={Colors.mist[400]}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="E-post"
        />
        <TextInput
          style={styles.input}
          placeholder="Lösenord"
          placeholderTextColor={Colors.mist[400]}
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Lösenord"
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={isSubmitting || !email || !password}
          accessibilityRole="button"
          accessibilityLabel="Logga in"
          accessibilityState={{ disabled: isSubmitting || !email || !password }}
        >
          {isSubmitting ? (
            <ActivityIndicator color={CardSurface} />
          ) : (
            <Text style={styles.buttonText}>Logga in</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream[50], justifyContent: 'center', padding: 24 },
  form: { gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.ink[900], textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.mist[500], textAlign: 'center', marginBottom: 12 },
  error: { color: DangerColors.text, backgroundColor: DangerColors.background, borderRadius: 8, padding: 10, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: Colors.ink[100],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink[900],
    backgroundColor: CardSurface,
  },
  button: {
    backgroundColor: Colors.ink[900],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: CardSurface, fontWeight: '600', fontSize: 15 },
});
