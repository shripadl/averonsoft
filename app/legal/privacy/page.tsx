export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 19, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          When you use AveronSoft, we collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>Account information (email, name) via Google Sign-In</li>
          <li>Content you create (short URLs, bookmarks, business cards)</li>
          <li>Usage data and analytics</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>

        <h2>3. Data Storage</h2>
        <p>
          Your data is stored securely using Supabase infrastructure. We implement appropriate technical and organizational measures to protect your personal information.
        </p>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information only in the following circumstances:
        </p>
        <ul>
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          We use cookies and similar technologies to provide and improve our services. See our Cookie Policy for more details.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="/contact" className="text-primary hover:underline">our contact page</a>.
        </p>
      </div>
    </div>
  )
}
