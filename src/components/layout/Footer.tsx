// components/layout/Footer.tsx

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

const QUICK_LINKS   = ["Shop", "Categories", "Deals", "New Arrivals", "Best Sellers"]
const CUSTOMER_LINKS = ["My Account", "Track Order", "Returns & Refunds", "FAQ", "Contact Us"]
const CATEGORIES     = ["Fruits & Vegetables", "Dairy & Eggs", "Bakery", "Beverages", "Snacks", "Household"]

export default function Footer() {
  return (
    <footer className="bg-[#0a2a18] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2d7a4f] flex items-center justify-center">
                <span className="text-white font-extrabold text-base">D</span>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">DASE</span>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em]">Supermarket</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">
              Your neighbourhood supermarket, now online. Fresh groceries and daily essentials delivered to your door.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: MapPin,  text: "14 Market Road, Lagos, Nigeria" },
                { icon: Phone,   text: "+234 800 DASE MART" },
                { icon: Mail,    text: "hello@dasesupermarket.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-white/50">
                  <Icon size={13} className="text-[#2d7a4f] flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-white/80">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(link => (
                <li key={link}>
                  <Link href="#" className="text-sm text-white/50 hover:text-[#7ec89a] transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-white/80">Customer Service</h4>
            <ul className="flex flex-col gap-2.5">
              {CUSTOMER_LINKS.map(link => (
                <li key={link}>
                  <Link href="#" className="text-sm text-white/50 hover:text-[#7ec89a] transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-white/80">Categories</h4>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link href="#" className="text-sm text-white/50 hover:text-[#7ec89a] transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-14 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} DASE Supermarket. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Facebook,  href: "#" },
              { Icon: Instagram, href: "#" },
              { Icon: Twitter,   href: "#" },
              { Icon: Youtube,   href: "#" },
            ].map(({ Icon, href }) => (
              <Link key={href + Icon.displayName} href={href}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#2d7a4f] flex items-center justify-center transition-colors">
                <Icon size={14} className="text-white/50 hover:text-white" />
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="#" className="hover:text-white/60">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/60">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}