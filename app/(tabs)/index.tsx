// app/(tabs)/index.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { FlashList } from '@shopify/flash-list'; // Pro : perf pour listes longues
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddButton from '../../components/AddButton';
import TaskCard from '../../components/TaskCard';
import useTasks from '../../hooks/useTasks'; // À créer plus tard

export default function TodayScreen() {
  const colorScheme = useColorScheme();
  const { tasks, completeTask } = useTasks(); // État global
  const todayTasks = tasks.filter(t => /* filtre aujourd'hui */ true); // TODO: implémenter filtre date

  const colors = getColors(colorScheme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.text }]}>{format(new Date(), 'EEEE d MMMM', { locale: fr })}</Text>
      </View>
      <FlashList
        data={todayTasks}
        renderItem={({ item }) => (
          <TaskCard task={item} onComplete={() => completeTask(item.id)} />
        )}
        estimatedItemSize={80}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textSecondary }]}>Aucune tâche aujourd'hui</Text>}
      />
      <AddButton />
    </SafeAreaView>
  );
}

const getColors = (scheme: 'light' | 'dark' | null) => ({
  background: scheme === 'dark' ? '#0A0E1A' : '#F8FAFC',
  text: scheme === 'dark' ? '#E2E4E9' : '#1A1B1E',
  textSecondary: scheme === 'dark' ? '#94A3B8' : '#64748B',
  // Ajoute plus au besoin
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  date: { fontSize: 24, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 100, fontSize: 18 },
});