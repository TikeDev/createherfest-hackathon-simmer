import { getDB } from './db'
import type { QueueEntry, QueueStatus } from '@/types/queue'

export async function enqueue(entry: QueueEntry): Promise<void> {
  const db = await getDB()
  await db.put('queue', entry)
}

export async function updateQueueEntry(
  id: string,
  updates: Partial<QueueEntry>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('queue', id)
  if (!existing) return
  await db.put('queue', { ...existing, ...updates })
}

export async function getPendingEntries(): Promise<QueueEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('queue', 'by_status', 'pending' as QueueStatus)
}

export async function getQueueEntry(id: string): Promise<QueueEntry | undefined> {
  const db = await getDB()
  return db.get('queue', id)
}
