import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // 1. Configurer le comportement des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 2. Demander les permissions (seulement si pas encore accordées)
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
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
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Notifications désactivées',
            'Les rappels ne fonctionneront pas sans autorisation.\n' +
              'Veuillez activer les notifications dans Réglages > [Nom de l’app] > Notifications.'
          );
        }
      }
    };

    requestPermissions();

    // 3. Écouter les clics sur les notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const taskId = data?.taskId;

        if (taskId) {
          router.push(`/task/${taskId}`);
        } else {
          console.warn('Notification cliquée sans taskId', data);
        }
      }
    );

    // Optionnel : écouter les notifications reçues (foreground)
    // const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    //   console.log('Notification reçue en foreground:', notification.request.content.body);
    // });

    // Nettoyage
    return () => {
      responseSubscription.remove();
      // receivedSubscription?.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}