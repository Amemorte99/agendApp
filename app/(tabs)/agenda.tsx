// app/(tabs)/agenda.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarMini from '../../components/CalendarMini';
import { FlashList } from '@shopify/flash-list';
import TaskCard from '../../components/TaskCard';
import useTasks from '../../hooks/useTasks';

export default function AgendaScreen() {
  const { tasks } = useTasks();

  return (
    <SafeAreaView style={styles.container}>
      <CalendarMini onDateSelect={(date) => console.log('Date sélectionnée:', date)} />

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune tâche à afficher</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez-en une depuis l'écran d'accueil ou en cliquant sur +
          </Text>
        </View>
      ) : (
        <FlashList
          data={tasks}
          renderItem={({ item }) => <TaskCard task={item} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={80}
          contentContainerStyle={styles.listContent}
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
    color: '#6b7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Espace pour le FAB
  },
});