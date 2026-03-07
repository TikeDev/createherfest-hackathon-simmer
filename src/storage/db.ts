import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'simmer'
const DB_VERSION = 2 // Increment version to add new store

export interface SimmerDB extends IDBPDatabase {
  recipes: {
    key: string
    value: any
  }
  queue: {
    key: string
    value: any
  }
  profile: {
    key: string
    value: any
  }
  customAlarms: {
    key: string
    value: {
      id: string
      audioBlob: Blob
      fileName: string
      fileSize: number
      duration: number
      uploadedAt: string
    }
  }
}

export async function getDB(): Promise<IDBPDatabase> {
  return openDB<SimmerDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create recipes store if it doesn't exist
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id' })
      }
      
      // Create queue store if it doesn't exist
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'url' })
      }
      
      // Create profile store if it doesn't exist
      if (!db.objectStoreNames.contains('profile')) {
        const profileStore = db.createObjectStore('profile', { keyPath: 'id' })
        profileStore.createIndex('by_role', 'role')
      }
      
      // Create customAlarms store (new in version 2)
      if (oldVersion < 2 && !db.objectStoreNames.contains('customAlarms')) {
        db.createObjectStore('customAlarms', { keyPath: 'id' })
      }
    },
  })
}
