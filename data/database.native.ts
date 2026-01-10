// data/database.native.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('agenda.db');  // ← Sync = simple et rapide pour init

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;           // ISO : "2026-01-10T14:30:00.000Z"
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
  notified: boolean;
  createdAt: string;
}

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      repeat TEXT NOT NULL DEFAULT 'none',
      done INTEGER NOT NULL DEFAULT 0,
      notified INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
  console.log('[SQLite Native] Base initialisée');
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): string => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO tasks (id, title, description, date, repeat, done, notified, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
    [id, task.title, task.description ?? null, task.date, task.repeat, createdAt]
  );

  console.log('[SQLite Native] Tâche ajoutée → ID:', id);
  return id;
};

// À ajouter ensuite : getAllTasks, getTasksForDate, markAsDone, deleteTask...