// data/database.native.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('agenda.db');

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

const normalizeTask = (row: any): Task => ({
  ...row,
  done: Boolean(row.done),
  notified: Boolean(row.notified),
});

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      repeat TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      notified INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
};

export const addTask = (
  task: Omit<Task, 'id' | 'createdAt' | 'done' | 'notified'>
): string => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO tasks (id, title, description, date, repeat, done, notified, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
    [
      id,
      task.title,
      task.description ?? null,
      task.date,
      task.repeat,
      createdAt,
    ]
  );

  return id;
};

export const getAllTasks = (): Task[] => {
  return db
    .getAllSync('SELECT * FROM tasks ORDER BY date ASC')
    .map(normalizeTask);
};

export const getTasksForToday = (): Task[] => {
  const today = new Date().toISOString().split('T')[0];
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  return db
    .getAllSync(
      'SELECT * FROM tasks WHERE date BETWEEN ? AND ? ORDER BY date ASC',
      [start, end]
    )
    .map(normalizeTask);
};

export const updateTask = (
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
) => {
  const entries = Object.entries(updates);
  if (!entries.length) return;

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);

  db.runSync(
    `UPDATE tasks SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
};

export const deleteTask = (id: string) => {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
};
