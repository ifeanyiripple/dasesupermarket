"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Leaf, ShieldCheck, Users, Truck, Star, Heart,
  ArrowRight, ShoppingBasket, Sparkles, Award,
} from "lucide-react";

// ── Green palette (matches supermarket theme) ──────────────────────────────
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
// ── Data ───────────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: Leaf,
    title: "Fresh & Quality",
    body:  "We source fresh produce daily, partnering directly with trusted local farms to bring the best to your table.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Standards",
    body:  "Every product on our shelves passes rigorous quality checks. We don't stock it unless we'd buy it ourselves.",
  },
  {
    icon: Heart,
    title: "Community First",
    body:  "Dase Supermarket was built for Oyo. We reinvest in the community that has made us who we are.",
  },
  {
    icon: Award,
    title: "Affordability",
    body:  "Premium doesn't have to mean expensive. We keep prices fair so every family can shop with confidence.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    body:  "Order online and receive your groceries at your door, delivered fresh and on time by our local riders.",
  },
  {
    icon: Users,
    title: "Friendly Service",
    body:  "From our in-store team to our customer care line, we make every interaction warm, helpful, and human.",
  },
];

const STATS = [
  { value: "2,000+", label: "Products In‑Store" },
  { value: "500+",   label: "Families Served Daily" },
  { value: "100%",   label: "Fresh Produce Promise" },
  { value: "5★",     label: "Community Rating" },
];

const CATEGORIES = [
  { label: "Fresh Produce",     emoji: "🥦" },
  { label: "Quality Groceries", emoji: "🛒" },
  { label: "Household Items",   emoji: "🏠" },
  { label: "Dairy & Bakery",    emoji: "🥛" },
  { label: "Beverages",         emoji: "🧃" },
  { label: "Personal Care",     emoji: "🧴" },
];

// ── Page ───────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[72vh] flex items-end pb-20 px-6"
        style={{ background: `linear-gradient(145deg, ${G.dark} 0%, ${G.primary} 60%, #2d7a4f 100%)` }}
      >
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Large decorative leaf shape */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#C0DD97", filter: "blur(80px)", transform: "translate(30%, -30%)" }}
        />

        <div className="relative max-w-7xl mx-auto w-full">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${G.primaryBorder}30`, color: G.primaryBorder }}
              >
                <ShoppingBasket size={12} />
                About Us
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl md:text-7xl font-bold text-white leading-none mb-6"
            >
              More Than a
              <br />
              <span style={{ color: G.primaryBorder }}>Supermarket.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
              Dase Supermarket is a premium community supermarket offering fresh produce, quality
              groceries, household essentials, and carefully selected everyday products — all under
              one roof in the heart of Oyo.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ backgroundColor: G.primaryBorder, color: G.dark }}
              >
                Shop Now <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STORY SECTION ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideLeft}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-px flex-1 max-w-[48px]"
                  style={{ backgroundColor: G.primaryBorder }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: G.primaryText }}
                >
                  Our Story
                </span>
              </div>

              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Built for Oyo,
                <br />
                <span style={{ color: G.primary }}>By Oyo.</span>
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Dase Supermarket was born from a simple belief: that people in Oyo deserve a
                  shopping experience that rivals anything you'd find in Lagos or Abuja — right
                  here at home.
                </p>
                <p>
                  As part of the wider DASE brand — which spans hospitality, food services, and
                  farm produce — our supermarket brings together the best of every division. We
                  source directly from DASE farms and trusted regional suppliers, cutting out
                  middlemen to give you better quality at fairer prices.
                </p>
                <p>
                  We are committed to <span className="font-semibold" style={{ color: G.primaryText }}>excellence</span>,{" "}
                  <span className="font-semibold" style={{ color: G.primaryText }}>affordability</span>, and a{" "}
                  <span className="font-semibold" style={{ color: G.primaryText }}>pleasant shopping experience</span> — always.
                </p>
              </div>
            </motion.div>

            {/* Right — stacked cards */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideRight}
              className="relative"
            >
              {/* Main card */}
              <div
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{ backgroundColor: G.primary }}
              >
                <div
                  className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-20"
                  style={{ backgroundColor: G.primaryBorder }}
                />
                <Sparkles size={28} className="mb-4" style={{ color: G.primaryBorder }} />
                <p className="font-serif text-2xl font-bold text-white leading-snug mb-3">
                  "Our goal is to provide convenience, value, and trusted service to every customer
                  who walks through our doors."
                </p>
                <p className="text-sm" style={{ color: G.primaryBorder }}>
                  — The DASE Team
                </p>
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3"
                style={{ backgroundColor: "white", border: `1.5px solid ${G.primaryBorder}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: G.primaryLight }}
                >
                  <Star size={16} fill={G.primary} style={{ color: G.primary }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: G.primaryText }}>Top-Rated in Oyo</p>
                  <p className="text-xs text-gray-500">Community's favourite store</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: G.primaryLight }} className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <p className="font-serif text-5xl font-bold mb-1" style={{ color: G.primary }}>
                  {s.value}
                </p>
                <p className="text-sm font-medium" style={{ color: G.primaryText }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VALUES GRID ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: G.primaryText }}
            >
              Why Choose Us
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3">
              What We Stand For
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed">
              Six principles that guide every product we stock, every price we set, and every
              interaction we have with our community.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {VALUES.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group p-7 rounded-2xl border transition-all duration-300"
                style={{
                  borderColor: G.primaryBorder,
                  backgroundColor: "white",
                }}
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
                >
                  <Icon size={20} style={{ color: G.primary }} />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHAT WE CARRY ────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: G.dark }}>
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
              style={{ color: G.primaryBorder }}
            >
              Our Range
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-3">
              Everything You Need
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {CATEGORIES.map(({ label, emoji }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl p-5 text-center cursor-default transition-all"
                style={{ backgroundColor: `${G.primaryBorder}15`, border: `1px solid ${G.primaryBorder}25` }}
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <p className="text-sm font-semibold" style={{ color: G.primaryBorder }}>
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ backgroundColor: G.primaryLight, color: G.primaryText }}
            >
              <ShoppingBasket size={12} /> Shop With Us
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Ready to Experience
              <br />
              <span style={{ color: G.primary }}>Dase Supermarket?</span>
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Visit us in Oyo or order online — fresh, quality groceries delivered right to your
              door. Because you deserve better.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
                style={{ backgroundColor: G.primary, color: "white" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = G.primaryHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = G.primary; }}
              >
                Browse Products <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border transition-all"
                style={{ borderColor: G.primaryBorder, color: G.primaryText }}
              >
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}