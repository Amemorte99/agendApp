// app/(tabs)/index.tsx
import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/taskStore'; // ← Utilise le store global

export default function TodayScreen() {
  const { todayTasks, fetchTodayTasks, removeTask, toggleTaskDone } = useTaskStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fabScale = useSharedValue(1);

  // Charge initial + écoute les changements via le store
  useEffect(() => {
    fetchTodayTasks(); // Charge au montage
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer ?', 'Cette tâche sera supprimée définitivement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => removeTask(id), // Mise à jour instantanée via store
      },
    ]);
  };

  const handleToggleDone = (id: string) => {
    toggleTaskDone(id); // Mise à jour instantanée via store
  };

  const handleAddPress = () => {
    fabScale.value = withSpring(0.88, { damping: 12 });
    setTimeout(() => {
      fabScale.value = withSpring(1);
      router.push('/new-task');
    }, 150);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={[styles.greeting, isDark && styles.textDark]}>
            Bonjour 👋
          </Text>
          <Text style={[styles.date, isDark && styles.textDark]}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
            <MaterialIcons name="add" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Liste des tâches – mise à jour instantanée via store */}
      <FlashList
        data={todayTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onDelete={() => handleDelete(item.id)}
            onToggleDone={() => handleToggleDone(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        estimatedItemSize={100}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="event-note"
              size={80}
              color={isDark ? '#475569' : '#CBD5E1'}
            />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
              Aucune tâche pour aujourd'hui
            </Text>
            <Text style={[styles.emptySubtitle, isDark && styles.textDarkSub]}>
              Appuie sur le + pour organiser ta journée
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  date: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  textDark: {
    color: '#F1F5F9',
  },
  textDarkSub: {
    color: '#94A3B8',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});