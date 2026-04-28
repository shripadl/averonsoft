import { LEGAL_DISCLAIMER_TEXT } from '@/lib/practice/constants'

export function LegalDisclaimer() {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
      <p className="font-semibold">Legal Notice</p>
      <p className="mt-1 text-muted-foreground">{LEGAL_DISCLAIMER_TEXT}</p>
    </div>
  )
}
