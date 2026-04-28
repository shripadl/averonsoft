export function seededShuffle<T>(input: T[], seedSource: string): T[] {
  const items = [...input]
  let seed = stringToSeed(seedSource)

  for (let i = items.length - 1; i > 0; i -= 1) {
    seed = lcg(seed)
    const j = seed % (i + 1)
    ;[items[i], items[j]] = [items[j], items[i]]
  }

  return items
}

function stringToSeed(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash || 123456789
}

function lcg(seed: number): number {
  return (1664525 * seed + 1013904223) >>> 0
}
