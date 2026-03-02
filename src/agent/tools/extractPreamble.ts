import type { Preamble } from '@/types/recipe'

export interface ExtractPreambleArgs {
  tips: string[]
  substitutions: Array<{ original: string; substitute: string; note?: string }>
  techniqueNotes: string[]
  rawPreamble: string
}

export function extractPreamble(args: ExtractPreambleArgs): Preamble {
  return {
    raw: args.rawPreamble,
    tips: args.tips,
    substitutions: args.substitutions.map((s) => ({
      ...s,
      sourceNote: 'preamble' as const,
    })),
    techniqueNotes: args.techniqueNotes,
  }
}
