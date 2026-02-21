export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Professional Tools for Modern Businesses
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AveronSoft helps you manage your links, bookmarks, and digital identity
          with fast, secure, and intuitive tools — all in one place.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a href="/signup">
            <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
              Get Started
            </button>
          </a>
          <a href="/pricing">
            <button className="px-6 py-3 rounded-lg border font-medium hover:bg-muted">
              View Pricing
            </button>
          </a>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Currently in private development — public launch coming soon.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid gap-12 md:grid-cols-3 mt-20">
        {/* URL Shortener */}
        <div className="rounded-xl border p-8 hover:shadow-lg transition">
          <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-lg bg-blue-500/10">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7-7l1-1" />
              <path d="M14 11a5 5 0 0 1-7-7l3-3a5 5 0 0 1 7 7l-1 1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Shortener Pro</h3>
          <p className="text-muted-foreground">
            Create branded short links with analytics, QR codes, expiration controls, and more.
          </p>
        </div>

        {/* Bookmarks */}
        <div className="rounded-xl border p-8 hover:shadow-lg transition">
          <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-lg bg-purple-500/10">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 3v18l7-5 7 5V3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Bookmarks Pro</h3>
          <p className="text-muted-foreground">
            Organize, search, and share your bookmarks with powerful tools built for productivity.
          </p>
        </div>

        {/* Business Cards */}
        <div className="rounded-xl border p-8 hover:shadow-lg transition">
          <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-lg bg-green-500/10">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Business Card Pro</h3>
          <p className="text-muted-foreground">
            Create modern digital business cards with analytics, branding, and lead capture.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Be the first to know</h2>
        <p className="text-muted-foreground mb-6">
          We’re preparing for launch. Join the waitlist to get early access.
        </p>
        <a href="/signup">
          <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
            Join Waitlist
          </button>
        </a>
      </div>
    </div>
  )
}
