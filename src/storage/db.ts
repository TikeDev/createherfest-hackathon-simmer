import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { RecipeJSON } from '@/types/recipe'
import type { QueueEntry } from '@/types/queue'
import type { UserProfile } from '@/types/profile'

interface SimmerDB extends DBSchema {
  recipes: {
    key: string
    value: RecipeJSON
    indexes: { by_date: string }
  }
  queue: {
    key: string
    value: QueueEntry
    indexes: { by_status: string }
  }
  profile: {
    key: string
    value: UserProfile
    indexes: { by_role: string }
  }
}

const DB_NAME = 'simmer'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<SimmerDB>> | null = null

export function getDB(): Promise<IDBPDatabase<SimmerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SimmerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' })
          recipeStore.createIndex('by_date', 'extractedAt')

          const queueStore = db.createObjectStore('queue', { keyPath: 'id' })
          queueStore.createIndex('by_status', 'status')
        }

        if (oldVersion < 2) {
          const profileStore = db.createObjectStore('profile', { keyPath: 'id' })
          profileStore.createIndex('by_role', 'role')
        }
      },
    })
  }
  return dbPromise
}
