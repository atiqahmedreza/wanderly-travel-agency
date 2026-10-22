export default function PrivacyPage() {
  return (
    <div className="section-pad mx-auto max-w-3xl prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: October 22, 2026</p>
      <p>Wanderly Travel Agency (&quot;Wanderly&quot;, &quot;we&quot;) respects your privacy. This policy explains how we collect, use, and protect personal information when you use wanderly.com and related services.</p>
      <h2>Information we collect</h2>
      <p>We collect account details (name, email, password hash), booking and payment metadata processed by Stripe, contact form submissions, newsletter emails, and usage data such as pages visited and device type.</p>
      <h2>How we use information</h2>
      <p>We use your data to fulfill bookings, provide customer support, improve our platform, send optional marketing with consent, and comply with legal obligations.</p>
      <h2>Sharing</h2>
      <p>We share data with payment processors (Stripe), image hosting (imgBB), and infrastructure providers under contractual safeguards. We do not sell personal information.</p>
      <h2>Security</h2>
      <p>Passwords are hashed with bcrypt. API access uses JWT with expiration. Secrets are stored in environment variables, not in source code.</p>
      <h2>Your rights</h2>
      <p>You may request access, correction, or deletion of your account by emailing hello@wanderly.com.</p>
      <h2>Contact</h2>
      <p>House 12, Road 5, Gulshan-2, Dhaka 1212 · hello@wanderly.com</p>
    </div>
  );
}
