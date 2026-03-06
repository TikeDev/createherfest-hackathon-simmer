import { getDB } from './db'
import type { UserProfile } from '@/types/profile'

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  await db.put('profile', { ...profile, updatedAt: new Date().toISOString() })
}

export async function getProfile(id: string): Promise<UserProfile | undefined> {
  const db = await getDB()
  return db.get('profile', id)
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDB()
  return db.getAll('profile')
}

export async function getPrimaryProfile(): Promise<UserProfile | undefined> {
  const db = await getDB()
  const results = await db.getAllFromIndex('profile', 'by_role', 'primary')
  return results[0]
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('profile', id)
}
