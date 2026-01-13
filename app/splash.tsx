// app/splash.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(40);
  const dotsOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrée
    opacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });
    scale.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.back(1.4)),
    });
    translateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    // Animation des points
    dotsOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600 })
    );

    // 🚀 Navigation JS SAFE
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#4f46e5', '#6366f1', '#7c3aed']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
          />
          <View style={styles.logoGlow} />
        </View>

        {/* Texte */}
        <Text style={styles.title}>Agenda Pro</Text>
        <Text style={styles.subtitle}>
          Organisez vos journées simplement
        </Text>

        {/* Chargement */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement</Text>
          <Animated.Text style={[styles.loadingDots, dotsStyle]}>
            …
          </Animated.Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 36,
    position: 'relative',
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 32,
  },
  logoGlow: {
    position: 'absolute',
    inset: -18,
    backgroundColor: 'rgba(99,102,241,0.3)',
    borderRadius: 48,
    zIndex: -1,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 50,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingDots: {
    fontSize: 22,
    marginLeft: 4,
    color: '#fff',
  },
});
