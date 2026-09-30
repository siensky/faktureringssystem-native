import * as Haptics from 'expo-haptics';

// Tunna, namngivna omslag runt expo-haptics — anropsplatserna ska läsas
// som "ge lätt/lyckad/misslyckad känsla", inte behöva känna till
// Haptics-enumen själva.

export function tapFeedback(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function successFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function errorFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
