export function IllustrationDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground ${className}`}
      role="note"
    >
      <span className="font-semibold text-amber-800 dark:text-amber-200">Disclaimer: </span>
      This tool is for illustration purposes only and is not financial, tax, or legal advice.
      Projections use simplified assumptions. Verify figures with a qualified adviser before
      making investment decisions.
    </div>
  )
}
