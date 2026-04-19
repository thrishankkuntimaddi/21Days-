import { format, addDays, parseISO, differenceInDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';
import type { Block, BlockStats, DayLog } from './types';

// Guard: return true if block has minimum required fields
export function isValidBlock(block: Block): boolean {
  return !!(
    block &&
    block.id &&
    block.startDate &&
    typeof block.startDate === 'string' &&
    block.startDate.match(/^\d{4}-\d{2}-\d{2}/) &&
    typeof block.duration === 'number' &&
    block.duration > 0 &&
    Array.isArray(block.tasks)
  );
}

export function getBlockDates(block: Block): string[] {
  if (!isValidBlock(block)) return [];
  const dates: string[] = [];
  try {
    const start = parseISO(block.startDate);
    for (let i = 0; i < block.duration; i++) {
      dates.push(format(addDays(start, i), 'yyyy-MM-dd'));
    }
  } catch {
    return [];
  }
  return dates;
}

export function getDayIndex(block: Block, date: string): number {
  if (!isValidBlock(block)) return -1;
  try {
    const start = parseISO(block.startDate);
    const day = parseISO(date);
    return differenceInDays(day, start);
  } catch {
    return -1;
  }
}

export function isBlockCompleted(block: Block): boolean {
  if (!isValidBlock(block)) return false;
  try {
    const endDate = addDays(parseISO(block.startDate), block.duration - 1);
    const today = startOfDay(new Date());
    return isAfter(today, endDate) || isEqual(today, endDate);
  } catch {
    return false;
  }
}

export function isBlockActive(block: Block): boolean {
  if (!isValidBlock(block)) return false;
  try {
    const start = parseISO(block.startDate);
    const end = addDays(start, block.duration - 1);
    const today = startOfDay(new Date());
    return (isAfter(today, start) || isEqual(today, start)) && (isBefore(today, end) || isEqual(today, end));
  } catch {
    return false;
  }
}

export function isBlockFuture(block: Block): boolean {
  if (!isValidBlock(block)) return false;
  try {
    const start = parseISO(block.startDate);
    const today = startOfDay(new Date());
    return isAfter(start, today);
  } catch {
    return false;
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

const EMPTY_STATS: BlockStats = {
  totalDays: 0,
  completedDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  overallPercent: 0,
  dailyPercents: [],
};

export function computeBlockStats(block: Block, logs: DayLog[]): BlockStats {
  if (!isValidBlock(block)) return EMPTY_STATS;

  const dates = getBlockDates(block);
  if (dates.length === 0) return EMPTY_STATS;

  const logMap: Record<string, DayLog> = {};
  logs.forEach(l => { if (l?.date) logMap[l.date] = l; });

  const today = getTodayString();
  const taskCount = block.tasks.length;
  let completedDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const dailyPercents: number[] = [];

  for (const date of dates) {
    if (date > today) break;
    const log = logMap[date];
    if (!log || taskCount === 0) {
      dailyPercents.push(0);
      streak = 0;
      continue;
    }
    const done = block.tasks.filter(t => t?.id && log.completions?.[t.id]).length;
    const pct = Math.round((done / taskCount) * 100);
    dailyPercents.push(pct);
    if (pct === 100) {
      completedDays++;
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  currentStreak = streak;
  const pastDays = dailyPercents.length;
  const overallPercent = pastDays === 0
    ? 0
    : Math.round(dailyPercents.reduce((a, b) => a + b, 0) / pastDays);

  return {
    totalDays: block.duration,
    completedDays,
    currentStreak,
    longestStreak,
    overallPercent,
    dailyPercents,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'EEE');
  } catch {
    return '';
  }
}
