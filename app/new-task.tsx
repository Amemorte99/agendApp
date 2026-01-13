// app/new-task.tsx
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  View
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

 const handleSave = async () => {
  if (!title.trim()) {
    return Alert.alert('Erreur', 'Le titre est obligatoire');
  }

  if (!selectedDate) {
    return Alert.alert('Erreur', 'Veuillez sélectionner la date ET l’heure');
  }

  const now = new Date();

  // Règle : date/heure doit être dans le futur (strictement > maintenant)
  if (selectedDate <= now) {
    return Alert.alert(
      'Erreur',
      'La date et l’heure doivent être dans le futur.\n' +
      'Si c’est aujourd’hui, choisis une heure supérieure à maintenant.'
    );
  }

  try {
    await addNewTask({
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDate.toISOString(),
      repeat,
      done: false,
      notified: false
    });

    Alert.alert('Succès', 'Tâche ajoutée avec succès !', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  } catch (err) {
    console.error('Erreur ajout tâche:', err);
    Alert.alert('Erreur', 'Impossible d’ajouter la tâche');
  }
};
  const dateDisplay = selectedDate
    ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'À sélectionner';

  const timeDisplay = selectedDate
    ? selectedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : 'À sélectionner';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={26} color={isDark ? '#F1F5F9' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.textDark]}>Nouvelle tâche</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Titre */}
          <View style={[styles.inputGroup, isDark && styles.inputGroupDark]}>
            <MaterialIcons name="title" size={24} color={isDark ? '#94A3B8' : '#6366F1'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Titre *"
              placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
              value={title}
              onChangeText={setTitle}
              autoFocus
              autoCapitalize="sentences"
            />
          </View>

          {/* Description */}
          <View style={[styles.inputGroup, isDark && styles.inputGroupDark]}>
            <MaterialIcons name="notes" size={24} color={isDark ? '#94A3B8' : '#6366F1'} style={styles.inputIcon} />
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

          {/* Date & Heure */}
          <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Date et heure *</Text>

            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={24} color="#6366F1" />
              <Text style={[styles.fieldText, isDark && styles.textDark]}>
                {dateDisplay}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fieldRow, !selectedDate && styles.disabled]}
              onPress={() => selectedDate && setShowTimePicker(true)}
              disabled={!selectedDate}
            >
              <MaterialIcons
                name="access-time"
                size={24}
                color={selectedDate ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.fieldText, isDark && styles.textDark]}>
                {timeDisplay}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pickers */}
          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              accentColor="#6366F1"
            />
          )}

          {Platform.OS !== 'web' && showTimePicker && selectedDate && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleTimeChange}
              is24Hour={true}
              accentColor="#6366F1"
            />
          )}

          {/* Web fallback */}
          {Platform.OS === 'web' && (
            <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Date et heure (web)
              </Text>
              <TextInput
                style={[styles.webInput, isDark && styles.inputDark]}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChangeText={(text) => {
                  if (text.length === 10) {
                    const d = new Date(text);
                    if (!isNaN(d.getTime())) setSelectedDate(d);
                  }
                }}
              />
              <TextInput
                style={[styles.webInput, isDark && styles.inputDark]}
                placeholder="HH:MM"
                placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                value={selectedDate ? selectedDate.toTimeString().slice(0, 5) : ''}
                onChangeText={(text) => {
                  if (text.length === 5 && selectedDate) {
                    const [h, m] = text.split(':').map(Number);
                    const newDate = new Date(selectedDate);
                    newDate.setHours(h || 0, m || 0, 0);
                    setSelectedDate(newDate);
                  }
                }}
              />
            </View>
          )}

          {/* Répétition */}
          <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Répéter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
              {[
                { label: 'Aucune', value: 'none' },
                { label: 'Quotidien', value: 'daily' },
                { label: 'Hebdomadaire', value: 'weekly' },
                { label: 'Mensuel', value: 'monthly' },
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
                      isDark && styles.textDark,
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
            <Text style={styles.saveButtonText}>Ajouter la tâche</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  textDark: {
    color: '#F1F5F9',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroupDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  inputDark: {
    color: '#F1F5F9',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fieldText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  chipContainer: {
    paddingVertical: 8,
  },
  repeatChip: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  repeatChipDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  repeatChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
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
    color: '#374151',
    fontWeight: '600',
  },
  repeatChipTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#6366F1',
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
    letterSpacing: 0.5,
  },
});