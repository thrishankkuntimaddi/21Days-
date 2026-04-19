export interface Task {
  id: string;
  text: string;
  type: 'do' | 'dont';
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  completions: Record<string, boolean>; // taskId -> done
  note?: string;
}

export interface Block {
  id: string;
  userId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  duration: number; // days
  tasks: Task[];
  createdAt: number;
  locked: boolean;
  completed: boolean;
}

export interface BlockStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  overallPercent: number;
  dailyPercents: number[];
}
