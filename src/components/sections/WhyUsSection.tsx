"use client"
// components/sections/WhyUsSection.tsx

import { motion } from "framer-motion"
import { Truck, Leaf, ShieldCheck, BadgePercent } from "lucide-react"

const FEATURES = [
  {
    icon: Leaf,
    title: "Fresh Products Daily",
    desc: "We source fruits, vegetables, and dairy fresh every single morning — straight from trusted local farms.",
    color: "#e8f5e9",
    iconColor: "#2d7a4f",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Orders placed before 2PM are delivered same day within your city. Track your package in real-time.",
    color: "#e3f2fd",
    iconColor: "#1565c0",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Shop with confidence using our encrypted checkout. We accept cards, bank transfer, and USSD.",
    color: "#fce4ec",
    iconColor: "#c62828",
  },
  {
    icon: BadgePercent,
    title: "Affordable Prices",
    desc: "We keep prices competitive and fair. Frequent deals, discounts, and loyalty rewards for regulars.",
    color: "#fff3e0",
    iconColor: "#e65100",
  },
]

export default function WhyUsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#2d7a4f] mb-2">Our Promise</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Why Shop With Us?</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
            DASE Supermarket is built around one goal: making your grocery shopping effortless and enjoyable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              style={{ background: f.color }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: f.iconColor }}
              >
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>

              {/* Decorative dot */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-40"
                style={{ background: f.iconColor }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}