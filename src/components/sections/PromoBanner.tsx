"use client"
// components/sections/PromoBanner.tsx

import { motion } from "framer-motion"
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react"

export default function PromoBanner() {
  return (
    <section className="py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3d25] via-[#1a5c38] to-[#2d7a4f] p-8 md:p-14"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #7ec89a, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #52d68a, transparent)", transform: "translate(-30%, 30%)" }} />

          {/* Big SVG background illustration */}
          <svg className="absolute right-8 bottom-0 h-full opacity-10 hidden lg:block" viewBox="0 0 300 240" fill="none">
            <circle cx="200" cy="120" r="100" fill="white"/>
            <path d="M80 60 L120 60 L140 160 H240 L260 100 H100" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="140" cy="185" r="18" fill="white"/>
            <circle cx="215" cy="185" r="18" fill="white"/>
          </svg>

          <div className="relative z-10 max-w-xl">
            {/* Tag */}
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-[#7ec89a]/20 text-[#7ec89a] border border-[#7ec89a]/30 mb-5"
            >
              <Sparkles size={12} /> Grand Opening Offer
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            >
              Get <span className="text-[#7ec89a]">10% Off</span> Your First Online Order
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-base md:text-lg leading-relaxed mb-8"
            >
              Celebrate our grand opening with exclusive online discounts. Use code{" "}
              <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg tracking-widest">DASE10</span>{" "}
              at checkout.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#7ec89a] text-[#0d3d25] text-sm font-extrabold shadow-lg shadow-[#0d3d25]/30 hover:bg-[#93d4aa] transition-colors"
              >
                <ShoppingBag size={16} /> Shop Now
              </motion.button>
              <button className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                Learn more <ArrowRight size={15} />
              </button>
            </motion.div>

            {/* Countdown placeholder */}
            <div className="flex items-center gap-4 mt-8">
              {[["06", "Hours"], ["24", "Minutes"], ["38", "Seconds"]].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-white tabular-nums">{num}</div>
                  <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{label}</div>
                </div>
              ))}
              <span className="text-white/30 text-xl font-light mb-3">remaining</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}