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
