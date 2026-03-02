import type { ToolDefinition } from '@/types/agent'

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'extract_preamble',
    description:
      'Extract tips, substitutions, and technique notes from the recipe preamble or intro text. Only include substitutions explicitly stated in the source — do not fabricate any.',
    parameters: {
      type: 'object',
      properties: {
        rawPreamble: {
          type: 'string',
          description: 'The full preamble or intro text from the recipe.',
        },
        tips: {
          type: 'array',
          items: { type: 'string' },
          description: 'Practical tips extracted from the preamble.',
        },
        substitutions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              original: { type: 'string', description: 'The original ingredient.' },
              substitute: { type: 'string', description: 'The suggested substitute.' },
              note: { type: 'string', description: 'Optional note about the substitution.' },
              sourceNote: {
                type: 'string',
                enum: ['preamble', 'inline'],
                description: 'Where this substitution appeared in the source text.',
              },
            },
            required: ['original', 'substitute', 'sourceNote'],
          },
          description: 'Ingredient substitutions explicitly stated in the source text only. Each substitution must include a "sourceNote" field.',
        },
        techniqueNotes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Technique-related notes from the preamble.',
        },
      },
      required: ['rawPreamble', 'tips', 'substitutions', 'techniqueNotes'],
    },
  },
  {
    name: 'parse_ingredients',
    description:
      'Parse the ingredient list into structured objects with name, quantity, and unit. Flag any nonstandard units with an explanation.',
    parameters: {
      type: 'object',
      properties: {
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              raw: { type: 'string', description: 'The original ingredient line verbatim.' },
              name: { type: 'string', description: 'Normalized ingredient name.' },
              quantity: { type: 'number', nullable: true, description: 'Numeric quantity or null.' },
              unit: { type: 'string', nullable: true, description: 'Unit of measurement or null.' },
              isNonstandard: {
                type: 'boolean',
                description: 'True if the unit is nonstandard (e.g. "hand of garlic").',
              },
              nonstandardExplanation: {
                type: 'string',
                description: 'Brief explanation for nonstandard units.',
              },
            },
            required: ['raw', 'name', 'quantity', 'unit'],
          },
        },
      },
      required: ['ingredients'],
    },
  },
  {
    name: 'extract_steps',
    description:
      'Extract cooking steps from the recipe. Flag critical steps (overnight marinating, dough rising, etc.) that must not be skipped or shortened.',
    parameters: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number', description: 'Step number, starting at 1.' },
              text: { type: 'string', description: 'Full step text.' },
              timingMinutes: {
                type: 'number',
                description: 'Time required for this step in minutes, if mentioned.',
              },
              isCritical: {
                type: 'boolean',
                description: 'True if skipping or shortening this step would ruin the dish.',
              },
              criticalNote: {
                type: 'string',
                description: 'Explanation of why this step is critical.',
              },
            },
            required: ['index', 'text', 'isCritical'],
          },
        },
      },
      required: ['steps'],
    },
  },
  {
    name: 'convert_volume_to_weight',
    description:
      'Convert a volume measurement (cups, tablespoons, ml, etc.) to grams using ingredient density. Returns uncertainty flags when density data is unavailable or estimated.',
    parameters: {
      type: 'object',
      properties: {
        ingredientName: { type: 'string', description: 'The ingredient name.' },
        quantity: { type: 'number', description: 'The numeric quantity.' },
        unit: { type: 'string', description: 'The volume unit (e.g. cup, tablespoon, ml).' },
      },
      required: ['ingredientName', 'quantity', 'unit'],
    },
  },
  {
    name: 'convert_weight_to_volume',
    description:
      'Convert a weight measurement (grams, oz, lbs) to a volume equivalent for users without a kitchen scale. Returns uncertainty flags when density data is unavailable.',
    parameters: {
      type: 'object',
      properties: {
        ingredientName: { type: 'string', description: 'The ingredient name.' },
        quantity: { type: 'number', description: 'The numeric quantity.' },
        unit: { type: 'string', description: 'The weight unit (e.g. g, oz, lbs).' },
      },
      required: ['ingredientName', 'quantity', 'unit'],
    },
  },
  {
    name: 'validate_output',
    description:
      'Validate the assembled RecipeJSON object against the expected schema. Returns any validation errors.',
    parameters: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'The fully assembled RecipeJSON object to validate.',
        },
      },
      required: ['recipe'],
    },
  },
]

// Map tool name → OpenAI function definition format
export function toOpenAITools(
  tools: ToolDefinition[],
): Array<{ type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown> } }> {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))
}
