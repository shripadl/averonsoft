export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 19, 2026</p>

        <p>
          AveronSoft (“we”, “our”, “us”) is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, store, and protect your information 
          when you use our services.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>

        <h3>A. Information you provide</h3>
        <ul>
          <li>Account information (email, name) via Google Sign-In</li>
          <li>Content you create (short URLs, bookmarks, business cards)</li>
        </ul>

        <h3>B. Automatically collected information</h3>
        <ul>
          <li>Usage data (feature usage, interactions, timestamps)</li>
          <li>Device and browser information</li>
          <li>Analytics data to improve performance</li>
        </ul>

        <h3>C. Cookies and tracking</h3>
        <p>
          We use cookies and similar technologies to maintain sessions, improve functionality, 
          and analyze usage.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Authenticate users and manage accounts</li>
          <li>Process payments and subscriptions</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your inquiries</li>
          <li>Ensure platform security and prevent abuse</li>
        </ul>

        <h2>3. Data Storage & Security</h2>
        <p>
          Your data is stored securely using Supabase infrastructure. 
          We implement appropriate technical and organizational measures to protect your information 
          from unauthorized access, loss, or misuse.
        </p>

        <h2>4. Data Sharing</h2>
        <p>We only share your information in the following cases:</p>
        <ul>
          <li>With your consent</li>
          <li>With service providers (e.g., Supabase, Paddle) strictly for operational purposes</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights, users, or platform security</li>
        </ul>
        <p>We do not sell or rent your personal information.</p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your personal data only as long as necessary to provide our services, 
          comply with legal obligations, resolve disputes, and enforce our agreements. 
          You may request deletion of your data at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Withdraw consent (where applicable)</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          We use cookies to maintain login sessions, improve user experience, 
          and analyze usage patterns. You may disable cookies in your browser settings, 
          but some features may not function properly.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be processed in countries outside your residence. 
          We ensure appropriate safeguards are in place for such transfers.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. 
          Continued use of the service after changes indicates acceptance of the updated policy.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, you can contact us at{' '}
          <a href="/contact" className="text-primary hover:underline">
            our contact page
          </a>{' '}
          or email us at <strong>support@averonsoft.com</strong>.
        </p>
      </div>
    </div>
  )
}
