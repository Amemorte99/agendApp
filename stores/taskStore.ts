// stores/taskStore.ts
import { create } from 'zustand';
import {
  Task,
  getAllTasks,
  getTasksForToday,
  addTask,
  updateTask,
  deleteTask,
} from '../data/database';

interface TaskState {
  allTasks: Task[];
  todayTasks: Task[];
  loading: boolean;

  fetchAllTasks: () => void;
  fetchTodayTasks: () => void;
  addNewTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'done' | 'notified'>) => void;
  toggleTaskDone: (id: string) => void;
  updateExistingTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  allTasks: [],
  todayTasks: [],
  loading: false,

  fetchAllTasks: () => {
    set({ loading: true });
    const tasks = getAllTasks();
    set({ allTasks: tasks, loading: false });
  },

  fetchTodayTasks: () => {
    set({ loading: true });
    const tasks = getTasksForToday();
    set({ todayTasks: tasks, loading: false });
  },

  addNewTask: (taskData) => {
    const id = addTask(taskData);

    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
      done: false,
      notified: false,
    };

    const today = new Date().toISOString().split('T')[0];

    set((state) => ({
      allTasks: [...state.allTasks, newTask],
      todayTasks: newTask.date.startsWith(today)
        ? [...state.todayTasks, newTask]
        : state.todayTasks,
    }));
  },

  toggleTaskDone: (id) => {
    const task = get().allTasks.find(t => t.id === id);
    if (!task) return;

    const done = !task.done;
    updateTask(id, { done });

    set((state) => ({
      allTasks: state.allTasks.map(t =>
        t.id === id ? { ...t, done } : t
      ),
      todayTasks: state.todayTasks.map(t =>
        t.id === id ? { ...t, done } : t
      ),
    }));
  },

  updateExistingTask: (id, updates) => {
    updateTask(id, updates);

    set((state) => ({
      allTasks: state.allTasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
      todayTasks: state.todayTasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  removeTask: (id) => {
    deleteTask(id);

    set((state) => ({
      allTasks: state.allTasks.filter(t => t.id !== id),
      todayTasks: state.todayTasks.filter(t => t.id !== id),
    }));
  },
}));
