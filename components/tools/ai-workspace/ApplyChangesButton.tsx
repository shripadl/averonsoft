'use client'

import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'

interface ApplyChangesButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
}

export function ApplyChangesButton({
  onClick,
  disabled,
  isLoading,
}: ApplyChangesButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant="secondary"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  )
}
