import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {

  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const taskId = response.notification.request.content.data?.taskId;

        if (taskId) {
          router.push(`/task/${taskId}`);
        }
      });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
