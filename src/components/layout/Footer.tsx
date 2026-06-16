"use client"

import Link from "next/link"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "@/providers/theme-provider"

const QUICK_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sortBy=createdAt&sortOrder=desc" },
  { label: "Best Sellers", href: "/shop?badge=hot" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
]

const CUSTOMER_LINKS = [
  { label: "My Account", href: "/profile" },
  { label: "Track Order", href: "/orders" },
  { label: "Returns & Refunds", href: "/contact-us" },
  { label: "FAQ", href: "/contact-us" },
  { label: "Contact Us", href: "/contact-us" },
]

const CATEGORIES = [
  { id: "Grocery", label: "Grocery" },
  { id: "Drinks", label: "Drinks" },
  { id: "Beverages", label: "Beverages" },
  { id: "Dairy", label: "Dairy & Eggs" },
  { id: "Household", label: "Household" },
  { id: "Swallow Foods", label: "Swallow Foods" },
  { id: "Electronics", label: "Electronics & Appliances" },
]

const LOGO_MAP = {
  red:   "/logored.svg",
  amber: "/logobrown.svg",
  green: "/logo.svg",
} as const

function FooterLink({
  href,
  children,
  theme,
}: {
  href: string
  children: React.ReactNode
  theme: any
}) {
  return (
    <Link
      href={href}
      className="text-sm transition-colors duration-200"
      style={{ color: "rgba(255,255,255,0.6)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = theme.primaryBorder
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.6)"
      }}
    >
      {children}
    </Link>
  )
}

export default function Footer() {
  const { theme } = useTheme()
    const { colorKey }  = useTheme()
  const logoSrc = LOGO_MAP[colorKey] || "/logo.svg"

  return (
    <footer
      className="text-white z-100"
      style={{
        backgroundColor: theme.primaryHover,
      }}
    >
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src={logoSrc}
                alt="DASE Supermarket Logo"
                width={32}
                height={32}
                className="object-contain"
              />

              <div>
                <span className="font-extrabold text-xl tracking-tight">
                  DASE
                </span>

                <p
                  className="text-[9px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: theme.primaryBorder }}
                >
                  Supermarket
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-5 max-w-xs text-white/60">
              Your neighbourhood supermarket, now online. Fresh groceries and
              daily essentials delivered to your door.
            </p>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  icon: MapPin,
                  text: "Lane 7, Alhaja Serifat Biliaminu Street, Ayetoro. Oyo, Oyo State",
                },
                {
                  icon: Phone,
                  text: "+234 8164962637",
                },
                {
                  icon: Mail,
                  text: "support@dasesupermarket.com",
                },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-white/60"
                >
                  <Icon
                    size={13}
                    className="flex-shrink-0"
                    style={{ color: theme.primaryBorder }}
                  />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-bold text-sm mb-4 tracking-wider uppercase"
              style={{ color: theme.primaryLight }}
            >
              Quick Links
            </h4>

            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href} theme={theme}>
                    {label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4
              className="font-bold text-sm mb-4 tracking-wider uppercase"
              style={{ color: theme.primaryLight }}
            >
              Customer Service
            </h4>

            <ul className="flex flex-col gap-2.5">
              {CUSTOMER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href} theme={theme}>
                    {label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="font-bold text-sm mb-4 tracking-wider uppercase"
              style={{ color: theme.primaryLight }}
            >
              Categories
            </h4>

            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <FooterLink
                    href={`/shop?category=${encodeURIComponent(cat.id)}`}
                    theme={theme}
                  >
                    {cat.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t"
        style={{
          borderColor: `${theme.primaryBorder}30`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} DASE Supermarket. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {[
              { Icon: Facebook, href: "#" },
              {
                Icon: Instagram,
                href: "https://www.instagram.com/dasesupermarket/",
              },
              { Icon: Twitter, href: "#" },
              { Icon: Youtube, href: "#" },
            ].map(({ Icon, href }) => (
              <Link
                key={`${href}-${Icon.displayName}`}
                href={href}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)"
                }}
              >
                <Icon
                  size={14}
                  style={{
                    color: theme.primaryBorder,
                  }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/privacy-policy"
              className="transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.primaryBorder
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)"
              }}
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-and-conditions"
              className="transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.primaryBorder
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)"
              }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}