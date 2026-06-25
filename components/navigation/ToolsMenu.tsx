'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Wrench } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ToolConfig } from '@/lib/tool-settings'

function isToolActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function ToolsMenu({ tools }: { tools: ToolConfig[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const anyActive = tools.some((t) => isToolActive(pathname, t.href))

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (tools.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative ${
          anyActive ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <Wrench className="h-3.5 w-3.5" aria-hidden />
        Tools
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {anyActive && (
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 max-h-[min(70vh,24rem)] w-60 overflow-y-auto rounded-lg border border-border bg-background/95 shadow-xl backdrop-blur-md"
        >
          <div className="p-1.5">
            {tools.map((tool) => {
              const active = isToolActive(pathname, tool.href)
              return (
                <Link
                  key={tool.key}
                  href={tool.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {tool.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
