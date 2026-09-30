import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { INVOICE_STATUS_LABELS } from '@/theme/colors';
import type { PortalInvoiceSummaryDto } from '@/types/contracts';

import { findStatusChanges } from './statusCheck';

const CACHE_KEY = 'mobile.lastKnownInvoices';

// Jämför senaste hämtade fakturalistan mot en cachad kopia och schemalägger
// en lokal notis per faktura som bytt status sedan sist. Rent on-device —
// ingen server-push. findStatusChanges gör själva jämförelsen (testad för
// sig i statusCheck.test.ts); den här hooken sköter bara cache och
// notiser runt den.
export function useInvoiceStatusNotifications(invoices: PortalInvoiceSummaryDto[] | undefined): void {
  useEffect(() => {
    if (!invoices) return;

    (async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      const previous: PortalInvoiceSummaryDto[] = cached ? JSON.parse(cached) : [];

      const changes = findStatusChanges(previous, invoices);
      for (const change of changes) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Faktura ${change.invoiceNumber ?? ''} uppdaterad`,
            body: `Ny status: ${INVOICE_STATUS_LABELS[change.newStatus] ?? change.newStatus}`,
          },
          trigger: null,
        });
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(invoices));
    })();
  }, [invoices]);
}
