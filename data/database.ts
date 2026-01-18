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

type AddTaskFn = (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
type GetAllTasksFn = () => Promise<Task[]>;
type GetTasksForTodayFn = () => Promise<Task[]>;
type UpdateTaskFn = (
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
) => Promise<void>;
type DeleteTaskFn = (id: string) => Promise<void>;
type InitDatabaseFn = () => Promise<void>;

let impl: {
  initDatabase: InitDatabaseFn;
  addTask: AddTaskFn;
  getAllTasks: GetAllTasksFn;
  getTasksForToday: GetTasksForTodayFn;
  updateTask: UpdateTaskFn;
  deleteTask: DeleteTaskFn;
};

if (Platform.OS === 'web') {
  impl = require('./database.web');
} else {
  impl = require('./database.native');
}

export const initDatabase = impl.initDatabase;
export const addTask = impl.addTask;
export const getAllTasks = impl.getAllTasks;
export const getTasksForToday = impl.getTasksForToday;
export const updateTask = impl.updateTask;
export const deleteTask = impl.deleteTask;
