// app/(tabs)/agenda.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import CalendarMini from '../../components/CalendarMini';
import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../data/database';

export default function AgendaScreen() {
  const {
    allTasks,
    fetchAllTasks,
    removeTask,
    toggleTaskDone,
  } = useTaskStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // 🔎 Filtrage par date (si une date est sélectionnée)
  const filteredTasks: Task[] = selectedDate
    ? allTasks.filter(task =>
        task.date.startsWith(selectedDate)
      )
    : allTasks;

  return (
    <SafeAreaView style={styles.container}>
      {/* Calendrier */}
      <CalendarMini
        onDateSelect={(date) => setSelectedDate(date)}
      />

      {/* État vide */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune tâche à afficher</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez-en une depuis l’écran d’accueil ou avec le bouton +
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredTasks}
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
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
});
