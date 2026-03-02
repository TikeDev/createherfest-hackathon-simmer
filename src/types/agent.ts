// Normalized tool definition — maps to OpenAI's function calling format
export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown> // JSON Schema object
}

export type ExtractionStatus =
  | 'idle'
  | 'fetching'
  | 'extracting'
  | 'saving'
  | 'done'
  | 'error'

export interface ExtractionProgress {
  step: string // Human-readable current step label
  completed: string[] // Labels of completed steps
}
