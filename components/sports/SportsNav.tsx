'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/sports', label: 'Overview', exact: true },
  { href: '/sports/football', label: 'Football' },
  { href: '/sports/cricket', label: 'Cricket' },
  { href: '/sports/validator', label: 'Validator' },
] as const

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SportsNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-elevated/90 p-1 shadow-sm backdrop-blur-sm"
      aria-label="Sports sections"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href, 'exact' in tab ? tab.exact : false)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
