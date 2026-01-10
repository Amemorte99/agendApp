// app/_layout.tsx
import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { initDatabase } from '../data/database';

// Empêche le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

// Configuration globale des notifications (corrigée pour SDK récents)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,     // ← affiche la bannière en haut
    shouldShowList: true,       // ← affiche dans la liste des notifs
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function setup() {
      try {
        // Initialisation de la base de données
        initDatabase();
        console.log('[APP] Base de données initialisée');
      } catch (error) {
        console.error('[APP] Erreur initialisation DB:', error);
      }

      // Configuration du canal Android (priorité max pour alarme)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Cache le splash screen après un délai court
      await new Promise(resolve => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    }

    setup();
  }, []);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="task/[id]" />
      </Stack>
    </>
  );
}