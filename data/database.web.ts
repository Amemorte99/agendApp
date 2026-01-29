// data/database.web.ts
import { Task } from './database';

export const initDatabase = () => console.warn('[Web] SQLite non supporté');

export const addTask = async (): Promise<Task> => {
  throw new Error('SQLite non supporté sur Web');
};

export const getAllTasks = async (): Promise<Task[]> => [];
export const getTasksForToday = async (): Promise<Task[]> => [];
export const updateTask = async () => {};
export const deleteTask = async () => {};

export default {
  initDatabase,
  addTask,
  getAllTasks,
  getTasksForToday,
  updateTask,
  deleteTask,
};