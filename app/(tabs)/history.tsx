// app/(tabs)/history.tsx
import { FlashList } from '@shopify/flash-list';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TaskCard from '../../components/TaskCard';
import { Task } from '../../data/database';
import { useTaskStore } from '../../stores/taskStore';

export default function HistoryScreen() {
  const {
    allTasks,
    fetchAllTasks,
    removeTask,
    toggleTaskDone,
  } = useTaskStore();

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // 📜 Historique = tâches terminées (triées par date décroissante)
  const completedTasks: Task[] = useMemo(() => {
    return allTasks
      .filter(task => task.done)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [allTasks]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historique</Text>

      {completedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucune tâche terminée pour le moment
          </Text>
        </View>
      ) : (
        <FlashList
          data={completedTasks}
          keyExtractor={(item) => item.id}
          estimatedItemSize={90}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onDelete={() => removeTask(item.id)}
              onToggleDone={() => toggleTaskDone(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 16,
    color: '#111827',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
});
