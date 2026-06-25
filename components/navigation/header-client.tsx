'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, Menu, X, LayoutDashboard, Shield, Wrench } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToolsMenu } from '@/components/navigation/ToolsMenu'
import { AccountMenu } from '@/app/components/AccountMenu'
import { LogoutButton } from '@/app/components/LogoutButton'
import type { ToolConfig } from '@/lib/tool-settings'

interface HeaderClientProps {
  user: { email?: string | null } | null
  visibleTools: ToolConfig[]
}

export function HeaderClient({ user, visibleTools }: HeaderClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)

  const baseNav = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  function isToolActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const anyToolActive = visibleTools.some((t) => isToolActive(t.href))

  const showPracticeSignOut =
    !!user?.email &&
    (pathname.startsWith('/practice') ||
      pathname.startsWith('/exam-payment-plans') ||
      pathname.startsWith('/exam-payment-confirmation'))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 flex items-center gap-2 p-1.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 transition-transform group-hover:scale-110">
              <span className="text-sm font-bold text-primary-foreground">AS</span>
            </div>
            <span className="text-xl font-bold text-foreground">AveronSoft</span>
          </Link>
        </div>

        <div className="flex gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="hidden items-center lg:flex lg:gap-x-8">
          <ToolsMenu tools={visibleTools} />
          {baseNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <ThemeToggle />

          {user?.email ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              {user.email === 'limayeshri@gmail.com' && (
                <Link href="/super-admin">
                  <Button variant="secondary" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Super Admin
                  </Button>
                </Link>
              )}
              {showPracticeSignOut ? (
                <LogoutButton size="sm" variant="secondary" className="shrink-0" />
              ) : null}
              <AccountMenu email={user.email} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t lg:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {visibleTools.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    anyToolActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tools
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {mobileToolsOpen ? (
                  <div className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                    {visibleTools.map((tool) => (
                      <Link
                        key={tool.key}
                        href={tool.href}
                        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isToolActive(tool.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setMobileToolsOpen(false)
                        }}
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {baseNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="mt-4 space-y-2 px-3">
              {user?.email ? (
                <>
                  <Link href="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {user.email === 'limayeshri@gmail.com' && (
                    <Link href="/super-admin" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        <Shield className="mr-2 h-4 w-4" />
                        Super Admin Console
                      </Button>
                    </Link>
                  )}
                  {showPracticeSignOut ? (
                    <LogoutButton size="sm" variant="secondary" className="w-full" />
                  ) : null}
                  <AccountMenu email={user.email} />
                </>
              ) : (
                <>
                  <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
