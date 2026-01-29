// app/_layout.tsx
import { Stack, useRouter } from 'expo-router'; // ← AJOUTE useRouter ICI
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { initDatabase } from '@/data/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const setupNotifications = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications désactivées',
        'Activez les notifications dans Réglages → [Votre App] → Notifications.'
      );
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('tasks-reminders', {
        name: 'Rappels de tâches',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#6366f1',
        sound: 'default',
      });
    }
  } catch (err) {
    console.error('[Notifications] Setup error:', err);
  }
};

export default function RootLayout() {
  const router = useRouter(); // ← DÉCLARE LE HOOK ICI

  useEffect(() => {
    // Initialisation DB + Notifications
    initDatabase();
    setupNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = response.notification.request.content.data?.taskId as string | undefined;

      if (taskId) {
        console.log('[Notifications] Navigation vers tâche:', taskId);
        router.push(`/task/${taskId}`);
      } else {
        console.warn('[Notifications] Clic sans taskId:', response.notification.request.content.data);
      }
    });

    return () => subscription.remove();
  }, [router]); // ← Ajoute router dans les dépendances (bonne pratique)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}