// components/TaskCard.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated'; // Pro : animations

type Task = { id: string; title: string; date: Date; done: boolean };

interface Props {
  task: Task;
  onComplete?: (id: string) => void;
}

export default function TaskCard({ task, onComplete }: Props) {
  const scale = useSharedValue(1);

  const handleComplete = () => {
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1);
      onComplete?.(task.id);
    });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scale.value }] }]}>
      <TouchableOpacity onPress={handleComplete}>
        <MaterialIcons name={task.done ? 'check-circle' : 'radio-button-unchecked'} size={24} color="#5C7CFA" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, task.done && styles.done]}>{task.title}</Text>
        <Text style={styles.time}>{task.date.toLocaleTimeString()}</Text>
      </View>
      <MaterialIcons name="more-vert" size={24} color="#94A3B8" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { flex: 1, marginLeft: 16 },
  title: { fontSize: 16, fontWeight: '500' },
  done: { textDecorationLine: 'line-through', color: '#94A3B8' },
  time: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
});