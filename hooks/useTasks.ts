// hooks/useTasks.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Pro : persistance

type Task = { id: string; title: string; date: Date; repeat: string; done: boolean };

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  completeTask: (id: string) => void;
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, done: true } : t),
  })),
}));

// Persistance pro
useTaskStore.subscribe(async (state) => {
  await AsyncStorage.setItem('tasks', JSON.stringify(state.tasks));
});

export default useTaskStore;