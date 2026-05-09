"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Leaf, ShieldCheck, Users, Truck, Star, Heart,
  ArrowRight, ShoppingBasket, Sparkles, Award,
  ArrowLeft, UtensilsCrossed, Hotel, Camera,
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

// ── Photo placeholder component ────────────────────────────────────────────
function PhotoPlaceholder({
  label,
  aspectClass = "aspect-[4/3]",
  className = "",
}: {
  label: string;
  aspectClass?: string;
  className?: string;
}) {
  return (
    <div
      className={`${aspectClass} ${className} rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed`}
      style={{ backgroundColor: "#f3f8ef", borderColor: G.primaryBorder }}
    >
      <Camera size={28} style={{ color: G.primaryBorder }} />
      <p className="text-xs font-semibold text-center px-4 leading-snug" style={{ color: G.primaryText }}>
        {label}
      </p>
    </div>
  );
}

// ── What We Do data ────────────────────────────────────────────────────────
const DIVISIONS = [
  {
    tag:   "Dase Supermarket",
    icon:  ShoppingBasket,
    title: "Your Everyday Store, Elevated",
    body: (
      <>
        <p>
          Walk into Dase Supermarket and you'll find everything a Nigerian household needs —
          all under one roof. From fresh <strong>Fruits & Vegetables</strong> and quality{" "}
          <strong>Meat & Fish</strong>, to everyday <strong>Grocery</strong> staples,{" "}
          <strong>Grains & Rice</strong>, and <strong>Swallow Foods</strong> — the essentials
          are always stocked and always fresh.
        </p>
        <p>
          Stocking your kitchen? We carry <strong>Dairy</strong>, <strong>Bakery</strong>,{" "}
          <strong>Beverages</strong>, <strong>Drinks</strong>, <strong>Snacks</strong>, and{" "}
          <strong>Frozen Foods</strong>. Need something for around the house? Browse our{" "}
          <strong>Household</strong> and <strong>Electronics</strong> sections too. As part of
          the DASE brand, we are committed to excellence, affordability, and a shopping
          experience that feels genuinely pleasant — every single time.
        </p>
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { label: "Fruits",        icon: "🍎" },
            { label: "Vegetables",    icon: "🥦" },
            { label: "Grocery",       icon: "🛍️" },
            { label: "Dairy",         icon: "🥛" },
            { label: "Bakery",        icon: "🍞" },
            { label: "Beverages",     icon: "🧃" },
            { label: "Snacks",        icon: "🍪" },
            { label: "Swallow Foods", icon: "🥘" },
            { label: "Drinks",        icon: "🥤" },
            { label: "Frozen Foods",  icon: "🧊" },
            { label: "Household",     icon: "🧹" },
            { label: "Meat & Fish",   icon: "🥩" },
            { label: "Grains & Rice", icon: "🌾" },
            { label: "Electronics",   icon: "🔌" },
          ].map(({ label, icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: G.primaryLight,
                borderColor: G.primaryBorder,
                color: G.primaryText,
              }}
            >
              <span>{icon}</span> {label}
            </span>
          ))}
        </div>
      </>
    ),
    photos: [
      { label: "UPDATE: Supermarket store front / entrance" },
      { label: "UPDATE: Inside the supermarket – shelves & aisles" },
    ],
    cta: { href: "/shop", label: "Browse Products" },
    reverse: false,
  },
  {
    tag:   "Royal Oyo Kitchen",
    icon:  UtensilsCrossed,
    title: "Freshly Made. Delivered Warm.",
    body: (
      <>
        <p>
          Royal Oyo Kitchen is our in-house restaurant that turns the finest farm produce into
          meals you'll genuinely crave. Every dish is made fresh — no shortcuts, no reheated
          leftovers. Whether you're dining in or ordering for delivery, the kitchen brings Oyo
          flavour with a premium touch.
        </p>
        <p>
          Our menu covers it all: smoky <strong>Jollof rice</strong>, fragrant{" "}
          <strong>Fried rice</strong>, crispy <strong>Fried chicken</strong>, loaded{" "}
          <strong>Shawarma</strong>, freshly baked <strong>bread and pastries</strong>,
          and rotating specials that change with the season. Order online and we'll deliver
          right to your door — still warm, still perfect.
        </p>
      </>
    ),
    photos: [
      { label: "UPDATE: Royal Oyo Kitchen – interior / chefs at work" },
      { label: "UPDATE: Signature dishes – Jollof rice, Shawarma, etc." },
    ],
    cta: { href: "/food", label: "See Our Menu" },
    reverse: true,
  },
  {
    tag:   "DASE Luxury Hotel",
    icon:  Hotel,
    title: "Rest in Comfort, Right in Oyo.",
    body: (
      <>
        <p>
          After a long day, there's nowhere better to unwind than DASE Luxury Hotel — our
          boutique hospitality wing offering elegantly appointed rooms with the warmth and
          attentiveness that defines everything we do under the DASE brand.
        </p>
        <p>
          Whether you're a business traveller, a family visiting Oyo, or simply looking for a
          short relaxing getaway, our rooms are designed to make you feel truly at home — with
          premium bedding, modern amenities, and the kind of personal service that big hotel
          chains rarely manage. Book directly for the best rates.
        </p>
      </>
    ),
    photos: [
      { label: "UPDATE: Hotel exterior / reception lobby" },
      { label: "UPDATE: Luxury room interior" },
    ],
    cta: { href: "https://www.daseluxuryhotel.com", label: "Book a Room", external: true },
    reverse: false,
  },
];

