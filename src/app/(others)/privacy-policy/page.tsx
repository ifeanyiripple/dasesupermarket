// app/privacy-policy/page.tsx
import {
  Shield,
  Eye,
  Lock,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Bell,
  Users,
  CreditCard,
  Globe,
  FileText,
  AlertCircle,
  ShoppingCart,
  UtensilsCrossed,
  Hotel,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

// ── Shared layout primitives ──────────────────────────────────────────────────
function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a5c38] text-white text-sm font-black flex items-center justify-center">
        {number}
      </span>
      <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
    </div>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c38] flex-shrink-0 mt-2" />
      <span>{children}</span>
    </li>
  )
}

// ── Vertical badge ────────────────────────────────────────────────────────────
function VerticalBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3DE] border border-[#C0DD97]">
      <Icon size={13} className="text-[#1a5c38]" />
      <span className="text-xs font-bold text-[#1a5c38]">{label}</span>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fdf9]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1a5c38] text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-5">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-green-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            <span className="text-white font-semibold">Dase Supermarket</span> is committed to
            protecting your personal information. This policy explains what we collect, how we use
            it, and your rights across all our services.
          </p>
          <p className="text-green-300 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: June 2026 &nbsp;·&nbsp; dasesupermarket.com
          </p>

          {/* Verticals covered */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <VerticalBadge icon={ShoppingCart} label="Dase Supermarket" />
            <VerticalBadge icon={Hotel} label="Dase Luxury Hotel" />
            <VerticalBadge icon={UtensilsCrossed} label="Royal Oyo Kitchen" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-8">

        {/* ── Scope notice ─────────────────────────────────────────────── */}
        <div
          className="flex items-start gap-4 p-5 rounded-2xl border"
          style={{ background: "#EAF3DE", borderColor: "#C0DD97" }}
        >
          <Globe size={20} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-[#1a5c38] text-sm mb-1">Policy Scope</p>
            <p className="text-sm text-[#27500A] leading-relaxed">
              This Privacy Policy applies to all services accessible through{" "}
              <a
                href="https://www.dasesupermarket.com"
                className="font-semibold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                dasesupermarket.com
              </a>
              , including the Dase Supermarket store, Dase Luxury Hotel bookings, and Royal Oyo
              Kitchen food orders. All three services share a single unified platform and are
              governed by this policy.
            </p>
          </div>
        </div>

        {/* ── 1. Introduction ──────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="1" title="Introduction" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Dase Supermarket values your privacy and is committed to protecting your personal
            information. Whether you are shopping for groceries, booking a hotel room, or ordering
            food from Royal Oyo Kitchen, we apply the same high standard of care to your data. This
            policy explains what information we collect, why we collect it, how it is used and
            shared, and the rights you have over your personal data.
          </p>
        </Card>

        {/* ── 2. Information we collect ─────────────────────────────── */}
        <Card>
          <SectionHeading number="2" title="Information We Collect" />
          <p className="text-sm text-gray-600 mb-4">
            Depending on which services you use, we may collect:
          </p>

          <div className="flex flex-col gap-5">
            {[
              {
                icon: Users,
                title: "Account Information",
                items: [
                  "Full name, email address, phone number, and profile image",
                  "Password (stored in encrypted form, never in plain text)",
                  "Username and account preferences",
                ],
              },
              {
                icon: ShoppingCart,
                title: "Supermarket Orders",
                items: [
                  "Product selections, quantities, and order history",
                  "Delivery address and preferred delivery time",
                  "Cart contents and saved items",
                ],
              },
              {
                icon: Hotel,
                title: "Hotel Booking Information",
                items: [
                  "Check-in and check-out dates, room type, and number of guests",
                  "Special requests, accessibility needs, and stay preferences",
                  "Booking history and past stay records",
                  "Government-issued ID (for check-in verification where required)",
                ],
              },
              {
                icon: UtensilsCrossed,
                title: "Kitchen Order Information",
                items: [
                  "Food selections, quantities, and dietary preferences or restrictions",
                  "Order history and preferred menu items",
                  "Special instructions and allergy disclosures",
                ],
              },
              {
                icon: CreditCard,
                title: "Payment Information",
                items: [
                  "Billing details and chosen payment method",
                  "Transaction records and invoice history",
                  "Payment status and refund records",
                  "Note: full card numbers are never stored by us; all payments are handled by Paystack's secure infrastructure",
                ],
              },
              {
                icon: Bell,
                title: "Communications",
                items: [
                  "Messages, inquiries, and feedback you send us",
                  "Dispute submissions and customer service interactions",
                  "Marketing preferences and consent records",
                ],
              },
            ].map(({ icon: Icon, title, items }) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#1a5c38]" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                </div>
                <ul className="flex flex-col gap-1 ml-9">
                  {items.map((item) => (
                    <BulletItem key={item}>{item}</BulletItem>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 3. How we use your information ───────────────────────────── */}
        <Card>
          <SectionHeading number="3" title="How We Use Your Information" />
          <p className="text-sm text-gray-600 mb-4">Your information is used to:</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Create and manage your Dase account across all our services",
              "Process and fulfill supermarket orders, including delivery coordination",
              "Handle hotel room bookings, reservations, check-ins, and cancellations",
              "Process food orders from Royal Oyo Kitchen and manage delivery or dine-in requests",
              "Process payments, generate invoices, and manage billing and refunds",
              "Verify guest identity during hotel check-in and for security purposes",
              "Send order confirmations, booking reminders, and important service updates",
              "Respond to your inquiries, requests, and special accommodation needs",
              "Improve our services, personalize your experience, and enhance product recommendations",
              "Detect and prevent fraud, ensure platform security, and comply with legal obligations",
              "Send promotional offers and marketing communications where you have given consent",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 4. Sharing of information ─────────────────────────────────── */}
        <Card>
          <SectionHeading number="4" title="Sharing of Information" />
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-5"
            style={{ background: "#EAF3DE", borderColor: "#C0DD97", border: "1px solid" }}
          >
            <Lock size={16} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#1a5c38]">
              We do not sell your personal information to third parties. Ever.
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            We may share your information only in the following circumstances:
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "With Paystack and banking partners strictly for the purpose of processing your payments securely",
              "With hotel staff and kitchen teams only to the extent needed to fulfill your bookings and orders",
              "With delivery personnel for the purpose of completing supermarket or food deliveries",
              "With regulatory authorities and law enforcement when required by Nigerian law or a valid court order",
              "With third-party service providers who assist in operating our platform, subject to confidentiality agreements and data processing terms",
              "With your explicit permission for any specific service integrations or third-party features you opt into",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 5. Data security ─────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="5" title="Data Security" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We implement strong administrative, technical, and physical safeguards to protect your
            personal information. Our security measures include:
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Encrypted databases with access controls limited to authorised personnel",
              "Secure Socket Layer (SSL) encryption for all data transmitted through our platform",
              "Hashed and salted password storage so your password is never stored in readable form",
              "Regular security reviews and vulnerability assessments",
              "Paystack-grade PCI-compliant payment infrastructure for financial transactions",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
          <div className="flex items-start gap-3 mt-5 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              While we work hard to protect your data, no online system is completely immune to
              risk. We encourage you to use a strong, unique password for your Dase account and to
              contact us immediately if you suspect any unauthorised activity.
            </p>
          </div>
        </Card>

        {/* ── 6. Data retention ────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="6" title="Data Retention" />
          <p className="text-sm text-gray-600 leading-relaxed">
            We retain your personal information only for as long as necessary to provide our
            services and fulfil the purposes described in this policy, unless a longer retention
            period is required or permitted by Nigerian law. Specifically:
          </p>
          <ul className="flex flex-col gap-1.5 mt-4">
            {[
              "Order and transaction records may be retained to comply with Nigerian tax and financial regulations",
              "Hotel booking records are retained for a period consistent with our legal and dispute resolution obligations",
              "Account information is retained for the duration your account remains active, plus a reasonable period after account closure",
              "You may request deletion of your personal information at any time subject to the exceptions described in Section 7",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 7. Your rights ───────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="7" title="Your Rights" />
          <p className="text-sm text-gray-600 mb-4">
            You have the following rights in relation to your personal information held by Dase:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Eye, label: "Access", desc: "Request a copy of the personal information we hold about you" },
              { icon: FileText, label: "Correction", desc: "Ask us to correct inaccurate or incomplete information" },
              { icon: Trash2, label: "Deletion", desc: "Request deletion of your data, subject to legal obligations" },
              { icon: Lock, label: "Restriction", desc: "Object to or restrict certain processing activities" },
              { icon: Globe, label: "Portability", desc: "Receive your data in a structured, machine-readable format" },
              { icon: Bell, label: "Withdraw Consent", desc: "Withdraw consent at any time where processing is consent-based" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#1a5c38]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            To exercise any of these rights, please contact us using the details in Section 9 below.
            We aim to respond to all requests within 30 days.
          </p>
        </Card>

        {/* ── 8. Third party services ──────────────────────────────────── */}
        <Card>
          <SectionHeading number="8" title="Third-Party Services" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Our platform integrates with trusted third-party partners, including Paystack for
            payment processing. These services operate under their own privacy policies, and we
            encourage you to review them separately. We are not responsible for the data practices
            of external services. Any third-party integrations we use are vetted to ensure they
            meet appropriate data protection standards.
          </p>
        </Card>

        {/* ── 8b. Children ─────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="9" title="Children" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Our services are intended for individuals who are at least 18 years old. We do not
            knowingly collect personal information from persons under 18. If you believe we have
            inadvertently collected information from a minor, please contact us immediately so we
            can promptly delete it.
          </p>
        </Card>

        {/* ── 10. Updates ──────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="10" title="Updates to This Policy" />
          <p className="text-sm text-gray-600 leading-relaxed">
            We may update this Privacy Policy periodically to reflect changes in our services,
            technology, or legal requirements. Material changes will be posted on this page with an
            updated effective date. We encourage you to review this policy regularly. Your continued
            use of our platform after changes are posted constitutes your acceptance of the updated
            policy.
          </p>
        </Card>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <Card className="border-[#C0DD97]">
          <p className="text-[11px] font-black text-[#1a5c38] uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <h3 className="text-lg font-extrabold text-gray-900 mb-5">
            Questions About Your Privacy?
          </h3>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@dasesupermarket.com"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-[#1a5c38] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-[#1a5c38]" />
              </div>
              support@dasesupermarket.com
            </a>
            <a
              href="tel:+2348000000000"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-[#1a5c38] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-[#1a5c38]" />
              </div>
              +234 800 000 0000
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-[#1a5c38]" />
              </div>
              Dase Supermarket, Oyo Town, Oyo State, Nigeria
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/terms-and-conditions"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a5c38] text-white text-sm font-bold hover:bg-[#145230] transition-colors"
            >
              <FileText size={15} /> Read Our Terms
            </Link>
            <Link
              href="/return-policy"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1a5c38] text-[#1a5c38] text-sm font-bold hover:bg-[#EAF3DE] transition-colors"
            >
              <ArrowRight size={15} /> Return Policy
            </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}