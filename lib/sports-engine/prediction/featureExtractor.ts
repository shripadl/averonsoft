export type RawStats = {
  recentFormScore?: number
  goalDifferenceScore?: number
  rankingScore?: number
}

export type Feature = {
  name: string
  value: number
}

export function extractFeatures(raw: RawStats): Feature[] {
  const features: Feature[] = []
  if (typeof raw.recentFormScore === 'number') {
    features.push({ name: 'recentFormScore', value: raw.recentFormScore })
  }
  if (typeof raw.goalDifferenceScore === 'number') {
    features.push({ name: 'goalDifferenceScore', value: raw.goalDifferenceScore })
  }
  if (typeof raw.rankingScore === 'number') {
    features.push({ name: 'rankingScore', value: raw.rankingScore })
  }
  return features
}
