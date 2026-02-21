export default function FAQPage() {
  const faqs = [
    {
      q: "How do I get started?",
      a: "Sign up with your Google account and start using any of our three tools immediately. All plans include a 14-day free trial."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use industry-standard encryption and security practices. Your data is stored securely with Supabase."
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, we offer a 14-day money-back guarantee on all paid subscriptions."
    },
    {
      q: "Can I export my data?",
      a: "Yes, you can export all your data at any time from your account settings."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards and payment methods through Paddle, our payment processor."
    }
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg border p-6">
            <h2 className="mb-2 text-xl font-semibold">{faq.q}</h2>
            <p className="text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Still have questions?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
