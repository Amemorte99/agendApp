// components/TaskCard.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task } from '../data/database'; // Assure-toi que ce chemin est correct

interface Props {
  task: Task;
  onDelete: () => void;
  onToggleDone: () => void;
}

export default function TaskCard({ task, onDelete, onToggleDone }: Props) {
  const router = useRouter();

  const handleDeletePress = () => {
    Alert.alert(
      'Supprimer la tâche ?',
      'Cette action est irréversible',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, task.done && styles.cardDone]}
      onPress={() => router.push(`/task/${task.id}`)} // Ouvre les détails au clic sur la carte
      activeOpacity={0.8}
    >
      {/* Checkbox / Done */}
      <TouchableOpacity onPress={onToggleDone} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <MaterialIcons
          name={task.done ? 'check-circle' : 'radio-button-unchecked'}
          size={32}
          color={task.done ? '#10b981' : '#9ca3af'}
        />
      </TouchableOpacity>

      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={[styles.title, task.done && styles.titleDone]}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {task.description}
          </Text>
        ) : null}

        <Text style={styles.time}>
          {new Date(task.date).toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>

      {/* Bouton Supprimer */}
      <TouchableOpacity onPress={handleDeletePress} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <MaterialIcons name="delete-outline" size={28} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardDone: {
    backgroundColor: '#f0fdf4',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: '#5c7cfa',
    marginTop: 6,
    fontWeight: '500',
  },
});