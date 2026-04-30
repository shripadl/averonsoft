import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Key,
  AlertTriangle,
  Settings,
  FileText,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/apis', label: 'APIs', icon: Key },
  { href: '/admin/maintenance', label: 'Maintenance', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/practice', label: 'Practice Exam Admin', icon: GraduationCap },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
  { href: '/admin/reports', label: 'Abuse Reports', icon: ShieldAlert },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin('readonly')

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-56 shrink-0 border-r border-border bg-surface">
        <div className="sticky top-16 flex flex-col gap-1 p-4">
          <h2 className="mb-4 px-2 text-sm font-semibold text-foreground">Admin Console</h2>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
