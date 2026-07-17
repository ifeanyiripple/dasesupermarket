// components/sections/DaseAboutSection.tsx
// Add this section after your featured products / brands strip on the homepage.
// Replace the <img> src with your actual supermarket exterior photo.

"use client";

import Link from "next/link"
import Image from "next/image"
import { MapPin, ShoppingBag } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"

const PRODUCT_CATEGORIES = [
  { id: "Grocery",       label: "Grocery" },
  { id: "Drinks",        label: "Drinks" },
  { id: "Beverages",     label: "Beverages" },
  { id: "Dairy",         label: "Dairy & Eggs" },
  { id: "Household",     label: "Household" },
  { id: "Swallow Foods", label: "Swallow Foods" },
  { id: "Electronics",   label: "Electronics & Appliances" },
]

export default function DaseAboutSection() {
  const { theme } = useTheme();

  // ── Input style helpers ───────────────────────────────────────────────────
  const buttonHoverStyle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = theme.primaryHover;
  };
  const buttonLeaveStyle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = theme.primary;
  };

  return (
    <section className="bg-white border-t border-gray-100">

      {/* ── Top: photo + intro ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Photo — replace src with your real exterior image */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-[#EAF3DE]">
            {/*
              ↓ REPLACE THIS with your actual supermarket exterior photo.
              Recommended: a bright, wide-angle shot of the storefront.
              Minimum size: 1200 × 900px.
            */}
            <Image
              src="/dasesupermarket.jpg"
              alt="Dase Supermarket — Oyo Town, Oyo State"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Location chip overlaid on photo */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <MapPin size={14} style={{ color: theme.primary }} />
              <span className="text-xs font-bold text-gray-800">Dasesupermarket, Ayetoro. Oyo Town</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-5">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              <strong className="text-gray-800">Dase Supermarket</strong> is a real, fully
              stocked supermarket on{" "}
              <strong className="text-gray-800">Lane 7, Alhaja Serifat Biliaminu Street, Ayetoro. Oyo, Oyo State</strong>, recognised as
              the best supermarket in Oyo State for fresh produce, groceries, household
              essentials, drinks, electronics, and everyday home goods. Everything you'd
              expect to find on our shelves in-store is also available to shop online at{" "}
              <a
                href="https://www.dasesupermarket.com"
                style={{ color: theme.primary }}
                className="font-semibold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                dasesupermarket.com
              </a>
              , making us Oyo's best online shopping supermarket as well — order your
              groceries, cleaning supplies, and household items and have them delivered
              straight to your door.
            </p>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Dase Supermarket is also part of the wider{" "}
              <strong className="text-gray-800">DASE</strong> brand, which includes{" "}
              <strong className="text-gray-800">Royal Oyo Kitchen</strong>, our in-house
              restaurant serving fresh Nigerian and continental meals, and{" "}
              <strong className="text-gray-800">DASE Luxury Hotel</strong>, offering
              comfortable rooms for travellers and families visiting Oyo. Whether you're
              shopping for your weekly groceries, ordering a hot meal, or booking a room
              for the night, it's all part of one trusted DASE experience.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/shop"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-colors shadow-md"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={buttonHoverStyle}
                onMouseLeave={buttonLeaveStyle}
              >
                <ShoppingBag size={15} /> Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product categories strip ───────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-[#f8fdf9] py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12">

          <div className="text-center mb-7">
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: theme.primary }}>
              What We Sell
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">
              Everything Your Home Needs, In One Place
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto leading-relaxed">
              As Oyo's best supermarket, in-store and online, we stock a full range
              of groceries, household goods, cleaning supplies, and everyday essentials.
            </p>
          </div>
     
          <div className="flex flex-wrap justify-center gap-2.5">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.id)}`}
                className="px-4 py-2 rounded-full border bg-white text-sm font-medium transition-all duration-200"
                style={{ 
                  borderColor: theme.primaryBorder,
                  color: theme.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = theme.primaryText;
                  e.currentTarget.style.borderColor = theme.primaryBorder;
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            Can't find what you're looking for? Our shelves carry thousands more brands
            and products in-store. Visit us on <strong className="text-gray-700">Lane 7, Alhaja Serifat Biliaminu Street, Ayetoro. Oyo, Oyo State</strong>{" "}
            or{" "}
            <a 
              href="https://www.dasesupermarket.com" 
              style={{ color: theme.primary }}
              className="font-semibold hover:underline"
            >
              search our full catalogue online
            </a>
            {" "}— we restock daily and take special requests.
          </p>
        </div>
      </div>

    </section>
  )
}