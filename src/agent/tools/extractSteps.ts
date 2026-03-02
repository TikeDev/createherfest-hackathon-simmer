import { randomUUID } from '@/lib/uuid'
import type { Step } from '@/types/recipe'

export interface ParsedStepArg {
  index: number
  text: string
  timingMinutes?: number
  isCritical: boolean
  criticalNote?: string
}

export interface ExtractStepsArgs {
  steps: ParsedStepArg[]
}

export function extractSteps(args: ExtractStepsArgs): Step[] {
  return args.steps.map((s) => ({
    id: randomUUID(),
    index: s.index,
    text: s.text,
    timingMinutes: s.timingMinutes,
    isCritical: s.isCritical,
    criticalNote: s.criticalNote,
    annotations: [],
  }))
}
