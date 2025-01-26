export async function generateMetadata() {
  const canonical = '/privacy-policy';

  return {
    metadataBase: new URL('https://genmojionline.com'),
    title: "Privacy Policy | Genmoji Online",
    description: "Learn how Genmoji Online collects, uses, and protects your personal information. Read our comprehensive privacy policy.",
    alternates: {
      canonical,
    },
    openGraph: {
      title: "Privacy Policy | Genmoji Online",
      description: "Your privacy matters. Read Genmoji Online's privacy policy to understand how we handle your data.",
      url: canonical,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Genmoji Online Privacy Policy',
        },
      ],
    },
  };
}

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Effective Date: January 21, 2025</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Genmoji Online ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose information when you use our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">1. Information We Collect</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We may collect the following types of information:
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          <li>Account information (email, username)</li>
          <li>Usage data (emojis created, prompts used)</li>
          <li>Device information (IP address, browser type)</li>
          <li>Analytics data through <a href="https://policies.google.com/privacy" 
            className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" 
            target="_blank" 
            rel="noopener noreferrer">Google Analytics</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">2. How We Use Information</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We use the collected information to:
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          <li>Provide and improve our services</li>
          <li>Analyze usage patterns</li>
          <li>Communicate with users</li>
          <li>Ensure service security</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">3. Data Sharing</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We do not sell your personal information. We may share information with:
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          <li>Service providers (e.g., Google Analytics)</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">4. Data Security</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We implement security measures to protect your information, but no method is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">5. Your Rights</h2>
        <p className="text-gray-500 dark:text-gray-400">
          You have the right to access, correct, or delete your personal information. Contact us at <a 
            href="mailto:support@genmojionline.com"
            className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >support@genmojionline.com</a>. to exercise these rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">6. Changes to This Policy</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We may update this policy. Continued use of our service constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">7. Contact Us</h2>
        <p className="text-gray-500 dark:text-gray-400">
          For questions about this policy, contact us at <a 
            href="mailto:support@genmojionline.com"
            className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >support@genmojionline.com</a>.
        </p>
      </section>
    </main>
  );
}