'use client'

import { ReactNode } from 'react'

/**
 * Professional DAW layout wrapper - dark theme with gradients, shadows, depth
 * (BandLab / Soundation / Soundtrap style)
 */
export function DAWLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col flex-1 min-h-0">{children}</div>
}
