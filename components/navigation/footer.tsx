import Link from 'next/link'
import { getToolSettings, getVisibleTools } from '@/lib/tool-settings'

export async function Footer() {
  const toolSettings = await getToolSettings()
  const visibleTools = getVisibleTools(toolSettings)

  const productLinks = [
    ...visibleTools.map(t => ({ name: t.name, href: t.href })),
  ]

  const footerSections = [
    {
      title: 'Tools',
      links: productLinks.length > 0 ? productLinks : [{ name: 'Home', href: '/' }],
    },
    {
      title: 'Info',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Terms of Service', href: '/legal/terms' },
        { name: 'Refund Policy', href: '/legal/refunds' },
        { name: 'Cookie Policy', href: '/legal/cookies' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-primary-foreground font-bold text-sm">AS</span>
              </div>
              <span className="text-lg font-bold text-foreground">AveronSoft</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Fast, minimal online utilities. No signup required for most tools.
            </p>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AveronSoft. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/legal/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/legal/cookies"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
