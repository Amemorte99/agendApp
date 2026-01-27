// app/_layout.tsx
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

// Configuration globale des notifications (doit être appelée une seule fois)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,    // ← requis pour iOS 17+/18+
    shouldShowList: true,      // ← requis pour iOS 17+/18+
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Fonction d’initialisation complète
const setupNotifications = async () => {
  try {
    // Permissions
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications désactivées',
        'Les rappels ne fonctionneront pas sans autorisation.\n' +
          'Allez dans Réglages > [Nom de l’app] > Notifications et activez-les.'
      );
      return;
    }

    // Canal Android (optionnel mais fortement recommandé)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('tasks-reminders', {
        name: 'Rappels de tâches',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#6366f1',
        sound: 'default',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
      console.log('[Notifications] Canal Android configuré');
    }

    console.log('[Notifications] Prêt – permissions accordées');
  } catch (err) {
    console.error('[Notifications] Erreur lors de la configuration:', err);
  }
};

export default function RootLayout() {
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialisation
    setupNotifications();

    // Listener clic notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | { taskId?: string }
          | undefined;

        if (data?.taskId) {
          console.log('[Notifications] Navigation vers tâche:', data.taskId);
          router.push(`/task/${data.taskId}`);
        } else {
          console.warn('[Notifications] Clic sans taskId:', data);
        }
      }
    );

    // Nettoyage propre
    return () => {
      responseListener.current?.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}