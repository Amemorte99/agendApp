// app/new-task.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';
import { useTaskStore } from '../stores/taskStore'; // ← Utilise le store pour instantanéité

export default function NewTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addNewTask } = useTaskStore(); // ← Mise à jour instantanée via store

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

  const handleSave = () => {
    if (!title.trim()) {
      return Alert.alert('Erreur', 'Le titre est obligatoire');
    }

    if (!selectedDate) {
      return Alert.alert('Erreur', 'Veuillez sélectionner la date ET l’heure');
    }

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (selectedDate < now || (isToday && selectedDate.getTime() <= now.getTime())) {
      return Alert.alert(
        'Erreur',
        'La date/heure doit être dans le futur. Pour aujourd’hui, l’heure doit être supérieure à maintenant.'
      );
    }

    try {
      addNewTask({
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
      console.error('Erreur sauvegarde:', err);
      Alert.alert('Erreur', 'Impossible d’ajouter la tâche');
    }
  };

  const dateDisplay = selectedDate
    ? selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'À sélectionner';

  const timeDisplay = selectedDate
    ? selectedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : 'À sélectionner';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.textDark]}>Nouvelle tâche</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="title" size={24} color={isDark ? '#94A3B8' : '#64748B'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Titre de la tâche *"
              placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="notes" size={24} color={isDark ? '#94A3B8' : '#64748B'} style={styles.inputIcon} />
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

            <TouchableOpacity style={styles.field} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={24} color="#6366F1" />
              <Text style={[styles.fieldValue, isDark && styles.textDark]}>
                {dateDisplay}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.field, !selectedDate && styles.disabled]}
              onPress={() => selectedDate && setShowTimePicker(true)}
              disabled={!selectedDate}
            >
              <MaterialIcons
                name="access-time"
                size={24}
                color={selectedDate ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.fieldValue, isDark && styles.textDark]}>
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

          {/* Fallback web */}
          {Platform.OS === 'web' && (
            <View style={styles.webFallback}>
              <Text style={[styles.webNote, isDark && styles.textDarkSub]}>
                Sur web : utilisez les champs ci-dessous
              </Text>
              <TextInput
                style={[styles.webInput, isDark && styles.inputDark]}
                placeholder="Date (AAAA-MM-JJ)"
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
                placeholder="Heure (HH:MM)"
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

          {/* Bouton sauvegarde */}
          <TouchableOpacity
            style={[styles.saveButton, isDark && styles.saveButtonDark]}
            onPress={handleSave}
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
    paddingVertical: 16,
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
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  inputDark: {
    backgroundColor: '#1E293B',
    color: '#F1F5F9',
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fieldValue: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  webFallback: {
    marginBottom: 24,
  },
  webNote: {
    color: '#64748B',
    marginBottom: 12,
    fontSize: 14,
  },
  webInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    fontSize: 16,
  },
  repeatSection: {
    marginBottom: 32,
  },
  repeatChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  repeatChipDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  repeatChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  repeatChipActiveDark: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  repeatChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  repeatChipTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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