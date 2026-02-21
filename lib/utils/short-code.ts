import { nanoid } from 'nanoid'

export function generateShortCode(length: number = 7): string {
  // Use nanoid for URL-safe random strings
  return nanoid(length)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
