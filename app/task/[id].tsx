// app/task/[id].tsx
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '@/stores/taskStore';
import { Task } from '@/data/database';
import * as Haptics from 'expo-haptics';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { updateExistingTask, removeTask, toggleTaskDone } = useTaskStore();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Charger la tâche depuis le store
  useEffect(() => {
    const foundTask = useTaskStore.getState().allTasks.find((t) => t.id === id);
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      setSelectedDate(new Date(foundTask.date));
      setRepeat(foundTask.repeat);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Alert.alert('Erreur', 'Tâche introuvable');
      router.back();
    }
  }, [id, router, fadeAnim]);

  const handleDateChange = useCallback((_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  }, []);

  const handleTimeChange = useCallback((_: any, time?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time && selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setSelectedDate(newDate);
    }
  }, [selectedDate]);

  const handleSaveChanges = useCallback(async () => {
    if (!title.trim()) {
      return Alert.alert('Erreur', 'Le titre est obligatoire');
    }

    if (!selectedDate) {
      return Alert.alert('Erreur', 'Date et heure obligatoires');
    }

    const now = new Date();
    if (selectedDate <= now) {
      return Alert.alert('Erreur', 'La tâche doit être dans le futur');
    }

    try {
      await updateExistingTask(task!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate.toISOString(),
        repeat,
      });

      // Le store met à jour allTasks → on recharge depuis le store
      const updatedTask = useTaskStore.getState().allTasks.find((t) => t.id === task!.id);
      if (updatedTask) setTask(updatedTask);

      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Tâche modifiée !');
    } catch (err) {
      console.error('Erreur modification:', err);
      Alert.alert('Erreur', 'Impossible de modifier la tâche');
    }
  }, [task, title, description, selectedDate, repeat, updateExistingTask]);

  const handleDelete = useCallback(() => {
    Alert.alert('Supprimer ?', 'Cette action est irréversible', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeTask(task!.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Supprimée', 'La tâche a été supprimée');
          router.back();
        },
      },
    ]);
  }, [task?.id, removeTask, router]);

  const toggleDone = useCallback(() => {
    toggleTaskDone(task!.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [task?.id, toggleTaskDone]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const dateDisplay = selectedDate
    ? selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Non défini';

  const timeDisplay = selectedDate
    ? selectedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : 'Non défini';

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
          <MaterialIcons name="arrow-back" size={28} color="#334155" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {isEditing ? 'Modifier' : task.title}
        </Text>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsEditing(!isEditing);
          }}
          hitSlop={16}
        >
          <MaterialIcons
            name={isEditing ? 'close' : 'edit'}
            size={26}
            color={isEditing ? '#ef4444' : '#6366f1'}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <View style={styles.editContainer}>
            {/* Titre */}
            <View style={styles.inputGroup}>
              <MaterialIcons name="title" size={24} color="#6366f1" />
              <TextInput
                style={styles.input}
                placeholder="Titre *"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <MaterialIcons name="notes" size={24} color="#6366f1" />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (facultatif)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Date & Heure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date et heure *</Text>

              <TouchableOpacity style={styles.field} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={24} color="#6366f1" />
                <Text style={styles.fieldValue}>{dateDisplay}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.field} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={24} color="#6366f1" />
                <Text style={styles.fieldValue}>{timeDisplay}</Text>
              </TouchableOpacity>
            </View>

            {/* Répétition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Répéter</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['none', 'daily', 'weekly', 'monthly'].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.repeatChip,
                      repeat === value && styles.repeatChipActive,
                    ]}
                    onPress={() => setRepeat(value as any)}
                  >
                    <Text
                      style={[
                        styles.repeatChipText,
                        repeat === value && styles.repeatChipTextActive,
                      ]}
                    >
                      {value === 'none' ? 'Aucune' : value === 'daily' ? 'Quotidien' : value === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[styles.taskContainer, { opacity: fadeAnim }]}>
            <View style={styles.taskCard}>
              <TouchableOpacity onPress={toggleDone} style={styles.doneButton}>
                <MaterialIcons
                  name={task.done ? 'check-circle' : 'radio-button-unchecked'}
                  size={48}
                  color={task.done ? '#10b981' : '#94a3af'}
                />
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.done && styles.taskDone]}>
                  {task.title}
                </Text>

                {task.description ? (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                ) : null}

                <View style={styles.taskMeta}>
                  <Ionicons name="calendar-outline" size={18} color="#6366f1" />
                  <Text style={styles.taskDate}>
                    {new Date(task.date).toLocaleString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.taskMeta}>
                  <Ionicons name="repeat-outline" size={18} color="#6366f1" />
                  <Text style={styles.taskRepeat}>
                    {task.repeat === 'none'
                      ? 'Aucune répétition'
                      : task.repeat === 'daily'
                      ? 'Tous les jours'
                      : task.repeat === 'weekly'
                      ? 'Toutes les semaines'
                      : 'Tous les mois'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete-forever" size={24} color="white" />
              <Text style={styles.deleteButtonText}>Supprimer la tâche</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Pickers */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          accentColor="#6366f1"
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && selectedDate && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleTimeChange}
          is24Hour={true}
          accentColor="#6366f1"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  editContainer: {
    gap: 16,
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 12,
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },

  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },

  repeatChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },

  repeatChipActive: {
    backgroundColor: '#6366f1',
  },

  repeatChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },

  repeatChipTextActive: {
    color: 'white',
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 24,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },

  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },

  taskContainer: {
    padding: 16,
  },

  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  doneButton: {
    marginRight: 20,
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },

  taskDone: {
    textDecorationLine: 'line-through',
    color: '#94a3af',
  },

  taskDescription: {
    fontSize: 16,
    color: '#475569',
    marginTop: 8,
    lineHeight: 24,
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  taskDate: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '500',
  },

  taskRepeat: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  loading: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
});