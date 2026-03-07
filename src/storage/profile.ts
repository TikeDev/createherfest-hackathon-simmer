import { getDB } from './db'
import type { UserProfile } from '@/types/profile'

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  await db.put('profile', { ...profile, updatedAt: new Date().toISOString() })
}

export async function getProfile(id: string): Promise<UserProfile | undefined> {
  const db = await getDB()
  const profile = await db.get('profile', id)
  
  // Apply defaults for alarm preferences if they don't exist (migration)
  if (profile && typeof profile.alarmEnabled === 'undefined') {
    profile.alarmEnabled = true
    profile.alarmSound = 'moderate'
    profile.alarmVolume = 70
    profile.visualAlarmEnabled = false
    profile.customAlarmUploaded = false
    // Save the migrated profile
    await db.put('profile', { ...profile, updatedAt: new Date().toISOString() })
  }
  
  return profile
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDB()
  const profiles = await db.getAll('profile')
  
  // Apply migration to all profiles
  const migratedProfiles = profiles.map(profile => {
    if (typeof profile.alarmEnabled === 'undefined') {
      return {
        ...profile,
        alarmEnabled: true,
        alarmSound: 'moderate' as const,
        alarmVolume: 70,
        visualAlarmEnabled: false,
        customAlarmUploaded: false,
      }
    }
    return profile
  })
  
  return migratedProfiles
}

export async function getPrimaryProfile(): Promise<UserProfile | undefined> {
  const db = await getDB()
  const results = await db.getAllFromIndex('profile', 'by_role', 'primary')
  const profile = results[0]
  
  // Apply defaults for alarm preferences if they don't exist (migration)
  if (profile && typeof profile.alarmEnabled === 'undefined') {
    profile.alarmEnabled = true
    profile.alarmSound = 'moderate'
    profile.alarmVolume = 70
    profile.visualAlarmEnabled = false
    profile.customAlarmUploaded = false
    // Save the migrated profile
    await db.put('profile', { ...profile, updatedAt: new Date().toISOString() })
  }
  
  return profile
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('profile', id)
}
