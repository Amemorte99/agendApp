import * as SQLite from 'expo-sqlite';
import { Task } from './database';

const db = SQLite.openDatabaseSync('agenda.db');

const normalizeTask = (row: any): Task => ({
  ...row,
  done: Boolean(row.done),
  notified: Boolean(row.notified),
});

export const initDatabase = async () => {
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

export const addTask = async (
  task: Omit<Task, 'id' | 'createdAt'>
): Promise<Task> => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO tasks (id, title, description, date, repeat, done, notified, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
    [id, task.title, task.description ?? null, task.date, task.repeat, createdAt]
  );

  return {
    id,
    ...task,
    done: false,
    notified: false,
    createdAt,
  };
};

export const getAllTasks = async (): Promise<Task[]> =>
  db.getAllSync('SELECT * FROM tasks ORDER BY date ASC').map(normalizeTask);

export const getTasksForToday = async (): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  return db
    .getAllSync(
      'SELECT * FROM tasks WHERE date LIKE ? ORDER BY date ASC',
      [`${today}%`]
    )
    .map(normalizeTask);
};

export const updateTask = async (
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
) => {
  const entries = Object.entries(updates);
  if (!entries.length) return;

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);

  db.runSync(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const deleteTask = async (id: string) => {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
};
