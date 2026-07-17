"use client";

import { useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, MessageCircle,
  Instagram, Facebook, Twitter, ShoppingBasket, ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import DaseAboutSection from "@/components/daseaboutsection";

// ── Green palette (supermarket theme) ─────────────────────────────────────
const G = {
  primary:       "#1a5c38",
  primaryHover:  "#144d2e",
  primaryLight:  "#EAF3DE",
  primaryBorder: "#C0DD97",
  primaryText:   "#27500A",
  dark:          "#0e3520",
};

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

// ── Contact info ───────────────────────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon:   Phone,
    title:  "Phone",
    details: ["+234 8164962637", "+234 9018558644"],
    action:  "tel:+2348164962637",
  },
  {
    icon:   Mail,
    title:  "Email",
    details: ["support@dasesupermarket.com", "manager@dasesupermarket.com"],
    action:  "mailto:support@dasesupermarket.com",
  },
  {
    icon:   MapPin,
    title:  "Location",
    details: ["Lane 7, Alhaja Serifat Biliaminu Street, Ayetoro, Oyo, Oyo State", "Nigeria"],
    action:  "https://share.google/m397rVf3PhsYti4Ko",
  },
  {
    icon:   Clock,
    title:  "Store Hours",
    details: ["Mon – Sat: 8 am – 9 pm", "Sunday: 10 am – 6 pm"],
    action:  "#hours",
  },
];

