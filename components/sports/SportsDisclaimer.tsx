type Props = {
  compact?: boolean
}

export function SportsDisclaimer({ compact = false }: Props) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
      <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Entertainment analytics only</p>
      <p
        className={`mt-1 text-amber-800 dark:text-amber-100/90 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        These values are model estimates, not guarantees. No betting, staking, or financial advice is
        provided. Use at your own discretion and follow local laws and platform rules.
      </p>
    </div>
  )
}
