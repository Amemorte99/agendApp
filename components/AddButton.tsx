// components/AddButton.tsx
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function AddButton() {
  const router = useRouter();
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    rotation.value = withSpring(rotation.value + 45);
    router.push('/new-task');
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <MaterialIcons name="add" size={32} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5C7CFA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5C7CFA',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});