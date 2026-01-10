// components/NotificationHandler.tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function NotificationHandler() {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
      // TODO: mise à jour état si confirmation
    });

    return () => subscription.remove();
  }, []);

  return null;
}