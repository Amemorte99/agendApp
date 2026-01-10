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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask } from '../data/database';

export default function NewTaskScreen() {
  const router = useRouter();

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
    if (!title.trim()) return Alert.alert('Erreur', 'Titre obligatoire');
    if (!selectedDate) return Alert.alert('Erreur', 'Date et heure obligatoires');
    if (selectedDate < new Date()) return Alert.alert('Erreur', 'Date dans le futur svp');

    try {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate.toISOString(),
        repeat,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle tâche</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Titre */}
        <TextInput
          style={styles.input}
          placeholder="Titre de la tâche *"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Description */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (facultatif)"
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Date & Heure */}
        <View style={styles.dateTimeSection}>
          <Text style={styles.sectionTitle}>Date et heure *</Text>

          {/* Champ Date */}
          <TouchableOpacity style={styles.field} onPress={() => setShowDatePicker(true)}>
            <MaterialIcons name="calendar-today" size={24} color="#5c7cfa" />
            <View style={styles.fieldText}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={[styles.fieldValue, !selectedDate && styles.placeholder]}>
                {dateDisplay}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Champ Heure */}
          <TouchableOpacity
            style={[styles.field, !selectedDate && styles.disabled]}
            onPress={() => selectedDate && setShowTimePicker(true)}
            disabled={!selectedDate}
          >
            <MaterialIcons
              name="access-time"
              size={24}
              color={selectedDate ? '#5c7cfa' : '#d1d5db'}
            />
            <View style={styles.fieldText}>
              <Text style={styles.fieldLabel}>Heure</Text>
              <Text style={[styles.fieldValue, !selectedDate && styles.placeholder]}>
                {timeDisplay}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pickers mobiles */}
        {Platform.OS !== 'web' && showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            themeVariant="light" // Force le thème clair → évite le blanc total
          />
        )}

        {Platform.OS !== 'web' && showTimePicker && selectedDate && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            is24Hour={true}
            themeVariant="light"
          />
        )}

        {/* Fallback web */}
        {Platform.OS === 'web' && (
          <View style={styles.webFallback}>
            <Text style={styles.webNote}>Sur web : utilisez les champs ci-dessous</Text>
            <TextInput
              style={styles.webInput}
              placeholder="Date (AAAA-MM-JJ)"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChangeText={(text) => {
                if (text.length === 10) {
                  const d = new Date(text);
                  if (!isNaN(d.getTime())) setSelectedDate(d);
                }
              }}
            />
            <TextInput
              style={styles.webInput}
              placeholder="Heure (HH:MM)"
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
        <View style={styles.repeatSection}>
          <Text style={styles.sectionTitle}>Répéter</Text>
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
                ]}
                onPress={() => setRepeat(item.value as any)}
              >
                <Text
                  style={[
                    styles.repeatChipText,
                    repeat === item.value && styles.repeatChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bouton sauvegarde */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Ajouter la tâche</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 20 },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    color: '#111827',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  dateTimeSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  disabled: { opacity: 0.5 },
  fieldText: { flex: 1, marginLeft: 16 },
  fieldLabel: { fontSize: 15, color: '#6b7280', marginBottom: 4 },
  fieldValue: { fontSize: 16, color: '#111827', fontWeight: '500' },
  placeholder: { color: '#9ca3af', fontStyle: 'italic' },

  webFallback: { marginBottom: 24 },
  webNote: { color: '#6b7280', marginBottom: 12, fontSize: 14 },
  webInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    fontSize: 16,
  },

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
  repeatChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  repeatChipTextActive: { color: 'white' },

  saveButton: {
    backgroundColor: '#5c7cfa',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#5c7cfa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
});