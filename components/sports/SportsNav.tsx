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
      className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/20 p-1 backdrop-blur-sm"
      aria-label="Sports sections"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href, 'exact' in tab ? tab.exact : false)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              active
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
