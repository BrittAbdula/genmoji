export async function generateMetadata() {
  const canonical = '/terms-of-service';

  return {
    metadataBase: new URL('https://genmojionline.com'),
    title: "Terms of Service | Genmoji Online",
    description: "Read the terms and conditions governing your use of Genmoji Online's AI-powered emoji generation services.",
    alternates: {
      canonical,
    },
    openGraph: {
      title: "Terms of Service | Genmoji Online",
      description: "Understand the terms and conditions for using Genmoji Online's services.",
      url: canonical,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Genmoji Online Terms of Service',
        },
      ],
    },
  };
}

export default function TermsOfService() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Effective Date: January 21, 2025</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-gray-500 dark:text-gray-400">
            By using Genmoji Online, you agree to these Terms of Service. If you do not agree, do not use our service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">2. Service Description</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Genmoji Online provides AI-powered emoji generation services. Users can create custom emojis based on text prompts.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
          <p className="text-gray-500 dark:text-gray-400">
            You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
            <li>Use the service only for lawful purposes</li>
            <li>Not create harmful or offensive content</li>
            <li>Respect intellectual property rights</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">4. Intellectual Property</h2>
          <p className="text-gray-500 dark:text-gray-400">
            All genmojis generated through our service are released into the public domain. You can freely use, modify, 
            copy, distribute, and perform the work, even for commercial purposes, all without asking permission. 
            No attribution is required.
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">4.1 Usage Rights</h3>
            <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
              <li>You can use the generated genmojis for any purpose</li>
              <li>No attribution to Genmoji Online is required</li>
              <li>You can modify and adapt the genmojis</li>
              <li>Commercial use is permitted</li>
              <li>You can share and redistribute the genmojis</li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">4.2 Limitations</h3>
            <p className="text-gray-500 dark:text-gray-400">
              While the genmojis themselves are free to use, the Genmoji Online name, logo, and service remain protected 
              by applicable intellectual property laws. The service infrastructure, website design, and underlying technology 
              remain the property of Genmoji Online.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Genmoji Online is not liable for any indirect, incidental, or consequential damages arising from service use.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">6. Changes to Terms</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We may update these terms. Continued use constitutes acceptance of the updated terms.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">7. Governing Law</h2>
          <p className="text-gray-500 dark:text-gray-400">
            These terms are governed by the laws of the State of California.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">8. Contact Information</h2>
          <p className="text-gray-500 dark:text-gray-400">
            For questions about these terms, contact us at <a 
            href="mailto:support@genmojionline.com"
            className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >support@genmojionline.com</a>.
          </p>
        </div>
      </div>
    </main>
  );
}