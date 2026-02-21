export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 19, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AveronSoft, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          AveronSoft provides URL shortening, bookmark management, and digital business card creation tools. We reserve the right to modify or discontinue any feature at any time.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use AveronSoft to:</p>
        <ul>
          <li>Violate any laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Distribute malware or harmful content</li>
          <li>Engage in spam or phishing activities</li>
          <li>Harass or harm others</li>
        </ul>

        <h2>5. Content Ownership</h2>
        <p>
          You retain ownership of content you create. By using our services, you grant us a license to store, display, and distribute your content as necessary to provide the service.
        </p>

        <h2>6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account for violations of these terms or for any other reason at our discretion.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>
          AveronSoft is provided &quot;as is&quot; without warranties of any kind, either express or implied.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          AveronSoft shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="/contact" className="text-primary hover:underline">our contact page</a>.
        </p>
      </div>
    </div>
  )
}
