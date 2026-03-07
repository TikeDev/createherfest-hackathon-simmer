import { getDB } from './db'
import type { RecipeJSON } from '@/types/recipe'

export async function saveRecipe(recipe: RecipeJSON): Promise<void> {
  const db = await getDB()
  await db.put('recipes', recipe)
}

export async function updateRecipe(recipe: RecipeJSON): Promise<void> {
  const db = await getDB()
  await db.put('recipes', recipe)
}

export async function getRecipe(id: string): Promise<RecipeJSON | undefined> {
  const db = await getDB()
  return db.get('recipes', id)
}

export async function getAllRecipes(): Promise<RecipeJSON[]> {
  const db = await getDB()
  const recipes = await db.getAllFromIndex('recipes', 'by_date')
  return recipes.reverse() // Most recent first
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('recipes', id)
}
