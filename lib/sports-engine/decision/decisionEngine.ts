export type DecisionCategory =
  | 'HIGH_CONFIDENCE'
  | 'MEDIUM_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'NO_ACTION'

export type DecisionResult = {
  probability: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  category: DecisionCategory
}

export function classifyProbability(probability: number): DecisionResult {
  let category: DecisionCategory = 'LOW_CONFIDENCE'
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'

  if (probability >= 0.7) {
    category = 'HIGH_CONFIDENCE'
    confidence = 'HIGH'
  } else if (probability >= 0.55) {
    category = 'MEDIUM_CONFIDENCE'
    confidence = 'MEDIUM'
  } else if (probability > 0.45 && probability < 0.55) {
    category = 'NO_ACTION'
    confidence = 'LOW'
  } else {
    category = 'LOW_CONFIDENCE'
    confidence = 'LOW'
  }

  return { probability, confidence, category }
}
