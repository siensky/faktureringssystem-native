import * as Notifications from 'expo-notifications';

// Utan detta visas aldrig en schemalagd notis medan appen är öppen och i
// förgrunden. Anropas en gång vid appstart (src/App.tsx).
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
}
