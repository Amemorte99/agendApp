// app/splash.tsx
import { View, Text, StyleSheet, Image } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Attendre 2 secondes puis rediriger vers les tabs
    const timer = setTimeout(() => {
      router.replace('/(tabs)'); // ou '/' si ton index est différent
    }, 2000); // 2 secondes

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#5c7cfa', '#3b82f6']} // Dégradé bleu moderne (ta charte)
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo ou image (optionnel) */}
        {/* <Image 
          source={require('../assets/icon.png')} // ajoute ton icône si tu veux
          style={styles.logo}
        /> */}

        <Text style={styles.title}>Agenda & Rappels</Text>
        <Text style={styles.subtitle}>
          Gérez vos tâches, rendez-vous et rappels simplement
        </Text>
        <Text style={styles.subtitle}>
          Notifications fiables • Hors ligne • Rapide
        </Text>

        <Text style={styles.loading}>Chargement...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  loading: {
    marginTop: 60,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
});