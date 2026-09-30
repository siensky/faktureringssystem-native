import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CardSurface, Colors } from '@/theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Fångar oväntade render-krascher i skärmträdet så hela appen inte bara
// blir en vit/svart skärm — "Försök igen" återställer felläget utan att
// kräva en omstart av appen.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error('Ofångat fel i appen:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Något gick fel</Text>
          <Text style={styles.subtitle}>Försök igen, eller starta om appen om felet kvarstår.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
            accessibilityRole="button"
            accessibilityLabel="Försök igen"
          >
            <Text style={styles.buttonText}>Försök igen</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: Colors.cream[50],
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.ink[900] },
  subtitle: { fontSize: 14, color: Colors.mist[500], textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: Colors.ink[900], borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: CardSurface, fontWeight: '600' },
});
