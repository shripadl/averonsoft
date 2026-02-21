export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Refund Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 19, 2026</p>

        <p>
          At AveronSoft, we want you to feel confident using our tools. 
          This Refund Policy explains when refunds are available and how to request one.
        </p>

        <h2>1. 14‑Day Money‑Back Guarantee</h2>
        <p>
          We offer a <strong>14‑day money‑back guarantee</strong> on all paid subscriptions. 
          If you are not satisfied for any reason, you may request a full refund within 
          14 days of your initial purchase.
        </p>

        <h2>2. Eligibility for Refunds</h2>
        <p>You may request a refund if:</p>
        <ul>
          <li>Your purchase was made within the last 14 days</li>
          <li>You have an active paid subscription</li>
          <li>You provide the email associated with your AveronSoft account</li>
        </ul>
        <p>
          Refunds are not available for payments made more than 14 days ago, 
          or for renewals that occurred after the initial refund window.
        </p>

        <h2>3. How to Request a Refund</h2>
        <p>
          To request a refund, please contact us through{' '}
          <a href="/contact" className="text-primary hover:underline">our contact page</a>{' '}
          with the following information:
        </p>
        <ul>
          <li>Your account email</li>
          <li>The date of purchase</li>
          <li>The reason for your refund request (optional)</li>
        </ul>

        <h2>4. Processing Time</h2>
        <p>
          Refunds are processed through Paddle, our Merchant of Record. 
          Once approved, refunds typically take <strong>5–10 business days</strong> 
          to appear on your original payment method.
        </p>

        <h2>5. Subscription Cancellations</h2>
        <p>
          You may cancel your subscription at any time. 
          Cancellation stops future billing but does not automatically trigger a refund 
          unless the request is made within the 14‑day guarantee period.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have questions about this Refund Policy, please contact us at{' '}
          <a href="/contact" className="text-primary hover:underline">our contact page</a>{' '}
          or email us at <strong>support@averonsoft.com</strong>.
        </p>
      </div>
    </div>
  )
}
