// app/new-task.tsx
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import useTasks from '../hooks/useTasks';
import { scheduleNotification } from '../utils/notifications'; // À créer

export default function NewTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date()); // TODO: picker date
  const [repeat, setRepeat] = useState('none'); // 'daily', 'weekly'

  const handleSave = async () => {
    const newTask = { id: Date.now().toString(), title, date, repeat, done: false };
    addTask(newTask);
    await scheduleNotification(newTask); // Programme rappel
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.close}>
        <MaterialIcons name="close" size={28} color="#1A1B1E" />
      </TouchableOpacity>
      <Text style={styles.title}>Nouvelle tâche</Text>
      <TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} />
      {/* TODO: DatePicker + Repeat selector */}
      <TouchableOpacity style={styles.save} onPress={handleSave}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  close: { alignSelf: 'flex-end' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20 },
  save: { backgroundColor: '#5C7CFA', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold' },
});