'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Link as LinkIcon, Bookmark, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Shortener Pro',
      monthlyPrice: 15,
      annualPrice: 150,
      description: 'Powerful URL shortening with branded links, analytics, and advanced controls.',
      icon: LinkIcon,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Unlimited short links',
        'Custom domains',
        'Advanced analytics',
        'QR code generation',
        'Link expiration',
        'Password protection',
      ],
    },
    {
      name: 'Bookmarks Pro',
      monthlyPrice: 9,
      annualPrice: 90,
      description: 'Organize, search, and share your bookmarks with professional‑grade tools.',
      icon: Bookmark,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited bookmarks',
        'Unlimited collections',
        'Full‑text search',
        'Public and private sharing',
        'Team collaboration',
        'Import and export tools',
      ],
    },
    {
      name: 'Business Card Pro',
      monthlyPrice: 6,
      annualPrice: 60,
      description: 'Create and share modern digital business cards with analytics and branding.',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Unlimited digital cards',
        'Custom templates',
        'QR code generation',
        'View engagement analytics',
        'Custom branding',
        'Lead capture tools',
      ],
    },
    {
      name: 'Suite Bundle',
      monthlyPrice: 25,
      annualPrice: 250,
      description: 'Access the full AveronSoft suite with premium features and priority support.',
      icon: Sparkles,
      color: 'from-orange-500 to-red-500',
      features: [
        'All Shortener Pro features',
        'All Bookmarks Pro features',
        'All Business Card Pro features',
        'Priority support',
        'Early access to new features',
        'Save 17% compared to individual plans',
      ],
      popular: true,
    },
  ]

  const handleCheckout = (planName: string, isAnnual: boolean) => {
    alert(`Checkout for ${planName} (${isAnnual ? 'Annual' : 'Monthly'}) - Paddle integration pending`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm mb-4">
          <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          All plans include a 14‑day free trial. No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="space-y-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${plan.color} bg-opacity-10`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    or ${plan.annualPrice}/year (save ${plan.monthlyPrice * 12 - plan.annualPrice})
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleCheckout(plan.name, false)}
                    className="w-full"
                    variant={plan.popular ? 'default' : 'secondary'}
                  >
                    Start Monthly Trial
                  </Button>

                  <Button
                    onClick={() => handleCheckout(plan.name, true)}
                    className="w-full"
                    variant="secondary"
                  >
                    Start Annual Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 border-t pt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about our pricing</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          
          <div className="space-y-2">
            <h3 className="font-semibold">Can I switch plans?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. You can upgrade or downgrade at any time. Changes take effect immediately.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              All payments are securely processed by Paddle, our Merchant of Record. We accept major credit cards and regional payment methods supported by Paddle.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              Yes — every plan includes a 14‑day free trial with full access. No credit card required to start.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. You can cancel at any time. Your access continues until the end of your billing period.
            </p>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-20">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-12 text-center">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Still have questions?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our team is here to help. Contact us for custom plans, team accounts, or enterprise solutions.
            </p>
            <Link href="/contact">
              <Button size="lg">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          All plans include a 14‑day free trial. No credit card required.
          <br />
          Billing is handled securely by Paddle. Cancel anytime.
        </p>
      </div>

    </div>
  )
}
