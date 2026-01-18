// components/TaskCard.tsx
import { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Task } from '../data/database';

interface Props {
  task: Task;
  onDelete: () => void;
  onToggleDone: () => void;
}

export default function TaskCard({ task, onDelete, onToggleDone }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Correction ici : utilisation correcte de Animated.Value
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  }, [scale]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Supprimer la tâche ?',
      'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete();
          },
        },
      ]
    );
  }, [onDelete]);

  const handleToggleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleDone();
  }, [onToggleDone]);

  const handleCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/task/${task.id}`);
  }, [task.id, router]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          task.done && styles.cardDone,
          isDark && styles.cardDark,
        ]}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.88}
      >
        {/* Done toggle */}
        <TouchableOpacity
          onPress={handleToggleDone}
          hitSlop={28}
          style={styles.checkbox}
        >
          <MaterialIcons
            name={task.done ? 'check-circle' : 'radio-button-unchecked'}
            size={38}
            color={
              task.done
                ? isDark
                  ? '#34d399'
                  : '#10b981'
                : isDark
                ? '#6b7280'
                : '#9ca3af'
            }
          />
        </TouchableOpacity>

        {/* Contenu */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              task.done && styles.titleDone,
              isDark && styles.titleDark,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[
                styles.description,
                isDark && styles.descriptionDark,
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {task.description}
            </Text>
          ) : null}

          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={isDark ? '#94a3b8' : '#64748b'}
            />
            <Text style={[styles.time, isDark && styles.timeDark]}>
              {new Date(task.date).toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={handleDeletePress}
          hitSlop={28}
          style={styles.deleteBtn}
        >
          <MaterialIcons
            name="delete-outline"
            size={28}
            color={isDark ? '#f87171' : '#ef4444'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.35,
  },
  cardDone: {
    backgroundColor: '#f0fdf4',
    opacity: 0.94,
  },

  checkbox: {
    padding: 6,
  },

  content: {
    flex: 1,
    marginHorizontal: 16,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  titleDark: {
    color: '#f1f5f9',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },

  description: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#94a3b8',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },

  time: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  timeDark: {
    color: '#818cf8',
  },

  deleteBtn: {
    padding: 8,
  },
});