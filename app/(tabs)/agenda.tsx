import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData, CalendarMarkingProps } from 'react-native-calendars';
import { FlashList } from '@shopify/flash-list';
import { parseISO, format, isValid, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/taskStore';
import { Task } from '../../data/database';

// ──────────────────────────────────────────────
// Normaliser une date (YYYY-MM-DD)
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
  const { allTasks, fetchAllTasks, removeTask, toggleTaskDone, loading } =
    useTaskStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  // ──────────────────────────────────────────────
  // Charger toutes les tâches
  // ──────────────────────────────────────────────
  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // ──────────────────────────────────────────────
  // Filtrer les tâches par date
  // ──────────────────────────────────────────────
  const filteredTasks = useMemo<Task[]>(() => {
    return allTasks
      .filter((task) => normalizeDate(task.date) === selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allTasks, selectedDate]);

  // ──────────────────────────────────────────────
  // Marquage des jours avec tâches
  // ──────────────────────────────────────────────
  const markedDates: CalendarMarkingProps['markedDates'] = useMemo(() => {
    const marks: Record<string, any> = {};
    allTasks.forEach((task) => {
      const day = normalizeDate(task.date);
      if (day) {
        if (!marks[day]) marks[day] = { dots: [] };
        marks[day].dots.push({ key: task.id, color: '#6366F1' });
      }
    });

    // Sélection actuelle
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || { dots: [] }),
        selected: true,
        selectedColor: '#6366F1',
      };
    }

    return marks;
  }, [allTasks, selectedDate]);

  const handleDateSelect = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const subtitleText = useMemo(() => {
    if (!selectedDate) return 'Toutes les tâches';
    try {
      const date = parseISO(selectedDate);
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const emptyIsPast = selectedDate ? isPast(parseISO(selectedDate)) : false;

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Chargement de l’agenda…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.subtitle}>{subtitleText}</Text>
      </View>

      {/* Calendrier mensuel */}
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            todayTextColor: '#6366F1',
            arrowColor: '#6366F1',
            monthTextColor: '#111827',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
          }}
        />
      </View>

      {/* Liste des tâches ou état vide */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-clear-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {emptyIsPast ? 'Rien de prévu' : 'Aucune tâche'}
          </Text>
          <Text style={styles.emptyMessage}>
            {emptyIsPast
              ? 'Aucune tâche n’était prévue ce jour-là.'
              : 'Ajoutez une tâche pour cette date !'}
          </Text>
        </View>
      ) : (
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
          estimatedItemSize={104}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  calendarWrapper: { height: 360 }, // <-- obligatoire pour iOS
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  header: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, fontWeight: '500', color: '#4B5563', marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 140 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptyMessage: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
});
