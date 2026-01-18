// hooks/useNotifications.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { handleNotificationResponse, setupNotifications } from '@/utils/notifications';

export function useNotifications() {
  useEffect(() => {
    // Initialisation une seule fois
    setupNotifications();

    // Listener pour quand l'utilisateur clique sur la notification
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Optionnel : listener pour les notifications reçues en foreground
    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Reçue en foreground:', notification.request.content.body);
      // Tu peux updater le store ici si tu veux marquer notified: true
    });

    return () => {
      subscription.remove();
      foregroundSub.remove();
    };
  }, []);
}