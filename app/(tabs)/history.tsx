// app/(tabs)/history.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import TaskCard from '../../components/TaskCard';
import useTasks from '../../hooks/useTasks';

export default function HistoryScreen() {
  const { tasks } = useTasks();
  const completed = tasks.filter(t => t.done); // TODO: filtre + date

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <FlashList
        data={completed}
        renderItem={({ item }) => <TaskCard task={item} />}
        estimatedItemSize={80}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
});