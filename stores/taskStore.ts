// stores/taskStore.ts
import { cancelTaskReminder, scheduleTaskReminder } from '@/utils/notifications';
import { create } from 'zustand';
import {
  Task,
  addTask,
  deleteTask,
  getAllTasks,
  getTasksForToday,
  updateTask,
} from '../data/database';

interface TaskState {
  allTasks: Task[];
  todayTasks: Task[];
  loading: boolean;

  fetchAllTasks: () => Promise<void>;
  fetchTodayTasks: () => Promise<void>;

  addNewTask: (
    taskData: Omit<Task, 'id' | 'createdAt' | 'done' | 'notified'>
  ) => Promise<Task>;

  toggleTaskDone: (id: string) => Promise<void>;
  updateExistingTask: (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  allTasks: [],
  todayTasks: [],
  loading: false,

  // ──────────────────────────────
  // Chargement des tâches
  // ──────────────────────────────
  fetchAllTasks: async () => {
    set({ loading: true });
    try {
      const tasks = await getAllTasks();
      set({ allTasks: tasks, loading: false });
    } catch (err) {
      console.error('[TaskStore] fetchAllTasks:', err);
      set({ loading: false });
    }
  },

  fetchTodayTasks: async () => {
    set({ loading: true });
    try {
      const tasks = await getTasksForToday();
      set({ todayTasks: tasks, loading: false });
    } catch (err) {
      console.error('[TaskStore] fetchTodayTasks:', err);
      set({ loading: false });
    }
  },

  // ──────────────────────────────
  // Ajouter une tâche
  // ──────────────────────────────
  addNewTask: async (taskData) => {
    const createdTask = await addTask(taskData);

    const today = new Date().toISOString().split('T')[0];

    set((state) => ({
      allTasks: [...state.allTasks, createdTask],
      todayTasks: createdTask.date.startsWith(today)
        ? [...state.todayTasks, createdTask]
        : state.todayTasks,
    }));

    // Programmer notification si nécessaire
    await scheduleTaskReminder(createdTask);

    return createdTask;
  },

  // ──────────────────────────────
  // Basculer "done" / "non done"
  // ──────────────────────────────
  toggleTaskDone: async (id) => {
    const task = get().allTasks.find((t) => t.id === id);
    if (!task) return;

    const newDone = !task.done;
    await updateTask(id, { done: newDone });

    const updatedTask = { ...task, done: newDone };

    set((state) => ({
      allTasks: state.allTasks.map((t) => (t.id === id ? updatedTask : t)),
      todayTasks: state.todayTasks.map((t) => (t.id === id ? updatedTask : t)),
    }));

    if (newDone) {
      await cancelTaskReminder(id);
    }
  },

  // ──────────────────────────────
  // Mettre à jour une tâche
  // ──────────────────────────────
  updateExistingTask: async (id, updates) => {
    await updateTask(id, updates);

    const currentTask = get().allTasks.find((t) => t.id === id);
    if (!currentTask) return;

    const finalTask = { ...currentTask, ...updates };
    const today = new Date().toISOString().split('T')[0];

    set((state) => ({
      allTasks: state.allTasks.map((t) => (t.id === id ? finalTask : t)),
      todayTasks: finalTask.date.startsWith(today)
        ? state.todayTasks.some((t) => t.id === id)
          ? state.todayTasks.map((t) => (t.id === id ? finalTask : t))
          : [...state.todayTasks, finalTask]
        : state.todayTasks.filter((t) => t.id !== id),
    }));

    // Reprogrammer la notification si la date ou répétition change
    if ('date' in updates || 'repeat' in updates) {
      await scheduleTaskReminder(finalTask);
    }
  },

  // ──────────────────────────────
  // Supprimer une tâche
  // ──────────────────────────────
  removeTask: async (id) => {
    await cancelTaskReminder(id);
    await deleteTask(id);

    set((state) => ({
      allTasks: state.allTasks.filter((t) => t.id !== id),
      todayTasks: state.todayTasks.filter((t) => t.id !== id),
    }));
  },
}));
