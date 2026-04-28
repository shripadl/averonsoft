/** Tailwind text class for decision_category badges (subtle emphasis). */
export function decisionCategoryTextClass(category: string | undefined | null): string {
  switch (category) {
    case 'HIGH_CONFIDENCE':
      return 'text-green-400'
    case 'MEDIUM_CONFIDENCE':
      return 'text-yellow-400'
    case 'LOW_CONFIDENCE':
      return 'text-red-400'
    case 'NO_ACTION':
      return 'text-slate-400'
    default:
      return 'text-slate-400'
  }
}
