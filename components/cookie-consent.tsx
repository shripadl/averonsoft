'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
          <Link href="/legal/cookies" className="text-primary hover:underline">
            Learn more
          </Link>
        </p>
        <Button onClick={acceptCookies} size="sm">
          Accept
        </Button>
      </div>
    </div>
  )
}
