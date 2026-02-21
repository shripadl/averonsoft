import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Link as LinkIcon, Bookmark, CreditCard, Zap, Shield, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const tools = [
    {
      title: 'URL Shortener',
      description: 'Create short, trackable links with detailed analytics and custom domains.',
      icon: LinkIcon,
      href: '/tools/shortener',
      iconGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      title: 'Bookmark Manager',
      description: 'Organize and share your favorite web resources with collections and tags.',
      icon: Bookmark,
      href: '/tools/bookmarks',
      iconGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    },
    {
      title: 'Digital Business Card',
      description: 'Create modern, shareable professional cards with QR codes and analytics.',
      icon: CreditCard,
      href: '/tools/business-card',
      iconGradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern tech for blazing fast performance',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry standards',
    },
    {
      icon: TrendingUp,
      title: 'Powerful Analytics',
      description: 'Track performance with detailed insights and metrics',
    },
  ]

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* Background gradient - adds depth */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(139,92,246,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(16,185,129,0.08),transparent)]" />

      {/* Hero */}
      <section className="relative px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-24 lg:pb-12">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-foreground-secondary font-medium">Professional Tools Suite</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Three tools.{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              One platform.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-foreground-secondary sm:text-xl">
            Shorten URLs, manage bookmarks, and create digital business cards—all in one place.
          </p>
        </div>
      </section>

      {/* Primary: Three Big Tool Cards */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-surface p-8 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl sm:p-10"
                >
                  <div className="absolute inset-0 -z-10 opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.15]" style={{ background: tool.iconGradient }} />
                  <div className="relative z-10 flex flex-1 flex-col">
                    <div
                      className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                      style={{ background: tool.iconGradient }}
                    >
                      <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {tool.title}
                    </h2>
                    <p className="mb-6 flex-1 text-foreground-secondary leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-base font-semibold text-primary">
                      Try it now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-surface/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Built for professionals
            </h2>
            <p className="text-foreground-secondary">
              Enterprise-grade features at your fingertips
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border-2 border-border bg-background p-6 shadow-sm transition-all hover:border-border-hover hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-surface px-8 py-16 text-center shadow-lg sm:px-12">
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mb-8 text-lg text-foreground-secondary">
                Join thousands of professionals using AveronSoft
              </p>
              <Link href="/signup">
                <Button size="lg" className="group">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-20">
              <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary blur-3xl" />
              <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-primary blur-3xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
