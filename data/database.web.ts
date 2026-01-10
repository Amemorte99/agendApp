// data/database.web.ts
export interface Task {  // ← Export obligatoire ici aussi !
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
  console.warn('[Web DB] Mode simulation – pas de stockage réel');
};

export const addTask = async (): Promise<string> => {
  throw new Error('Ajout impossible sur web (SQLite non supporté)');
};

export const getAllTasks = (): Task[] => [];
export const getTasksForToday = (): Task[] => [];
export const updateTask = () => {};
export const deleteTask = () => {};