// ── Page ───────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const html = `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111;max-width:600px;margin:0 auto">
          <h2 style="margin:0 0 16px;color:#1a5c38;border-bottom:2px solid #C0DD97;padding-bottom:8px">
            🛒 New Contact Form — Dase Supermarket
          </h2>
          <div style="background:#EAF3DE;border-left:4px solid #1a5c38;padding:16px;margin:16px 0;border-radius:4px">
            <p style="margin:0;color:#27500A;font-weight:600">Customer Inquiry Received</p>
          </div>
          <table style="border-collapse:collapse;width:100%;background:#f8faf6;border-radius:8px;overflow:hidden">
            <tbody>
              <tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Name</td><td style="padding:12px 16px">${form.name}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Email</td><td style="padding:12px 16px">${form.email}</td></tr>
              ${form.phone ? `<tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Phone</td><td style="padding:12px 16px">${form.phone}</td></tr>` : ""}
              <tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Subject</td><td style="padding:12px 16px">${form.subject || "General Inquiry"}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Message</td><td style="padding:12px 16px;white-space:pre-wrap">${form.message}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#e8f5e1">Sent</td><td style="padding:12px 16px">${new Date().toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>`;

      const res = await fetch("/api/internal/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "hello@dasesupermarket.com",
          subject: `[Dase Supermarket] New message from ${form.name}`,
          html,
          type: "CONTACT_FORM",
          priority: "MEDIUM",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      alert("Something went wrong. Please call us directly at +234 912 625 6756");
    } finally {
      setLoading(false);
    }
  };

  // ── Input style helper ─────────────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all " +
    "bg-[#0f2e1a] border border-[#1f4a2a] text-white placeholder:text-white/35 " +
    "focus:border-[#C0DD97] focus:ring-2 focus:ring-[#C0DD97]/25";

  return ( <>
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[55vh] flex items-end pb-20 px-6"
        style={{
          background: `linear-gradient(145deg, ${G.dark} 0%, ${G.primary} 65%, #2d7a4f 100%)`,
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: G.primaryBorder, filter: "blur(80px)", transform: "translate(25%, -25%)" }}
        />

        <div className="relative max-w-7xl mx-auto w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-xl">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${G.primaryBorder}30`, color: G.primaryBorder }}
              >
                <MessageCircle size={11} />
                Contact Us
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-4"
            >
              Get In
              <br />
              <span style={{ color: G.primaryBorder }}>Touch.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-white/70 text-base leading-relaxed">
              Questions about an order, product availability, or just want to say hello?
              Our team is always ready to help.
            </motion.p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 inset-x-0 leading-none overflow-hidden">
          <svg viewBox="0 0 1440 56" className="w-full" preserveAspectRatio="none">
            <path d="M0,56 C360,0 1080,56 1440,18 L1440,56 Z" fill="white" />
          </svg>
        </div>

       
      </section>
        {/* Breadcrumb */}
  <div className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
      <Link href="/" className="hover:text-[#1a5c38] transition-colors flex items-center gap-1 whitespace-nowrap">
        <ArrowLeft size={12} /> Home
      </Link>
      <span>/</span>
      <span className="text-gray-600 font-medium whitespace-nowrap">Contact Us</span>
    </div>
  </div>

      {/* ── CONTACT INFO CARDS ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: G.primaryText }}
            >
              Reach Out
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3">
              We'd Love to Hear
              <br />
              From You
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed">
              Whether you have a question about your order, our products, or just want to say
              hello, we're here.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {CONTACT_INFO.map(({ icon: Icon, title, details, action }) => (
              <motion.a
                key={title}
                href={action}
                target={action.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-2xl border transition-all duration-300"
                style={{ borderColor: G.primaryBorder, backgroundColor: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = G.primaryLight;
                  e.currentTarget.style.borderColor = G.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = G.primaryBorder;
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                  style={{ backgroundColor: G.primaryLight }}
                  ref={(el) => {
                    // handled via CSS group-hover pattern in Tailwind if needed
                  }}
                >
                  <Icon size={20} style={{ color: G.primary }} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">
                  {title}
                </h3>
                {details.map((d, i) => (
                  <p key={i} className="text-sm text-gray-500 leading-relaxed">{d}</p>
                ))}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MAP + FORM ───────────────────────────────────────────────── */}
      <section className="py-6 px-6 pb-24" style={{ backgroundColor: G.primaryLight }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Map ─────────────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideLeft}
              className="space-y-5"
            >
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: G.primaryText }}
                >
                  Find Us
                </span>
                <h3 className="font-serif text-3xl font-bold text-gray-900 mt-1">
                  Visit the Store
                </h3>
              </div>

              {/* Google Maps embed */}
              <div className="rounded-2xl overflow-hidden shadow-xl border-2" style={{ borderColor: G.primaryBorder }}>
                <iframe
                  title="Dase Supermarket Location"
                  src="https://maps.google.com/maps?q=Oyo+Town+Nigeria&output=embed&z=14"
                  width="100%"
                  height="380"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Address card */}
              <div
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{ backgroundColor: "white", border: `1.5px solid ${G.primaryBorder}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: G.primaryLight }}
                >
                  <MapPin size={16} style={{ color: G.primary }} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Dase Supermarket</p>
                  <p className="text-sm text-gray-500 mt-0.5">Oyo Town, Oyo State, Nigeria</p>
                  <a
                    href="https://share.google/m397rVf3PhsYti4Ko"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-2 transition-colors"
                    style={{ color: G.primary }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = G.primaryHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = G.primary; }}
                  >
                    Get Directions <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form ────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideRight}
            >
              <div
                className="rounded-3xl p-8 shadow-2xl"
                style={{
                  background: `linear-gradient(160deg, ${G.dark} 0%, #0a2918 100%)`,
                  border: `1px solid ${G.primaryBorder}20`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBasket size={16} style={{ color: G.primaryBorder }} />
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: G.primaryBorder }}
                  >
                    Send a Message
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-7">
                  How Can We Help?
                </h3>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-14 text-center gap-4"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${G.primaryBorder}25` }}
                    >
                      <Send size={24} style={{ color: G.primaryBorder }} />
                    </div>
                    <h4 className="font-bold text-white text-lg">Message Sent!</h4>
                    <p className="text-sm" style={{ color: `${G.primaryBorder}bb` }}>
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-2 text-xs font-semibold underline"
                      style={{ color: G.primaryBorder }}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${G.primaryBorder}99` }}>
                          Your Name *
                        </label>
                        <input
                          type="text" name="name" value={form.name} onChange={handleChange}
                          required placeholder="John Doe" className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${G.primaryBorder}99` }}>
                          Email *
                        </label>
                        <input
                          type="email" name="email" value={form.email} onChange={handleChange}
                          required placeholder="john@email.com" className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Phone + Subject */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${G.primaryBorder}99` }}>
                          Phone
                        </label>
                        <input
                          type="tel" name="phone" value={form.phone} onChange={handleChange}
                          placeholder="+234 912 625 6756" className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${G.primaryBorder}99` }}>
                          Subject
                        </label>
                        <div className="relative">
                          <select
                            name="subject" value={form.subject} onChange={handleChange}
                            className={inputCls + " appearance-none pr-8"}
                          >
                            <option value="">Select…</option>
                            <option>Product Inquiry</option>
                            <option>Order Issue</option>
                            <option>Delivery Question</option>
                            <option>Bulk Purchase</option>
                            <option>General Question</option>
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: G.primaryBorder }}>▼</div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${G.primaryBorder}99` }}>
                        Message *
                      </label>
                      <textarea
                        rows={5} name="message" value={form.message} onChange={handleChange}
                        required placeholder="Tell us how we can help…"
                        className={inputCls + " resize-none"}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: G.primaryBorder,
                        color: G.dark,
                        boxShadow: `0 0 28px ${G.primaryBorder}40`,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.boxShadow = `0 0 40px ${G.primaryBorder}70`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 28px ${G.primaryBorder}40`;
                      }}
                    >
                      {loading ? "Sending…" : (
                        <>Send Message <Send size={14} /></>
                      )}
                    </button>

                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SOCIAL STRIP ─────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ backgroundColor: G.dark }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Follow Dase Supermarket
            </h3>
            <p className="text-sm mb-8" style={{ color: `${G.primaryBorder}99` }}>
              Stay updated with new arrivals, deals, and store news
            </p>
            <div className="flex justify-center gap-4">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook,  href: "#", label: "Facebook" },
                { icon: Twitter,   href: "#", label: "Twitter" },
              ].map(({ icon: Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.12 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
                  style={{ backgroundColor: `${G.primaryBorder}15` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = G.primaryBorder; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${G.primaryBorder}15`; }}
                >
                  <Icon size={18} style={{ color: G.primaryBorder }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </main>

     <DaseAboutSection />
    </>
  );
}