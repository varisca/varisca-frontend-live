import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { POLICIES, policyIdFromSlug, type PolicyId } from '@/lib/policyConfig';

/* Policy sub-nav (Overview + per-policy pills) — hidden for now; restore when needed.
function PolicySubNav({ activeId }: { activeId: PolicyId }) {
  return (
    <nav
      className="flex flex-wrap justify-center gap-2 mb-10 pb-6 border-b border-border"
      aria-label="Policy pages"
    >
      <NavLink
        to="/policy"
        className={({ isActive }) =>
          cn(
            'text-sm font-medium px-3 py-2 rounded-lg transition-colors',
            isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )
        }
        end
      >
        Overview
      </NavLink>
      {POLICIES.map((p) => (
        <NavLink
          key={p.id}
          to={`/policy/${p.slug}`}
          className={({ isActive }) =>
            cn(
              'text-sm font-medium px-3 py-2 rounded-lg transition-colors',
              isActive || activeId === p.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )
          }
        >
          {p.name}
        </NavLink>
      ))}
    </nav>
  );
}
*/

function PolicyIndex() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen pb-16">
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Policies</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="container-custom py-10 md:py-14">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3">Legal &amp; policies</h2>
          <p className="text-muted-foreground">
            Everything you need to know about refunds, returns, shipping, and privacy—each on its own page.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {POLICIES.map((p) => (
            <li key={p.id}>
              <Link
                to={`/policy/${p.slug}`}
                className="block rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <h3 className="font-display font-semibold text-lg mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground">Read full policy →</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function TermsStub() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <p className="text-center">
        <Link to="/policy" className="text-sm text-primary hover:underline">
          ← All policies
        </Link>
      </p>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto">
        By using Varisca, you agree to these terms.
      </p>
      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          These terms govern your use of our website and purchases. For shipping, returns, and refunds, see our
          dedicated policy pages. Questions? Email{' '}
          <a href="mailto:varisca.team@gmail.com" className="text-primary hover:underline">
            varisca.team@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function PolicyContent({ id }: { id: PolicyId }) {
  switch (id) {
    case 'refund':
      return (
        <div className="space-y-8">
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            If you aren&apos;t completely satisfied with your order, you may be eligible for a refund within 7 days
            of delivery, subject to the terms below. Products must be unworn, unwashed, and in original packaging
            where applicable.
          </p>

          <section>
            <p className="text-muted-foreground mb-4">
              If a prepaid order is exchanged (you&apos;ll receive no refund or pickup IRRESPECTIVE of the refund
              amount). It will take approximately 7-10 days to get your product refund. Your refund will be back into
              your account if an order gets cancelled instantly
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• We offer 50% refund, only we confirm.</li>
              <li>• Tracking will be issue once our partner company receives</li>
              <li className="mt-3">
                <strong>Cancellation before dispatch:</strong> In such case, if you choose payment, issue
                <ul className="ml-6 mt-1 space-y-1">
                  <li>- If due to issues refund delivery (COD), a basic size your bank account will be credited the amount immediately</li>
                  <li>- 7-10 business days for refunded/redeposit sum</li>
                </ul>
              </li>
              <li className="mt-2">
                <strong>If there is order and dispatch and you request the cancel the shipped item:</strong> There will
                be a fee deducted from your deduction of actual fee.
              </li>
            </ul>
          </section>

          <section className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">NEED HELP?</h3>
            <p className="text-muted-foreground mb-2">
              If you have any questions regarding refunds, write to <strong>varisca.team@gmail.com</strong>
            </p>
            <p className="text-muted-foreground mb-2">
              Email:{' '}
              <a href="mailto:varisca.team@gmail.com" className="text-primary hover:underline">
                varisca.team@gmail.com
              </a>
            </p>
            <p className="text-muted-foreground mb-2">
              Call: <strong>+91 88668 60624</strong>
            </p>
            <p className="text-muted-foreground text-sm">
              If you face any issues, reach out to our customer care email and we will assist you.
            </p>
          </section>
        </div>
      );
    case 'returns':
      return (
        <div className="space-y-8">
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            How to exchange sizes or colours, request a return, and which items cannot be returned.
          </p>

          <section>
            <h3 className="text-xl font-bold mb-4">EXCHANGE POLICY</h3>
            <p className="text-muted-foreground mb-4">
              Varisca&apos;s exchange will provide you a free exchange if you wish to change size. We request to
              exchange within 7 days of delivery date.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Contact us and let us know (1 size)</li>
              <li>The product should be unwashed, unworn, and in its original packaging.</li>
              <li>You also have the option to exchange the product with a different color.</li>
              <li>We&apos;ll arrange a pickup for you and send you the replacement product postpaid if available!</li>
              <li>Once we receive your return item, we&apos;ll process your replacement order.</li>
              <li>Product may take 7-10 days to be exchanged.</li>
            </ul>
            <p className="mt-4 text-sm bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <strong>PLEASE NOTE:</strong> EXCHANGES ARE DETERMINED BY THE WEIGHT PACKAGE. Once receive, we confirm
              it&apos;s valid before we exchange.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">RETURN POLICY</h3>
            <p className="text-muted-foreground mb-4">
              Varisca&apos;s refund policy within the window for an undeniable factors you can return for a payment
              refund. <strong>7 days of delivery.</strong>
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Contact us for size, damages/defects only with the original tags &amp; packaging</li>
              <li>Should not be washed or worn</li>
              <li>None of the products from the original package is missing</li>
              <li>
                Once an exchange/request is initiated your <strong>refund will be processed as instant credit</strong>
              </li>
              <li>Contact us for exchange of different product</li>
            </ul>
            <p className="mt-4 text-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <strong>Important!</strong> Prepaid is responsible for any freight charges. While buyer PAYS for Prepaid.
              Customer refunds will remain the SAME devise store.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">NON-RETURNABLE ITEMS</h3>
            <p className="text-muted-foreground mb-4">
              The following items are generally not eligible for return or exchange unless they arrive damaged or
              defective and we confirm eligibility:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Customised, tailored, or made-to-order products</li>
              <li>Items of a personal or hygiene-sensitive nature once opened or used</li>
              <li>Products that are customised/tailored or affected by personal nature — items cannot be worn for return</li>
              <li>Items without original tags, packaging, or accessories included in the shipment</li>
              <li>Worn, washed, altered, or damaged items (except manufacturing defects reported in time)</li>
              <li>Clearance, final sale, or promotional items marked as non-returnable at purchase</li>
            </ul>
            <p className="mt-4 text-muted-foreground text-sm">
              Products that are customised/tailored or of a personal nature may not be returnable. If you are unsure,
              contact us before placing your order.
            </p>
          </section>

          <section className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">NEED HELP?</h3>
            <p className="text-muted-foreground mb-2">
              For returns and exchanges, write to <strong>varisca.team@gmail.com</strong>
            </p>
            <p className="text-muted-foreground mb-2">
              Email:{' '}
              <a href="mailto:varisca.team@gmail.com" className="text-primary hover:underline">
                varisca.team@gmail.com
              </a>
            </p>
            <p className="text-muted-foreground mb-2">
              Call: <strong>+91 88668 60624</strong>
            </p>
            <p className="text-muted-foreground text-sm">
              If you face any issues, reach out to our customer care email and we will assist you.
            </p>
          </section>
        </div>
      );
    case 'shipping':
      return (
        <div className="space-y-8">
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            At Varisca, we strive to deliver your orders as quickly and efficiently as possible. Please review our
            shipping policy below:
          </p>

          <section>
            <h3 className="text-xl font-bold mb-4">1. Shipping Provider:</h3>
            <p className="text-muted-foreground">
              We use Shiprocket for all our shipping needs, ensuring reliable and timely delivery of your orders.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">2. Processing Time:</h3>
            <p className="text-muted-foreground">
              Orders are typically processed within 2-7 business days. You will receive a confirmation email once your
              order has been shipped.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">3. Shipping Areas:</h3>
            <p className="text-muted-foreground">
              We currently ship within India. Unfortunately, we do not offer international shipping at this time.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">4. Delivery Time:</h3>
            <p className="text-muted-foreground">
              Delivery times may vary based on your location and the shipping method selected. Typically, orders will
              arrive within 2-7 business days after processing.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">5. Shipping Costs:</h3>
            <p className="text-muted-foreground">
              Shipping costs are calculated at checkout based on your location and the weight of your order. Free
              shipping may be available on orders over [insert minimum amount].
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">6. Tracking Your Order:</h3>
            <p className="text-muted-foreground">
              Once your order has shipped, you will receive a tracking number via email. You can use this number to
              track your shipment on the Shiprocket website.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">7. Missing or Delayed Orders:</h3>
            <p className="text-muted-foreground">
              If your order does not arrive within the estimated delivery time, please contact us at
              varisca.team@gmail.com. We will work with Shiprocket to resolve the issue.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">8. Damaged or Incorrect Items:</h3>
            <p className="text-muted-foreground">
              If you receive a damaged or incorrect item, please contact us within 7 days of delivery. We will assist
              you in resolving the issue promptly.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">9. Contact Us:</h3>
            <p className="text-muted-foreground">
              For any questions regarding our shipping policy, please reach out to us at varisca.team@gmail.com.
            </p>
          </section>

          <p className="text-center text-muted-foreground italic mt-8">
            Thank you for choosing &quot;Varisca&quot;! We appreciate your business and look forward to serving you.
          </p>
        </div>
      );
    case 'privacy':
      return (
        <div className="space-y-8">
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Your privacy is important to us.
          </p>

          <section>
            <h3 className="text-xl font-bold mb-4">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect personal information that you provide to us, including your name, email address, shipping
              address, and payment information when you make a purchase or create an account.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">2. How We Use Your Information</h3>
            <p className="text-muted-foreground">
              We use your information to process orders, communicate with you about your purchases, and improve our
              services. We may also use your information for marketing purposes, but you can opt-out at any time.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">3. Data Security</h3>
            <p className="text-muted-foreground">
              We implement security measures to protect your personal information. However, no method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">4. Sharing Your Information</h3>
            <p className="text-muted-foreground">
              We do not sell or rent your personal information to third parties. We may share your information with
              service providers who assist us in operating our website and processing orders.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">5. Cookies</h3>
            <p className="text-muted-foreground">
              We use cookies to enhance your browsing experience and analyze website traffic. You can choose to
              disable cookies through your browser settings, but this may affect your ability to use certain features
              of our website.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">6. Your Rights</h3>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information. If you wish to exercise these
              rights, please contact us at varisca.team@gmail.com.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">7. Changes to This Privacy Policy</h3>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on our website.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">8. Contact Us</h3>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at varisca.team@gmail.com.
            </p>
          </section>
        </div>
      );
    default:
      return null;
  }
}

const Policy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const pathname = location.pathname;

  const isTerms = pathname === '/terms';
  const isPrivacyShortcut = pathname === '/privacy';

  if (pathname === '/policy' || pathname === '/policy/') {
    return <PolicyIndex />;
  }

  const fromSlug = policyIdFromSlug(params.slug);
  if (params.slug && !fromSlug) {
    return <Navigate to="/policy" replace />;
  }

  const activeId: PolicyId | 'terms' | null = isTerms
    ? 'terms'
    : isPrivacyShortcut
      ? 'privacy'
      : fromSlug;

  if (!activeId) {
    return <Navigate to="/policy" replace />;
  }

  const pageTitle =
    activeId === 'terms'
      ? 'Terms of Service'
      : POLICIES.find((p) => p.id === activeId)?.name ?? 'Policy';

  return (
    <main className="min-h-screen pb-16">
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-center px-2">{pageTitle}</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* {activeId !== 'terms' && <PolicySubNav activeId={activeId as PolicyId} />} */}
        <div className="max-w-4xl mx-auto">
          {activeId === 'terms' ? <TermsStub /> : <PolicyContent id={activeId as PolicyId} />}
        </div>
      </div>
    </main>
  );
};

export default Policy;
