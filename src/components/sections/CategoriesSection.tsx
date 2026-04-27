"use client"
// components/sections/CategoriesSection.tsx

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DEMO_CATEGORIES } from "@/lib/demo-data"

type Props = {
  onCategorySelect?: (id: string | null) => void
  selected?: string | null
}

export default function CategoriesSection({ onCategorySelect, selected }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive]         = useState<string | null>(null)
  const [canLeft, setCanLeft]       = useState(false)
  const [canRight, setCanRight]     = useState(true)

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" })
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const handleSelect = (id: string) => {
    const next = active === id ? null : id
    setActive(next)
    onCategorySelect?.(next)
  }

  return (
    <section className="py-7 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-4"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#2d7a4f] mb-1">Browse By</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Categories</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canLeft}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#2d7a4f] hover:text-[#2d7a4f] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canRight}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#2d7a4f] hover:text-[#2d7a4f] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* Scrollable row */}
        <div className="relative">
          {/* Fade edges */}
          {canLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          )}
          {canRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
          )}

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
           {/* All category */}
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.97 }}
  onClick={() => handleSelect("all")}
  className={`flex-shrink-0 flex flex-col items-center gap-1 md:gap-2 px-3 md:px-5 py-2.5 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all min-w-[72px] md:min-w-[100px]
    ${active === "all"
      ? "border-[#1a5c38] bg-[#1a5c38] text-white shadow-lg shadow-[#1a5c38]/20"
      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-[#2d7a4f]/40"
    }`}
>
  <span className="text-xl md:text-3xl">🛒</span>
  <span className="text-[10px] md:text-xs font-bold whitespace-nowrap">All Items</span>
  <span className="text-[9px] md:text-[10px] opacity-60">300+</span>
</motion.button>

{DEMO_CATEGORIES.map((cat, i) => {
  const isActive = active === cat.id
  return (
    <motion.button
      key={cat.id}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleSelect(cat.id)}
      className={`flex-shrink-0 flex flex-col items-center gap-1 md:gap-2 px-3 md:px-5 py-2.5 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all min-w-[72px] md:min-w-[100px]
        ${isActive
          ? "border-[#1a5c38] bg-[#1a5c38] text-white shadow-lg shadow-[#1a5c38]/20"
          : "border-gray-100 hover:border-[#2d7a4f]/40"
        }`}
      style={{ background: isActive ? "#1a5c38" : cat.color }}
    >
      <span className="text-xl md:text-3xl">{cat.icon}</span>
      <span className={`text-[10px] md:text-xs font-bold whitespace-nowrap ${isActive ? "text-white" : "text-gray-700"}`}>
        {cat.label}
      </span>
      <span className={`text-[9px] md:text-[10px] ${isActive ? "text-white/70" : "text-gray-400"}`}>
        {cat.count} items
      </span>
    </motion.button>
  )
})}
          </div>
        </div>
      </div>
    </section>
  )
}