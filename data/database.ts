// data/database.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = SQLite.openDatabase('agenda.db');

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;           // ISO string : "2026-01-10T14:30:00.000Z"
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
  notified: boolean;
  createdAt: string;
}

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        repeat TEXT NOT NULL DEFAULT 'none',
        done INTEGER NOT NULL DEFAULT 0,
        notified INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );`,
      [],
      () => console.log('Table tasks créée ou existe déjà'),
      (_, error) => { console.error('Erreur création table:', error); return false; }
    );
  });
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const createdAt = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO tasks (id, title, description, date, repeat, done, notified, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, task.title, task.description || null, task.date, task.repeat, 0, 0, createdAt],
        () => resolve(id),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getAllTasks = (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tasks ORDER BY date ASC',
        [],
        (_, { rows: { _array } }) => resolve(_array as Task[]),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const markAsDone = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE tasks SET done = 1 WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

// À ajouter plus tard : deleteTask, updateTask, getTasksForDate, etc.