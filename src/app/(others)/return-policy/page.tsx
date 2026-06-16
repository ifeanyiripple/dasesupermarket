// app/return-policy/page.tsx
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react"
import Link from "next/link"

// ── Section heading ───────────────────────────────────────────────────────────
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

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}

// ── Accept / reject row ───────────────────────────────────────────────────────
function PolicyRow({
  accepted,
  label,
  note,
}: {
  accepted: boolean
  label: string
  note?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {accepted ? (
        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {note && <p className="text-xs text-gray-500 mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fdf9]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1a5c38] text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-5">
            <RotateCcw size={28} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Return & Exchange Policy</h1>
          <p className="text-green-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            We want you to be completely satisfied with every purchase from{" "}
            <span className="text-white font-semibold">Dase Supermarket</span>.
            If something isn't right, here's exactly how we make it right.
          </p>
          <p className="text-green-300 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: June 2026 &nbsp;·&nbsp; dasesupermarket.com
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-8">

        {/* ── Quick summary strip ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: "3-Day Window",
              desc: "Report your return within 3 days of receiving your order",
            },
            {
              icon: PackageCheck,
              title: "Verified Returns",
              desc: "We review every return request before processing it",
            },
            {
              icon: ShieldCheck,
              title: "Your Money Back",
              desc: "Refund or exchange processed once the return is approved",
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

        {/* ── 1. Countries covered ──────────────────────────────────────── */}
        <Card>
          <SectionHeading number="1" title="Countries & Coverage" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            This return and exchange policy applies to all orders placed through{" "}
            <a
              href="https://www.dasesupermarket.com"
              className="text-[#1a5c38] font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              dasesupermarket.com
            </a>{" "}
            and fulfilled within <strong>Nigeria</strong>. At this time we deliver and accept
            returns exclusively within Nigeria. We are actively working to expand our coverage.
          </p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: "#EAF3DE", color: "#1a5c38" }}
          >
            <MapPin size={14} />
            Nigeria — All Deliverable States
          </div>
        </Card>

        {/* ── 2. Return window & condition ─────────────────────────────── */}
        <Card>
          <SectionHeading number="2" title="Return Window & Conditions" />

          <div
            className="flex items-start gap-4 p-4 rounded-xl mb-6"
            style={{ background: "#EAF3DE", border: "1px solid #C0DD97" }}
          >
            <Clock size={20} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[#1a5c38] text-base">
                3-Day Return Window
              </p>
              <p className="text-sm text-[#27500A] mt-0.5 leading-relaxed">
                You must report your return request within <strong>3 calendar days</strong> of
                receiving your order. Requests submitted after this window will not be accepted
                except in cases of significant quality failure or undisclosed product defects.
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-gray-700 mb-3">
            Returns are accepted under the following conditions:
          </p>

          <div className="divide-y divide-gray-50">
            <PolicyRow
              accepted={true}
              label="Defective or Damaged Products"
              note="Item arrived broken, spoiled beyond expected shelf life, or with a manufacturing defect."
            />
            <PolicyRow
              accepted={true}
              label="Wrong Item Delivered"
              note="You received a product different from what you ordered."
            />
            <PolicyRow
              accepted={true}
              label="Significantly Short Quantity or Weight"
              note="The quantity or weight of the product delivered is significantly less than stated."
            />
            <PolicyRow
              accepted={true}
              label="Non-Defective Products (Selected Categories)"
              note="Unopened, unused, in original packaging. Subject to category exclusions below."
            />
            <PolicyRow
              accepted={false}
              label="Perishable Products (Opened or Used)"
              note="Fresh produce, bread, meat, fish, and cooked food cannot be returned once opened."
            />
            <PolicyRow
              accepted={false}
              label="Products Damaged by Customer"
              note="Items that were damaged after delivery due to mishandling are not eligible."
            />
            <PolicyRow
              accepted={false}
              label="Items Returned Without Original Packaging"
              note="Non-food products must be returned in their original, sealed packaging."
            />
          </div>
        </Card>

        {/* ── 3. Exchanges ─────────────────────────────────────────────── */}
        <Card>
          <SectionHeading number="3" title="Exchanges" />
          <PolicyRow
            accepted={true}
            label="We Accept Exchanges"
            note="If a product is defective or incorrect, we will replace it with the same item where stock is available."
          />
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            Exchanges are subject to product availability. If the exact item is out of stock,
            we will issue a store credit or full refund instead. Exchange requests must be raised
            within the 3-day return window.
          </p>
        </Card>

        {/* ── 4. Non-returnable categories ─────────────────────────────── */}
        <Card>
          <SectionHeading number="4" title="Non-Returnable Categories" />
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            For health, safety, and hygiene reasons, the following product categories cannot be
            returned or exchanged unless they arrive defective or incorrect:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "Fresh Fruits & Vegetables",
              "Meat, Fish & Poultry",
              "Bread & Baked Goods",
              "Cooked or Ready-to-Eat Food",
              "Dairy & Eggs (Opened)",
              "Baby Formula (Opened)",
              "Medicine & Health Products",
              "Personal Hygiene Items (Used)",
              "Underwear & Innerwear",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100"
              >
                <XCircle size={13} className="text-red-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 5. How to request a return ────────────────────────────────── */}
        <Card>
          <SectionHeading number="5" title="How to Request a Return" />
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            To initiate a return or exchange, follow these steps:
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Contact Us Within 3 Days",
                desc: "Reach out via WhatsApp, phone, or email using the contact details at the bottom of this page. Quote your order number.",
              },
              {
                step: "2",
                title: "Provide Evidence",
                desc: "Send a clear photo or short video of the item showing the defect, damage, or issue. This helps us verify your claim quickly.",
              },
              {
                step: "3",
                title: "Await Verification",
                desc: "Our team will review your request within 24 hours of receiving your evidence and contact you with a decision.",
              },
              {
                step: "4",
                title: "Return the Item",
                desc: "If approved, we will arrange item pickup or provide a drop-off location depending on your delivery area.",
              },
              {
                step: "5",
                title: "Receive Refund or Exchange",
                desc: "Once we receive and inspect the returned item, your refund or replacement will be processed within 1–3 business days.",
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

        {/* ── 6. Refund method & fees ───────────────────────────────────── */}
        <Card>
          <SectionHeading number="6" title="Refund Method & Fees" />
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>No return shipping fees</strong> for defective or incorrect items — we
                cover the cost of collection.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Refunds are issued</strong> via bank transfer, Paystack reversal, or store
                credit — your choice.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Original delivery fees are <strong>non-refundable</strong> unless the return is
                due to an error on our part (wrong item, defective product on arrival).
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-[#1a5c38] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Approved refunds are processed within <strong>1–3 business days</strong> after the
                returned item has been received and inspected.
              </p>
            </div>
          </div>
        </Card>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <Card className="border-[#C0DD97]">
          <p className="text-[11px] font-black text-[#1a5c38] uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <h3 className="text-lg font-extrabold text-gray-900 mb-5">
            Have a Question About Your Return?
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
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a5c38] text-white text-sm font-bold hover:bg-[#145230] transition-colors"
            >
              <Truck size={15} /> Browse Products
            </Link>
            <Link
              href="/privacy-policy"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1a5c38] text-[#1a5c38] text-sm font-bold hover:bg-[#EAF3DE] transition-colors"
            >
              <ArrowRight size={15} /> Read Our Privacy Policy
            </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}