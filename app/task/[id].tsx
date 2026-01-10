// app/task/[id].tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import useTasks from '../../hooks/useTasks';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { tasks } = useTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) return <Text>Tâche non trouvée</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text>Date: {task.date.toString()}</Text>
      {/* TODO: Édition, suppression, instructions */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold' },
});