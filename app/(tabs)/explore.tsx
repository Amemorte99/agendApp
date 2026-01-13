// app/(tabs)/explore.tsx
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E5E7EB', dark: '#1F2933' }}
      headerImage={
        <IconSymbol
          name="calendar.badge.checkmark"
          size={280}
          color="#6366F1"
          style={styles.headerImage}
        />
      }
    >
      {/* Titre */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontFamily: Fonts.rounded }}
        >
          À propos
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.intro}>
        Cette application vous aide à organiser vos tâches, suivre votre
        productivité et garder un historique clair de vos journées.
      </ThemedText>

      {/* Fonctionnalités */}
      <Collapsible title="Fonctionnalités principales">
        <ThemedText>• Agenda quotidien et planning global</ThemedText>
        <ThemedText>• Historique des tâches terminées</ThemedText>
        <ThemedText>• Synchronisation instantanée</ThemedText>
        <ThemedText>• Mode clair / sombre</ThemedText>
        <ThemedText>• Fonctionne hors connexion</ThemedText>
      </Collapsible>

      {/* Données */}
      <Collapsible title="Gestion des données">
        <ThemedText>
          Toutes vos données sont stockées localement sur votre appareil.
          Aucune information n’est envoyée sur un serveur externe.
        </ThemedText>
      </Collapsible>

      {/* Technologie */}
      <Collapsible title="Technologies utilisées">
        <ThemedText>• Expo + React Native</ThemedText>
        <ThemedText>• SQLite (stockage local)</ThemedText>
        <ThemedText>• Zustand (gestion d’état)</ThemedText>
        <ThemedText>• FlashList (performance)</ThemedText>
      </Collapsible>

      {/* Ressources */}
      <Collapsible title="Ressources utiles">
        <ExternalLink href="https://docs.expo.dev">
          <ThemedText type="link">Documentation Expo</ThemedText>
        </ExternalLink>
        <ExternalLink href="https://reactnative.dev">
          <ThemedText type="link">React Native</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Illustration */}
      <ThemedView style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.image}
        />
      </ThemedView>

      {/* Plateformes */}
      {Platform.OS === 'ios' && (
        <Collapsible title="iOS">
          <ThemedText>
            Cette application utilise des composants natifs optimisés pour iOS.
          </ThemedText>
        </Collapsible>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    position: 'absolute',
    bottom: -80,
    left: -30,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    marginBottom: 16,
    color: '#6B7280',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  image: {
    width: 90,
    height: 90,
    opacity: 0.8,
  },
});
