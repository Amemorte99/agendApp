import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { FlashList } from '@shopify/flash-list';
import { format, parseISO,setDefaultOptions, isValid, isPast, isToday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../data/database';
import { fr } from 'date-fns/locale';

// ──────────────────────────────────────────────
// Utilitaires date
// ──────────────────────────────────────────────
const normalizeDate = (dateStr: string): string | null => {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
  } catch {
    return null;
  }
};

export default function AgendaScreen() {
  const router = useRouter(); // ← CORRIGÉ : import + déclaration
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { allTasks, fetchAllTasks, removeTask, toggleTaskDone, loading } = useTaskStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchAllTasks();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fetchAllTasks]);

  // ──────────────────────────────────────────────
  // Tâches filtrées
  // ──────────────────────────────────────────────
  const filteredTasks = useMemo<Task[]>(() => {
    return allTasks
      .filter((task) => normalizeDate(task.date) === selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allTasks, selectedDate]);

  // ──────────────────────────────────────────────
  // Marquage calendrier
  // ──────────────────────────────────────────────
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    allTasks.forEach((task) => {
      const day = normalizeDate(task.date);
      if (day) {
        if (!marks[day]) marks[day] = { dots: [] };
        marks[day].dots.push({
          key: task.id,
          color: task.done ? '#10b981' : '#6366f1',
        });
      }
    });

    // Jour sélectionné
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#6366f1',
        selectedTextColor: '#ffffff',
      };
    }

    return marks;
  }, [allTasks, selectedDate]);

  const handleDayPress = useCallback((day: DateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(day.dateString);
  }, []);

  const subtitleText = useMemo(() => {
    const date = parseISO(selectedDate);
    if (isToday(date)) return "Aujourd'hui";
    setDefaultOptions({ locale: fr });

return format(date, 'EEEE d MMMM yyyy');
    
  }, [selectedDate]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement de l’agenda…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Agenda</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {subtitleText}
        </Text>
      </View>

      {/* Calendrier */}
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType="multi-dot"
          enableSwipeMonths
          theme={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            calendarBackground: isDark ? '#1e293b' : '#ffffff',
            textDayStyle: { color: isDark ? '#e2e8f0' : '#0f172a' },
            textDisabledColor: isDark ? '#475569' : '#cbd5e1',
            monthTextColor: isDark ? '#e2e8f0' : '#0f172a',
            arrowColor: '#6366f1',
            todayTextColor: '#6366f1',
            selectedDayBackgroundColor: '#6366f1',
            selectedDayTextColor: '#ffffff',
            dotColor: '#6366f1',
          }}
        />
      </View>

      {/* Liste */}
      <FlashList
        data={filteredTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onDelete={() => removeTask(item.id)}
            onToggleDone={() => toggleTaskDone(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={64} color={isDark ? '#475569' : '#D1D5DB'} />
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
              {isPast(parseISO(selectedDate)) ? 'Rien de prévu' : 'Aucune tâche'}
            </Text>
            <Text style={[styles.emptyMessage, isDark && styles.emptyMessageDark]}>
              {isPast(parseISO(selectedDate))
                ? 'Aucune tâche n’était prévue ce jour-là.'
                : 'Ajoutez une tâche pour cette date !'}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/new-task')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Créer une tâche</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, isDark && styles.fabDark]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/new-task');
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  titleDark: {
    color: '#f1f5f9',
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    marginTop: 4,
  },
  subtitleDark: {
    color: '#94a3b8',
  },

  calendarCard: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: '#f1f5f9',
  },

  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyMessageDark: {
    color: '#94a3b8',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 24,
    gap: 8,
  },

  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366f1',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabDark: {
    backgroundColor: '#818cf8',
    shadowColor: '#818cf8',
  },
});