import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

import CalendarMini from '../../components/CalendarMini';
import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../data/database';
import { Ionicons } from '@expo/vector-icons'; // ← ajouter si tu utilises expo-vector-icons

export default function AgendaScreen() {
  const { allTasks, fetchAllTasks, removeTask, toggleTaskDone, isLoading } =
    useTaskStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // ────────────────────────────────────────────────
  // Filtrage robuste + date-fns (très recommandé)
  // ────────────────────────────────────────────────
  const filteredTasks = useMemo<Task[]>(() => {
    if (!selectedDate) return allTasks;

    let targetDate: Date;
    try {
      targetDate = parseISO(selectedDate);
      if (!isValid(targetDate)) return [];
    } catch {
      return [];
    }

    const targetStr = format(targetDate, 'yyyy-MM-dd');

    return allTasks.filter((task) => {
      if (!task.date) return false;
      try {
        const taskDate = parseISO(task.date);
        return format(taskDate, 'yyyy-MM-dd') === targetStr;
      } catch {
        // fallback si format inattendu
        return task.date.startsWith(targetStr);
      }
    });
  }, [allTasks, selectedDate]);

  const handleDateSelect = useCallback((dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }, []);

  const subtitleText = useMemo(() => {
    if (!selectedDate) return 'Toutes les tâches planifiées';

    try {
      const date = parseISO(selectedDate);
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
      // → lundi 13 janvier 2026
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement de l'agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>

        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>{subtitleText}</Text>

          {selectedDate && (
            <TouchableOpacity
              onPress={() => setSelectedDate(null)}
              hitSlop={12}
              style={styles.clearFilter}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Calendrier compact */}
      <CalendarMini
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate ?? undefined}
      />

      {/* Liste ou état vide */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-clear-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {selectedDate ? 'Rien de prévu' : 'Aucune tâche'}
          </Text>
          <Text style={styles.emptyMessage}>
            {selectedDate
              ? 'Aucune tâche pour cette date.\nAjoutez-en une !'
              : 'Votre planning est vide pour le moment.\nCommencez par en créer.'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          estimatedItemSize={104}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: '#F9FAFB',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    textTransform: 'capitalize',
  },

  clearFilter: {
    padding: 4,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140, // espace pour floating action button éventuel
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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

  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});