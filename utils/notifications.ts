// utils/notifications.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Task } from '@/app/(tabs)/tasks'; // adapte le chemin selon ton projet

const NOTIFICATION_ID_PREFIX = 'task-reminder-';

/**
 * Configure les permissions et le canal Android
 */
export async function setupNotifications(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission refusée');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks-reminders', {
      name: 'Rappels de tâches',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 400, 200, 400],
      lightColor: '#6366f1',
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableLights: true,
      enableVibrate: true,
    });
  }

  return true;
}

/**
 * Crée le trigger pour une tâche récurrente
 */
function createTrigger(task: Task): Notifications.NotificationTriggerInput | null {
  const taskTime = new Date(task.date);

  if (Number.isNaN(taskTime.getTime())) {
    console.warn(`[Notifications] Date invalide pour la tâche ${task.id}`);
    return null;
  }

  const hour = taskTime.getHours();
  const minute = taskTime.getMinutes();
  const weekday = taskTime.getDay() + 1; // 1=dimanche ... 7=samedi
  const dayOfMonth = taskTime.getDate();

  switch (task.repeat) {
    case 'daily':
      return { type: 'daily' as const, hour, minute };
    case 'weekly':
      return { type: 'weekly' as const, weekday, hour, minute };
    case 'monthly':
      return { type: 'monthly' as const, day: dayOfMonth, hour, minute };
    default:
      return null;
  }
}

/**
 * Programme le rappel pour une tâche
 */
export async function scheduleTaskReminder(task: Task): Promise<boolean> {
  // Annule les notifications existantes
  await cancelTaskReminder(task.id);

  // Pas de notification si tâche terminée ou aucune répétition
  if (task.done || task.repeat === 'none') {
    console.debug(`[Notifications] Aucun rappel pour ${task.id} (terminée ou aucune répétition)`);
    return false;
  }

  const trigger = createTrigger(task);
  if (!trigger) return false;

  try {
    const identifier = `${NOTIFICATION_ID_PREFIX}${task.id}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Rappel de tâche',
        body: task.title,
        subtitle: task.repeat !== 'none' ? `(${task.repeat})` : undefined,
        data: {
          taskId: task.id,
          route: 'task',
          params: { id: task.id },
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#6366f1',
        sticky: false,
      },
      trigger,
    });

    console.info(`[Notifications] Programmée → ${task.id} (${task.repeat})`);
    return true;
  } catch (err) {
    console.error('[Notifications] Échec de programmation :', err);
    return false;
  }
}

/**
 * Annule la notification d'une tâche
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`${NOTIFICATION_ID_PREFIX}${taskId}`);
    console.info(`[Notifications] Annulée → ${taskId}`);
  } catch (err) {
    console.warn('[Notifications] Annulation impossible :', err);
  }
}

/**
 * Gestion de l'ouverture depuis une notification
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as
    | { taskId?: string; route?: string; params?: { id: string } }
    | undefined;

  if (data?.taskId) {
    console.log(`[Notifications] Ouverture tâche depuis notif : ${data.taskId}`);
    // → ici tu peux router avec expo-router si besoin
    // router.push(`/task/${data.taskId}`);
  }
}
