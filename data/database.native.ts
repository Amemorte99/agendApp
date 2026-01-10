// data/database.native.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('agenda.db');

export interface Task {  // ← Export obligatoire ici !
  id: string;
  title: string;
  description?: string;
  date: string;           // ISO string "2026-01-10T14:30:00.000Z"
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
  console.log('[Native DB] Table tasks prête');
};


export const addTask = (
  task: Omit<Task, 'id' | 'createdAt' | 'done' | 'notified'> & {
    done?: boolean;      // ← rend optionnel
    notified?: boolean;  // ← rend optionnel
  }
): string => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO tasks (id, title, description, date, repeat, done, notified, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      task.title,
      task.description ?? null,
      task.date,
      task.repeat,
      task.done ?? false,      // Valeur par défaut si non fourni
      task.notified ?? false,  // Valeur par défaut si non fourni
      createdAt
    ]
  );

  console.log('[Native DB] Tâche ajoutée → ID:', id);
  return id;
};

export const getAllTasks = (): Task[] => {
  return db.getAllSync('SELECT * FROM tasks ORDER BY date ASC') as Task[];
};

export const getTasksForToday = (): Task[] => {
  const today = new Date().toISOString().split('T')[0];
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  return db.getAllSync(
    'SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [start, end]
  ) as Task[];
};

export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
  const sets = Object.entries(updates)
    .map(([k]) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];

  db.runSync(`UPDATE tasks SET ${sets} WHERE id = ?`, values);
};

export const deleteTask = (id: string) => {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
};