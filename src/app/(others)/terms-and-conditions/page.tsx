// app/terms-and-conditions/page.tsx
import {
  Scale,
  ShoppingCart,
  Hotel,
  UtensilsCrossed,
  CreditCard,
  Shield,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Users,
  Clock,
  Globe,
  Truck,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
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

function VerticalBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
      <Icon size={13} className="text-white" />
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  )
}

// ── Sub-section for vertical-specific clauses ─────────────────────────────────
function VerticalSection({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: React.ElementType
  label: string
  color: "green" | "amber" | "orange"
  children: React.ReactNode
}) {
  const colorMap = {
    green: { bg: "#EAF3DE", border: "#C0DD97", text: "#1a5c38", iconBg: "#EAF3DE" },
    amber: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", iconBg: "#FEF3C7" },
    orange: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", iconBg: "#FFEDD5" },
  }
  const c = colorMap[color]
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: c.iconBg }}
        >
          <Icon size={14} style={{ color: c.text }} />
        </div>
        <p className="text-sm font-extrabold" style={{ color: c.text }}>
          {label}
        </p>
      </div>
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  )
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#f8fdf9]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1a5c38] text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-5">
            <Scale size={28} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Terms & Conditions</h1>
          <p className="text-green-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            These Terms govern your use of all services offered by{" "}
            <span className="text-white font-semibold">Dase</span> — our supermarket, hotel, and
            kitchen — through a single unified platform at dasesupermarket.com.
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

        {/* ── Quick reference strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              title: "18+ Only",
              desc: "You must be at least 18 years old to create an account or place any order",
            },
            {
              icon: Globe,
              title: "Nigeria Only",
              desc: "All services and deliveries are currently available within Nigeria exclusively",
            },
            {
              icon: Lock,
              title: "Secure Payments",
              desc: "All transactions are processed through Paystack's secure payment infrastructure",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-2 bg-white rounded-2xl border border-[#C0DD97] p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF3DE] flex items-center justify-center">
                <Icon size={18} className="text-[#1a5c38]" />
              </div>
              <p className="font-bold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── 1. Introduction ──────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="1" title="Introduction" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Welcome to Dase. By accessing our website at{" "}
            <a
              href="https://www.dasesupermarket.com"
              className="text-[#1a5c38] font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              dasesupermarket.com
            </a>
            , creating an account, or using any of our services — whether you are shopping for
            groceries, booking a hotel room, or ordering food — you agree to be bound by these
            Terms and Conditions in full.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dase operates as a multi-division business comprising three services on a single
            platform: Dase Supermarket (grocery retail and home delivery), Dase Luxury Hotel (room
            bookings and hospitality services), and Royal Oyo Kitchen (food orders and dining).
            These Terms apply to all three services. Where a term applies to a specific service
            only, that is clearly indicated.
          </p>
          <div
            className="mt-4 flex items-start gap-3 p-4 rounded-xl border"
            style={{ background: "#EAF3DE", borderColor: "#C0DD97" }}
          >
            <AlertCircle size={16} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#1a5c38] font-semibold leading-relaxed">
              If you do not agree with any part of these Terms, please do not use our services.
            </p>
          </div>
        </Card>

        {/* ── 2. Eligibility & Account ─────────────────────────────────────── */}
        <Card>
          <SectionHeading number="2" title="Eligibility & Account Registration" />
          <ul className="flex flex-col gap-1.5">
            {[
              "You must be at least 18 years old to register, make a booking, or place an order on our platform.",
              "When creating an account, you agree to provide accurate, current, and complete information and to keep it up to date.",
              "You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
              "You must notify us immediately at support@dasesupermarket.com if you suspect any unauthorised use of your account.",
              "Dase reserves the right to refuse service, suspend accounts, or cancel orders at our discretion, particularly where we suspect fraud, abuse, or violation of these Terms.",
              "One account per person. Creating multiple accounts to circumvent restrictions or promotions is prohibited.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 3. Services overview ─────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="3" title="Our Services" />
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            The Dase platform currently offers three distinct but interconnected services, all
            accessible through a single account:
          </p>

          <div className="flex flex-col gap-4">
            <VerticalSection icon={ShoppingCart} label="Dase Supermarket" color="green">
              <BulletItem>Online grocery shopping and home delivery within deliverable zones in Nigeria.</BulletItem>
              <BulletItem>Product availability is subject to stock levels and may change without notice.</BulletItem>
              <BulletItem>Delivery times are estimates only and may vary based on location and demand.</BulletItem>
              <BulletItem>Perishable items, once accepted at delivery, are non-returnable except under the conditions set out in our Return Policy.</BulletItem>
            </VerticalSection>

            <VerticalSection icon={Hotel} label="Dase Luxury Hotel" color="amber">
              <BulletItem>Room bookings are subject to availability and require confirmation from the hotel.</BulletItem>
              <BulletItem>Standard check-in is 2:00 PM and check-out is 12:00 PM (noon). Early check-in and late check-out are subject to availability and may attract additional charges.</BulletItem>
              <BulletItem>A valid government-issued ID is required at check-in. Guests who cannot produce valid ID may be refused service without refund.</BulletItem>
              <BulletItem>Rates are in Nigerian Naira (₦) and inclusive of 7.5% VAT unless explicitly stated otherwise.</BulletItem>
              <BulletItem>Special requests (room preferences, accessibility needs) are recorded but cannot be guaranteed.</BulletItem>
            </VerticalSection>

            <VerticalSection icon={UtensilsCrossed} label="Royal Oyo Kitchen" color="orange">
              <BulletItem>Food orders are subject to menu availability and kitchen preparation times.</BulletItem>
              <BulletItem>Dietary requirements and allergies must be disclosed at the time of ordering. While we take precautions, we cannot guarantee an allergen-free environment.</BulletItem>
              <BulletItem>Kitchen orders may be settled online at checkout, charged to a hotel room, or paid at delivery.</BulletItem>
              <BulletItem>Refunds for food orders are at management's discretion and are only considered for quality issues reported at the time of delivery.</BulletItem>
            </VerticalSection>
          </div>
        </Card>

        {/* ── 4. Bookings & Orders ─────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="4" title="Orders & Booking Terms" />
          <ul className="flex flex-col gap-1.5">
            {[
              "All orders and bookings placed through our platform are subject to acceptance and confirmation by Dase.",
              "Prices displayed are in Nigerian Naira (₦). We reserve the right to correct pricing errors at any time before an order is confirmed.",
              "Placing an order or booking does not guarantee fulfilment until you receive an explicit confirmation from us via email or in-app notification.",
              "Dase reserves the right to cancel any order or booking due to stock unavailability, pricing errors, or suspected fraudulent activity.",
              "If we cancel an order you have already paid for, a full refund will be issued to the original payment method within 1–3 business days.",
              "You are responsible for providing a correct and accessible delivery address. Failed deliveries due to incorrect or inaccessible addresses are the customer's responsibility.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 5. Payment ───────────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="5" title="Payment Terms" />
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
            style={{ background: "#EAF3DE", borderColor: "#C0DD97" }}
          >
            <Lock size={16} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#1a5c38]">
              All online payments are processed securely through Paystack. We never store your full
              card details.
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {[
              "Accepted payment methods include: Paystack (debit/credit cards, bank transfer, USSD), POS at hotel and kitchen locations, and cash on delivery for eligible supermarket orders.",
              "All transactions are denominated in Nigerian Naira (₦). No foreign currency transactions are supported at this time.",
              "Full or partial prepayment may be required for hotel bookings, peak-period orders, or large supermarket orders.",
              "Invoices and receipts are generated automatically and sent to the email address on your account.",
              "If a payment fails or is declined, your order or booking will not be confirmed. Please contact your bank or reach out to us for assistance.",
              "Any applicable promotional discounts or promo codes must be applied at checkout and cannot be applied retroactively.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 6. Cancellations & Refunds ───────────────────────────────────── */}
        <Card>
          <SectionHeading number="6" title="Cancellations & Refunds" />
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Cancellation and refund terms vary by service. The applicable policy is shown clearly at
            the time of checkout or booking.
          </p>

          <div className="flex flex-col gap-4">
            <VerticalSection icon={ShoppingCart} label="Dase Supermarket" color="green">
              <BulletItem>Supermarket orders may be cancelled before dispatch. Once an order has been picked and dispatched, it cannot be cancelled.</BulletItem>
              <BulletItem>Returns and refunds are governed by our separate Return & Exchange Policy available at dasesupermarket.com/return-policy.</BulletItem>
              <BulletItem>Approved refunds are processed within 1–3 business days after the return has been verified and accepted.</BulletItem>
            </VerticalSection>

            <VerticalSection icon={Hotel} label="Dase Luxury Hotel" color="amber">
              <BulletItem>Cancellation policies vary by room type and rate plan and are communicated at the time of booking.</BulletItem>
              <BulletItem>Standard bookings may be cancelled up to 24–48 hours before check-in without penalty, as specified at booking.</BulletItem>
              <BulletItem>Late cancellations or no-shows may incur a charge equivalent to the first night's stay or the full booking amount.</BulletItem>
              <BulletItem>Non-refundable rates are clearly labelled at booking and cannot be cancelled, modified, or transferred.</BulletItem>
              <BulletItem>Eligible hotel refunds are processed within 7–10 business days to the original payment method.</BulletItem>
            </VerticalSection>

            <VerticalSection icon={UtensilsCrossed} label="Royal Oyo Kitchen" color="orange">
              <BulletItem>Food orders can only be cancelled before preparation begins. Once an order is being prepared, it cannot be cancelled or refunded.</BulletItem>
              <BulletItem>Refunds for kitchen orders are at management's discretion and are only considered for confirmed quality issues raised at the time of delivery.</BulletItem>
            </VerticalSection>
          </div>
        </Card>

        {/* ── 7. Delivery ──────────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="7" title="Delivery" />
          <ul className="flex flex-col gap-1.5">
            {[
              "Delivery is available within deliverable zones across Nigeria. Coverage may vary by product category and location.",
              "Delivery time estimates are provided at checkout but are not guaranteed. External factors including traffic, weather, and high order volume may cause delays.",
              "Delivery fees are calculated based on your location and order type and are shown clearly before payment.",
              "Original delivery fees are non-refundable unless the return or cancellation was caused by an error on our part (wrong item dispatched, defective product, etc.).",
              "Supermarket orders require someone to be available to receive the delivery at the specified address and time. If no one is available, we will contact you to arrange redelivery, which may incur an additional fee.",
              "Dase is not liable for delays or failures caused by circumstances outside our control, including force majeure events.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 8. Acceptable use ────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="8" title="Acceptable Use" />
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            By using our platform and visiting our premises, you agree to the following conduct
            standards:
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "You will not use our platform for any unlawful purpose or in any way that may harm Dase, our staff, or other customers.",
              "You will not attempt to gain unauthorised access to any part of our systems or another user's account.",
              "You will not submit false, misleading, or fraudulent orders, reviews, or payment information.",
              "At hotel and kitchen premises, guests and diners are expected to behave respectfully towards staff and other guests at all times.",
              "Noise should be kept to a minimum on hotel premises, particularly after 10:00 PM.",
              "Smoking is prohibited in all indoor areas of our hotel and kitchen. Designated smoking areas are available on request.",
              "Pets are not permitted on our premises unless expressly agreed for specific hotel room types.",
              "Damage to hotel or restaurant property will be charged to the responsible guest's account.",
              "Dase reserves the right to refuse entry, suspend service, or remove any person from our premises or platform without refund if these rules are violated.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 9. Intellectual property ─────────────────────────────────────── */}
        <Card>
          <SectionHeading number="9" title="Intellectual Property" />
          <ul className="flex flex-col gap-1.5">
            {[
              "All content on the Dase platform — including logos, images, text, product descriptions, and software — is owned by or licensed to Dase and is protected by applicable intellectual property laws.",
              "You may not reproduce, distribute, display, or create derivative works from any content without our prior written permission.",
              "The Dase name, Dase Luxury Hotel, and Royal Oyo Kitchen are trading names of the Dase business and may not be used in any way that could imply affiliation, endorsement, or sponsorship without our explicit authorisation.",
              "User-submitted content such as reviews or feedback may be shared, displayed, and moderated by Dase for quality and safety purposes.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 10. Privacy ──────────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="10" title="Privacy & Data" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Your use of the Dase platform is subject to our Privacy Policy, which explains how we
            collect, use, store, and protect your personal information across all three services.
            By using our platform, you consent to the data practices described therein.
          </p>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAF3DE] text-[#1a5c38] text-sm font-bold border border-[#C0DD97] hover:bg-[#d4ebbc] transition-colors"
          >
            <Eye size={14} /> Read Our Privacy Policy
          </Link>
        </Card>

        {/* ── 11. Liability ────────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="11" title="Limitation of Liability" />
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
            style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
          >
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800 font-semibold leading-relaxed">
              Our services are provided on an "as available" basis. To the maximum extent permitted
              by Nigerian law, Dase's total liability for any claim shall not exceed the total
              amount you paid for the relevant order or booking.
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {[
              "We are not liable for any indirect, incidental, special, or consequential loss arising from your use of our services.",
              "Dase Luxury Hotel is not liable for loss or damage to personal belongings. Safe deposit boxes are available for valuables at the guest's own risk.",
              "We are not responsible for injuries or accidents on our premises except where caused by our direct negligence.",
              "We are not liable for delays, interruptions, or failures caused by events beyond our reasonable control, including power outages, flooding, civil disturbances, or other force majeure events.",
              "We do not guarantee that the platform will be error-free, uninterrupted, or free from viruses or other harmful components.",
            ].map((item) => (
              <BulletItem key={item}>{item}</BulletItem>
            ))}
          </ul>
        </Card>

        {/* ── 12. Disputes ─────────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="12" title="Disputes & Resolution" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We aim to resolve all concerns quickly and fairly. If you have a dispute:
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Contact Our Team",
                desc: "Reach out via email, phone, or WhatsApp. Most issues are resolved at this stage within 24–48 hours.",
              },
              {
                step: "2",
                title: "Escalate to Management",
                desc: "If your concern is not resolved, you may request escalation to a senior manager who will review your case within 3 business days.",
              },
              {
                step: "3",
                title: "Mediation",
                desc: "If we cannot resolve the matter informally, both parties agree to attempt good-faith mediation before pursuing legal proceedings.",
              },
              {
                step: "4",
                title: "Legal Proceedings",
                desc: "Unresolved disputes will be governed by the laws of the Federal Republic of Nigeria. Any legal proceedings must be brought in the courts of Oyo State, Nigeria, and filed within one (1) year of the relevant event.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a5c38] text-white text-sm font-black flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 13. Modifications ────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="13" title="Modifications to These Terms" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Dase reserves the right to update or modify these Terms at any time. Where changes are
            material, we will notify registered users via email or an in-app notice at least 7 days
            before the changes take effect. Your continued use of the platform after any update
            constitutes your acceptance of the revised Terms. We encourage you to review this page
            periodically.
          </p>
        </Card>

        {/* ── 14. Governing law ────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="14" title="Governing Law" />
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms of Service shall be governed by and construed in accordance with the laws
            of the Federal Republic of Nigeria. If any provision of these Terms is found by a court
            of competent jurisdiction to be invalid or unenforceable, the remaining provisions
            shall continue in full force and effect.
          </p>
        </Card>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <Card className="border-[#C0DD97]">
          <p className="text-[11px] font-black text-[#1a5c38] uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <h3 className="text-lg font-extrabold text-gray-900 mb-5">
            Questions About These Terms?
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
              Dase, Oyo Town, Oyo State, Nigeria
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/privacy-policy"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a5c38] text-white text-sm font-bold hover:bg-[#145230] transition-colors"
            >
              <Shield size={15} /> Privacy Policy
            </Link>
            <Link
              href="/return-policy"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1a5c38] text-[#1a5c38] text-sm font-bold hover:bg-[#EAF3DE] transition-colors"
            >
              <RotateCcw size={15} /> Return Policy
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              <Truck size={15} /> Browse Products
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Dase. All rights reserved. &nbsp;·&nbsp; dasesupermarket.com
          </p>
        </Card>

      </div>
    </div>
  )
}