// ── Gallery photos ──────────────────────────────────────────────────────────
const GALLERY_PHOTOS = [
  { label: "UPDATE: Wide shot of supermarket floor" },
  { label: "UPDATE: Royal Oyo Kitchen dining area" },
  { label: "UPDATE: Freshly delivered farm produce" },
  { label: "UPDATE: Hotel room – bed & decor" },
  { label: "UPDATE: Staff serving / customer interaction" },
  { label: "UPDATE: Outdoor / building facade" },
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

            {/* ── UPDATED HERO PARAGRAPH ── */}
            <motion.p variants={fadeUp} className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
              DASE is a full-service lifestyle brand rooted in Oyo — home to a{" "}
              <span className="text-white font-medium">premium supermarket</span> stocked with
              fresh farm produce and everyday essentials, the{" "}
              <span className="text-white font-medium">Royal Oyo Kitchen</span> serving freshly
              made Nigerian and continental meals for dine-in and delivery, and{" "}
              <span className="text-white font-medium">DASE Luxury Hotel</span> offering elegant
              rooms for rest and relaxation. Everything you need — food, groceries, comfort — in
              one trusted place.
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-[#1a5c38] transition-colors flex items-center gap-1 whitespace-nowrap">
            <ArrowLeft size={12} /> Home
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium whitespace-nowrap">About Us</span>
        </div>
      </div>

      {/* ── WHAT WE DO — three divisions ────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: G.primaryText }}
            >
              What We Do
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3">
              One Brand. Three Experiences.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
              Under the DASE name, we've built three things that Oyo truly deserves — a world-class
              supermarket, a kitchen that cooks from the heart, and a hotel that makes every stay
              memorable.
            </p>
          </motion.div>

          {/* Division blocks */}
          <div className="space-y-28">
            {DIVISIONS.map(({ tag, icon: Icon, title, body, photos, cta, reverse }, idx) => (
              <motion.div
                key={tag}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className={`grid lg:grid-cols-2 gap-14 items-center ${reverse ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Text side */}
                <motion.div variants={reverse ? slideRight : slideLeft} className={reverse ? "lg:col-start-2" : ""}>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="h-px w-10"
                      style={{ backgroundColor: G.primaryBorder }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: G.primaryText }}
                    >
                      {tag}
                    </span>
                  </div>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: G.primaryLight }}
                  >
                    <Icon size={22} style={{ color: G.primary }} />
                  </div>

                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                    {title}
                  </h3>

                  <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                    {body}
                  </div>

                  <Link
                    href={(cta as { href: string; label: string; external?: boolean }).href}
                    {...((cta as { href: string; label: string; external?: boolean }).external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ backgroundColor: G.primary, color: "white" }}
                  >
                    {cta.label} <ArrowRight size={14} />
                  </Link>
                </motion.div>

                {/* Photos side */}
                <motion.div
                  variants={reverse ? slideLeft : slideRight}
                  className={`grid grid-cols-2 gap-4 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}
                >
                  <PhotoPlaceholder
                    label={photos[0].label}
                    aspectClass="aspect-[3/4]"
                    className="col-span-1 row-span-1"
                  />
                  <PhotoPlaceholder
                    label={photos[1].label}
                    aspectClass="aspect-[3/4]"
                    className="col-span-1 row-span-1 mt-8"
                  />
                </motion.div>
              </motion.div>
            ))}
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

      {/* ── PHOTO GALLERY ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
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
              A Glimpse Inside
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3">
              See It for Yourself
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed">
              Photos speak louder than words. Here's a look at what makes DASE the go-to destination
              in Oyo.
            </p>
          </motion.div>

          {/* Masonry-style grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {GALLERY_PHOTOS.map((photo, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={i === 0 || i === 3 ? "md:row-span-2" : ""}
              >
                <PhotoPlaceholder
                  label={photo.label}
                  aspectClass={i === 0 || i === 3 ? "aspect-[3/4] md:h-full" : "aspect-square"}
                  className="w-full h-full"
                />
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
              Visit us in Oyo or order online — fresh groceries, hot meals, and a warm bed
              whenever you need one. Because you deserve better.
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
                href="/food"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
                style={{ backgroundColor: G.dark, color: "white" }}
              >
                <UtensilsCrossed size={14} /> Order Food
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