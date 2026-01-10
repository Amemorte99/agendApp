// app/task/[id].tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllTasks, updateTask, deleteTask } from '@/data/database';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Charger la tâche au montage
  useEffect(() => {
    const allTasks = getAllTasks();
    const foundTask = allTasks.find(t => t.id === id);
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      setSelectedDate(new Date(foundTask.date));
      setRepeat(foundTask.repeat);
    } else {
      Alert.alert('Erreur', 'Tâche introuvable');
      router.back();
    }
  }, [id]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time && selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      newDate.setSeconds(0);
      setSelectedDate(newDate);
    }
  };

  const handleSaveChanges = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Erreur', 'La date et l’heure sont obligatoires');
      return;
    }

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (selectedDate < now || (isToday && selectedDate.getTime() <= now.getTime())) {
      return Alert.alert('Erreur', 'Pour aujourd’hui, l’heure doit être supérieure à maintenant');
    }

    try {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate.toISOString(),
        repeat,
      });

      Alert.alert('Succès', 'Tâche modifiée avec succès !', [
        { text: 'OK', onPress: () => {
          setIsEditing(false);
          // Recharger la tâche
          const updatedTasks = getAllTasks();
          const updated = updatedTasks.find(t => t.id === id);
          if (updated) setTask(updated);
        }},
      ]);
    } catch (err) {
      console.error('Erreur modification:', err);
      Alert.alert('Erreur', 'Impossible de modifier la tâche');
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer la tâche ?', 'Cette action est irréversible', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          Alert.alert('Supprimée', 'La tâche a été supprimée');
          router.back();
        },
      },
    ]);
  };

  const toggleDone = () => {
    updateTask(task.id, { done: !task.done });
    setTask({ ...task, done: !task.done });
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Modifier la tâche' : task.title}
        </Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <MaterialIcons name={isEditing ? 'close' : 'edit'} size={24} color="#5c7cfa" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            {/* Mode édition */}
            <TextInput
              style={styles.input}
              placeholder="Titre *"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (facultatif)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Date & Heure */}
            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionTitle}>Date et heure *</Text>

              <TouchableOpacity style={styles.field} onPress={() => setShowDatePicker(true)}>
                <MaterialIcons name="calendar-today" size={24} color="#5c7cfa" />
                <Text style={styles.fieldValue}>{dateDisplay}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.field} onPress={() => setShowTimePicker(true)}>
                <MaterialIcons name="access-time" size={24} color="#5c7cfa" />
                <Text style={styles.fieldValue}>{timeDisplay}</Text>
              </TouchableOpacity>
            </View>

            {/* Répétition */}
            <View style={styles.repeatSection}>
              <Text style={styles.sectionTitle}>Répéter</Text>
              <ScrollView horizontal>
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
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Mode affichage */}
            <View style={styles.taskInfo}>
              <TouchableOpacity onPress={toggleDone} style={styles.doneButton}>
                <MaterialIcons
                  name={task.done ? 'check-circle' : 'radio-button-unchecked'}
                  size={40}
                  color={task.done ? '#10b981' : '#9ca3af'}
                />
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.done && styles.taskDone]}>
                  {task.title}
                </Text>

                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}

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

                <Text style={styles.taskRepeat}>
                  Répétition : {task.repeat === 'none' ? 'Aucune' : task.repeat === 'daily' ? 'Tous les jours' : task.repeat === 'weekly' ? 'Toutes les semaines' : 'Tous les mois'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete-forever" size={24} color="white" />
              <Text style={styles.deleteButtonText}>Supprimer la tâche</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Pickers */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date()}
          themeVariant="light"
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && selectedDate && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
          is24Hour={true}
          themeVariant="light"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 20 },

  taskInfo: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  doneButton: { marginRight: 20 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  taskDone: { textDecorationLine: 'line-through', color: '#6b7280' },
  taskDescription: { fontSize: 16, color: '#4b5563', marginTop: 8 },
  taskDate: { fontSize: 16, color: '#5c7cfa', marginTop: 12 },
  taskRepeat: { fontSize: 15, color: '#6b7280', marginTop: 8 },

  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 12 },

  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  dateTimeSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  fieldText: { flex: 1, marginLeft: 16 },
  fieldLabel: { fontSize: 15, color: '#6b7280' },
  fieldValue: { fontSize: 16, color: '#111827', fontWeight: '500' },

  repeatSection: { marginBottom: 32 },
  repeatChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  repeatChipActive: {
    backgroundColor: '#5c7cfa',
    borderColor: '#5c7cfa',
  },
  repeatChipText: { fontSize: 14, color: '#374151' },
  repeatChipTextActive: { color: 'white' },
});