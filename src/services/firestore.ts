import {
  collection, doc, addDoc, setDoc, getDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy,
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
    const blocks: Block[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Block));
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
