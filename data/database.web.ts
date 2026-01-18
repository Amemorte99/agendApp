import { Task } from './database';

export const initDatabase = async () => {
  console.warn('[Web] SQLite désactivé');
};

export const addTask = async (): Promise<Task> => {
  throw new Error('SQLite non supporté sur Web');
};

export const getAllTasks = async (): Promise<Task[]> => [];
export const getTasksForToday = async (): Promise<Task[]> => [];
export const updateTask = async () => {};
export const deleteTask = async () => {};
