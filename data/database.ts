// data/database.ts - Point d'entrée principal
import { Platform } from 'react-native';

// 1. Définir l'interface Task ici (visible partout)
export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
  notified: boolean;
  createdAt: string;
}

// 2. Définir les types des fonctions (pour que TS soit heureux)
type AddTaskFn = (task: Omit<Task, 'id' | 'createdAt'>) => string;
type GetAllTasksFn = () => Task[];
type GetTasksForTodayFn = () => Task[];
type UpdateTaskFn = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
type DeleteTaskFn = (id: string) => void;
type InitDatabaseFn = () => void;

// 3. Importer conditionnellement les implémentations natives/web
let impl: {
  initDatabase: InitDatabaseFn;
  addTask: AddTaskFn;
  getAllTasks: GetAllTasksFn;
  getTasksForToday: GetTasksForTodayFn;
  updateTask: UpdateTaskFn;
  deleteTask: DeleteTaskFn;
};

if (Platform.OS === 'web') {
  impl = require('./database.web').default || require('./database.web');
} else {
  impl = require('./database.native').default || require('./database.native');
}

// 4. Exporter les fonctions typées
export const initDatabase: InitDatabaseFn = impl.initDatabase;
export const addTask: AddTaskFn = impl.addTask;
export const getAllTasks: GetAllTasksFn = impl.getAllTasks;
export const getTasksForToday: GetTasksForTodayFn = impl.getTasksForToday || impl.getAllTasks;
export const updateTask: UpdateTaskFn = impl.updateTask || (() => {});
export const deleteTask: DeleteTaskFn = impl.deleteTask || (() => {});