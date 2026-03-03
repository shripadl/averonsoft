export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold">About Averonsoft Tools</h1>

      <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p>
          Averonsoft Tools is a small collection of online utilities. The goal is clarity over quantity:
          a few tools that work well, without clutter or marketing noise.
        </p>

        <p>
          We don&apos;t store your data unless a tool explicitly needs it (for example, saving a business card).
          Most tools run entirely in your browser. No signup required for tools that don&apos;t need an account.
        </p>

        <p>
          If you have feedback or suggestions, <a href="/contact" className="text-foreground underline hover:no-underline">get in touch</a>.
        </p>
      </div>
    </div>
  )
}
