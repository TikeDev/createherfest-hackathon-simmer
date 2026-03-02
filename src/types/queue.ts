export type QueueStatus = 'pending' | 'processing' | 'failed' | 'completed'

export type QueueInput =
  | { type: 'url'; value: string }
  | { type: 'text'; value: string }

export interface QueueEntry {
  id: string
  input: QueueInput
  rawText?: string // Stored immediately for paste inputs so user can read offline
  status: QueueStatus
  createdAt: string // ISO 8601
  processedAt?: string
  error?: string
  recipeId?: string // Set on completion, links to RecipeJSON in the recipes store
}
