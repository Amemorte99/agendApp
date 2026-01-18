// app/new-task.tsx
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTaskStore } from '../stores/taskStore';

export default function NewTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { addNewTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const now = new Date();

  const handleDateChange = useCallback(
    (_: any, date?: Date) => {
      if (Platform.OS === 'android') setShowDatePicker(false);
      if (date) setSelectedDate(date);
    },
    []
  );

  const handleTimeChange = useCallback(
    (_: any, time?: Date) => {
      if (Platform.OS === 'android') setShowTimePicker(false);
      if (time && selectedDate) {
        const newDate = new Date(selectedDate);
        newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        setSelectedDate(newDate);
      }
    },
    [selectedDate]
  );

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Erreur', 'Sélectionnez date et heure');
      return;
    }

    if (selectedDate <= now) {
      Alert.alert('Erreur', 'La tâche doit être dans le futur');
      return;
    }

    try {
      await addNewTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate.toISOString(),
        repeat,
      });

      Alert.alert('Succès', 'Tâche créée !', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Erreur création tâche:', err);
      Alert.alert('Erreur', 'Impossible d’ajouter la tâche');
    }
  }, [title, description, selectedDate, repeat, router, addNewTask]);

  const dateDisplay = selectedDate
    ? selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Sélectionner';

  const timeDisplay = selectedDate
    ? selectedDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Sélectionner';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={isDark ? '#E2E8F0' : '#334155'}
            />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.titleDark]}>
            Nouvelle tâche
          </Text>

          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Titre */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.inputRow}>
              <MaterialIcons
                name="title"
                size={24}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Titre de la tâche *"
                placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                value={title}
                onChangeText={setTitle}
                autoFocus
                autoCapitalize="sentences"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Description */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.inputRow}>
              <MaterialIcons
                name="notes"
                size={24}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
              <TextInput
                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                placeholder="Description (facultatif)"
                placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Date & Heure */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Quand ?
            </Text>

            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#6366f1" />
              <Text style={[styles.fieldValue, isDark && styles.fieldValueDark]}>
                {dateDisplay}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fieldRow, !selectedDate && styles.disabledRow]}
              onPress={() => selectedDate && setShowTimePicker(true)}
              disabled={!selectedDate}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color={selectedDate ? '#6366f1' : '#94A3B8'}
              />
              <Text style={[styles.fieldValue, isDark && styles.fieldValueDark]}>
                {timeDisplay}
              </Text>
            </TouchableOpacity>

            {/* Pickers */}
            {Platform.OS !== 'web' && showDatePicker && (
              <DateTimePicker
                value={selectedDate || now}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                minimumDate={now}
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
          </View>

          {/* Répétition */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Répéter
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {[
                { label: 'Aucune', value: 'none' },
                { label: 'Tous les jours', value: 'daily' },
                { label: 'Toutes les semaines', value: 'weekly' },
                { label: 'Tous les mois', value: 'monthly' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.repeatChip,
                    repeat === item.value && styles.repeatChipActive,
                    isDark && styles.repeatChipDark,
                    repeat === item.value && isDark && styles.repeatChipActiveDark,
                  ]}
                  onPress={() => setRepeat(item.value as any)}
                >
                  <Text
                    style={[
                      styles.repeatChipText,
                      repeat === item.value && styles.repeatChipTextActive,
                      isDark && styles.repeatChipTextDark,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bouton Ajouter */}
          <TouchableOpacity
            style={[styles.saveButton, isDark && styles.saveButtonDark]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.saveButtonText}>Créer la tâche</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderBottomColor: '#334155',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  titleDark: {
    color: '#F1F5F9',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 4,
  },
  inputDark: {
    color: '#E2E8F0',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#CBD5E1',
  },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  disabledRow: {
    opacity: 0.5,
  },

  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  fieldValueDark: {
    color: '#E2E8F0',
  },

  chipContainer: {
    paddingVertical: 8,
    gap: 12,
  },

  repeatChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  repeatChipDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },

  repeatChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  repeatChipActiveDark: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
    shadowColor: '#818CF8',
  },

  repeatChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  repeatChipTextDark: {
    color: '#CBD5E1',
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
    marginTop: 32,
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  saveButtonDark: {
    backgroundColor: '#818CF8',
    shadowColor: '#818CF8',
  },

  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
});