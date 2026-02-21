export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">About AveronSoft</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg">
          AveronSoft is a comprehensive suite of professional tools designed to streamline your digital workflow.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe in making powerful tools accessible to everyone. Our mission is to provide simple, effective solutions for URL management, content organization, and professional networking.
        </p>
        <h2>What We Offer</h2>
        <ul>
          <li><strong>URL Shortener:</strong> Create trackable short links with detailed analytics</li>
          <li><strong>Bookmark Manager:</strong> Organize and share your favorite web resources</li>
          <li><strong>Digital Business Cards:</strong> Modern, shareable professional cards</li>
        </ul>
        <h2>Why Choose AveronSoft</h2>
        <ul>
          <li>Simple, intuitive interface</li>
          <li>Powerful features</li>
          <li>Secure and reliable</li>
          <li>Excellent customer support</li>
        </ul>
      </div>
    </div>
  )
}
