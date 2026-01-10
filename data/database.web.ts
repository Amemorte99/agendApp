// data/database.web.ts
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

export const initDatabase = () => {
  console.warn('[SQLite Web] Mode mock – pas de base réelle sur web');
};

export const addTask = async (_task: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  console.warn('[SQLite Web] Ajout impossible sur web');
  throw new Error('SQLite non supporté sur le web (expérimental)');
};