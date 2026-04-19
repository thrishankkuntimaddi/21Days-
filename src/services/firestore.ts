import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Block, DayLog } from '../types';

// -------- BLOCKS --------

function blocksRef(userId: string) {
  return collection(db, 'users', userId, 'blocks');
}

function blockRef(userId: string, blockId: string) {
  return doc(db, 'users', userId, 'blocks', blockId);
}

export async function createBlock(
  userId: string,
  data: Omit<Block, 'id' | 'userId' | 'createdAt' | 'locked' | 'completed'>
): Promise<string> {
  const ref = await addDoc(blocksRef(userId), {
    ...data,
    userId,
    locked: true,
    completed: false,
    createdAt: Date.now(),
  });
  return ref.id;
}

export function subscribeBlocks(userId: string, cb: (blocks: Block[]) => void) {
  const q = query(blocksRef(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const blocks: Block[] = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Block))
      // Filter out malformed docs that lack required fields
      .filter(b =>
        b.startDate &&
        typeof b.startDate === 'string' &&
        typeof b.duration === 'number' &&
        b.duration > 0 &&
        Array.isArray(b.tasks)
      );
    cb(blocks);
  });
}

export async function updateBlock(userId: string, blockId: string, data: Partial<Block>) {
  await updateDoc(blockRef(userId, blockId), data as Record<string, unknown>);
}

export async function deleteBlock(userId: string, blockId: string) {
  // Also delete subcollection logs (Firestore doesn't auto-delete subcollections client-side)
  // Delete the block document; logs orphan but won't appear
  await deleteDoc(blockRef(userId, blockId));
}

// -------- LOGS --------

function logsRef(userId: string, blockId: string) {
  return collection(db, 'users', userId, 'blocks', blockId, 'logs');
}

function logRef(userId: string, blockId: string, date: string) {
  return doc(db, 'users', userId, 'blocks', blockId, 'logs', date);
}

export function subscribeLogs(userId: string, blockId: string, cb: (logs: DayLog[]) => void) {
  return onSnapshot(logsRef(userId, blockId), snap => {
    const logs: DayLog[] = snap.docs.map(d => d.data() as DayLog);
    cb(logs);
  });
}

export async function toggleTask(
  userId: string,
  blockId: string,
  date: string,
  taskId: string,
  done: boolean
) {
  const ref = logRef(userId, blockId, date);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { [`completions.${taskId}`]: done });
  } else {
    await setDoc(ref, { date, completions: { [taskId]: done }, note: '' });
  }
}

export async function saveNote(userId: string, blockId: string, date: string, note: string) {
  const ref = logRef(userId, blockId, date);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { note });
  } else {
    await setDoc(ref, { date, completions: {}, note });
  }
}

// -------- BULK OPERATIONS --------

export interface ExportData {
  exportedAt: string;
  blocks: Array<Block & { logs: DayLog[] }>;
}

/** Fetch all blocks and their logs for export */
export async function exportUserData(userId: string): Promise<ExportData> {
  const blockSnap = await getDocs(query(blocksRef(userId), orderBy('createdAt', 'desc')));
  const blocks: Array<Block & { logs: DayLog[] }> = [];
  for (const d of blockSnap.docs) {
    const block = { id: d.id, ...d.data() } as Block;
    const logSnap = await getDocs(logsRef(userId, d.id));
    const logs: DayLog[] = logSnap.docs.map(l => l.data() as DayLog);
    blocks.push({ ...block, logs });
  }
  return { exportedAt: new Date().toISOString(), blocks };
}

/** Import a previously exported data file — merges with existing data */
export async function importUserData(userId: string, data: ExportData): Promise<void> {
  if (!data?.blocks || !Array.isArray(data.blocks)) {
    throw new Error('Invalid export file format');
  }
  for (const blockData of data.blocks) {
    const { logs, id: _id, ...block } = blockData;
    const ref = await addDoc(blocksRef(userId), {
      ...block,
      userId,
      createdAt: block.createdAt ?? Date.now(),
    });
    if (Array.isArray(logs)) {
      for (const log of logs) {
        await setDoc(logRef(userId, ref.id, log.date), log);
      }
    }
  }
}

/** Delete all blocks (and their logs) for a user */
export async function resetAllBlocks(userId: string): Promise<void> {
  const blockSnap = await getDocs(blocksRef(userId));
  for (const d of blockSnap.docs) {
    const logSnap = await getDocs(logsRef(userId, d.id));
    const batch = writeBatch(db);
    logSnap.docs.forEach(l => batch.delete(l.ref));
    batch.delete(d.ref);
    await batch.commit();
  }
}
