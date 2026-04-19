import { format, addDays, parseISO, differenceInDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';
import type { Block, BlockStats, DayLog } from './types';

export function getBlockDates(block: Block): string[] {
  const dates: string[] = [];
  const start = parseISO(block.startDate);
  for (let i = 0; i < block.duration; i++) {
    dates.push(format(addDays(start, i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function getDayIndex(block: Block, date: string): number {
  const start = parseISO(block.startDate);
  const day = parseISO(date);
  return differenceInDays(day, start);
}

export function isBlockCompleted(block: Block): boolean {
  const endDate = addDays(parseISO(block.startDate), block.duration - 1);
  const today = startOfDay(new Date());
  return isAfter(today, endDate) || isEqual(today, endDate);
}

export function isBlockActive(block: Block): boolean {
  const start = parseISO(block.startDate);
  const end = addDays(start, block.duration - 1);
  const today = startOfDay(new Date());
  return (isAfter(today, start) || isEqual(today, start)) && (isBefore(today, end) || isEqual(today, end));
}

export function isBlockFuture(block: Block): boolean {
  const start = parseISO(block.startDate);
  const today = startOfDay(new Date());
  return isAfter(start, today);
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function computeBlockStats(block: Block, logs: DayLog[]): BlockStats {
  const dates = getBlockDates(block);
  const logMap: Record<string, DayLog> = {};
  logs.forEach(l => { logMap[l.date] = l; });

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
    const done = block.tasks.filter(t => log.completions[t.id]).length;
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
  const overallPercent = pastDays === 0 ? 0 : Math.round(dailyPercents.reduce((a, b) => a + b, 0) / pastDays);

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
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}
