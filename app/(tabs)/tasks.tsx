// types/task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;                     // ISO string : "2026-01-18T17:45:00.000Z"
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  done: boolean;
  notified: boolean;                // true si au moins une notification a été déclenchée
  createdAt: string;
}