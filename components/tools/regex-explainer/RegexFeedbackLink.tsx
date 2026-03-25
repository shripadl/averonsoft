'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export const REGEXPLAIN_FEEDBACK_HREF =
  '/contact?subject=' + encodeURIComponent('Feedback: RegExplain')

type RegexFeedbackLinkProps = {
  variant?: 'header' | 'embed'
  className?: string
}

export function RegexFeedbackLink({ variant = 'header', className }: RegexFeedbackLinkProps) {
  if (variant === 'embed') {
    return (
      <Link
        href={REGEXPLAIN_FEEDBACK_HREF}
        className={cn('text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline', className)}
      >
        Feedback
      </Link>
    )
  }

  return (
    <Link
      href={REGEXPLAIN_FEEDBACK_HREF}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background h-9',
        className
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
      Feedback
    </Link>
  )
}
