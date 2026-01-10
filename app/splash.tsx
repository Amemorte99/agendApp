// app/splash.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Apparition progressive
    opacity.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) }));
    scale.value = withDelay(300, withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) }));
    translateY.value = withDelay(300, withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) }));

    // Redirection après 2.5s (un peu plus long pour apprécier l'animation)
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600 }, () => {
        router.replace('/(tabs)');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  return (
    <LinearGradient
      colors={['#4f46e5', '#6366f1', '#7c3aed']} // Dégradé indigo-violet premium
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Logo avec glow */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')} // Mets ton vrai logo ici
            style={styles.logo}
          />
          <View style={styles.logoGlow} />
        </View>

        {/* Titre principal */}
        <Text style={styles.title}>Agenda Pro</Text>

        {/* Sous-titre élégant */}
        <Text style={styles.subtitle}>
          Vos tâches, rendez-vous et rappels
        </Text>
        <Text style={styles.subtitleSmall}>
          Simples • Fiables • Toujours à portée de main
        </Text>

        {/* Chargement animé (points qui dansent) */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement</Text>
          <Animated.Text style={styles.loadingDots}>
            •••
          </Animated.Text>
        </View>
      </Animated.View>
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
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 50,
    zIndex: -1,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleSmall: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  loadingDots: {
    fontSize: 18,
    color: 'white',
    marginLeft: 4,
  },
});