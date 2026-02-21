export default function GDPRPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">GDPR Compliance Notice</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 19, 2026</p>
        <h2>Your Rights Under GDPR</h2>
        <p>If you are a resident of the European Economic Area, you have the following rights:</p>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to rectification of inaccurate data</li>
          <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
        </ul>
        <h2>Data Processing</h2>
        <p>We process your data based on your consent and our legitimate business interests.</p>
        <h2>Data Transfers</h2>
        <p>Your data may be transferred to and processed in countries outside the EEA.</p>
        <h2>Contact Our DPO</h2>
        <p>For GDPR-related inquiries, contact us at our contact page.</p>
      </div>
    </div>
  )
}
