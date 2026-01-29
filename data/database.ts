// data/database.ts
import { Platform } from 'react-native';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
  notified: boolean;
  createdAt: string;
}

type InitFn = () => void;
type AddFn = (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
type GetAllFn = () => Promise<Task[]>;
type GetTodayFn = () => Promise<Task[]>;
type UpdateFn = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
type DeleteFn = (id: string) => Promise<void>;

let impl: {
  initDatabase: InitFn;
  addTask: AddFn;
  getAllTasks: GetAllFn;
  getTasksForToday: GetTodayFn;
  updateTask: UpdateFn;
  deleteTask: DeleteFn;
};

if (Platform.OS === 'web') {
  impl = require('./database.web').default;
} else {
  impl = require('./database.native').default;
}

export const initDatabase = impl.initDatabase;
export const addTask = impl.addTask;
export const getAllTasks = impl.getAllTasks;
export const getTasksForToday = impl.getTasksForToday;
export const updateTask = impl.updateTask;
export const deleteTask = impl.deleteTask;