import { StyleSheet, Text, View } from 'react-native';

import { DEFAULT_STATUS_COLOR, STATUS_COLORS } from '@/theme/colors';

export function StatusBadge({ value }: { value: string }) {
  const colors = STATUS_COLORS[value] ?? DEFAULT_STATUS_COLOR;
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
