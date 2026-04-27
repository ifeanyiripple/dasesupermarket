"use client"
// components/sections/FeaturedProducts.tsx

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/client"
import ProductCard, { type CardProduct } from "@/components/ProductCard"
import Link from "next/link"
import ShuffledProductGrid from "../ShuffledProductGrid"

// ── Skeleton card ─────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 md:h-48 bg-gray-100" />
      <div className="p-2.5 md:p-3.5 flex flex-col gap-2">
        <div className="h-2 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="h-7 bg-gray-100 rounded-lg mt-2" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FeaturedProducts() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "featured"],
    queryFn:  async () => {
      const res     = await client.products.getFeaturedProducts.$get()
      const rawText = await res.text()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const superjson = require("superjson")
      const parsed  = superjson.parse(rawText) as { success: boolean; products: CardProduct[] }
      return parsed.products ?? []
    },
    staleTime: 1000 * 60 * 5, // cache 5 minutes
  })

  const products = data ?? []

  return (
    <section className="py-6 md:py-14 bg-[#f7fdf9]">
      <div className="max-w-7xl mx-auto px-2 md:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#2d7a4f] mb-1">Hand Picked</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Featured Products</h2>
          </div>
          <Link href="/shop">
            <motion.span
              whileHover={{ x: 4 }}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1a5c38] hover:text-[#2d7a4f] transition-colors cursor-pointer"
            >
              View all <ArrowRight size={16} />
            </motion.span>
          </Link>
        </motion.div>

        {/* Loading */}
        {isPending && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Could not load products. Please refresh the page.
          </div>
        )}

        {/* Empty */}
        {!isPending && !isError && products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No featured products yet — check back soon!
          </div>
        )}

        {/* Grid */}
        {!isPending && !isError && products.length > 0 && (
       <ShuffledProductGrid products={products} />
        )}

        {/* Mobile "View all" */}
        <div className="flex justify-center mt-6">
          <Link href="/shop">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#1a5c38] text-[#1a5c38] text-sm font-bold hover:bg-[#1a5c38] hover:text-white transition-all">
              View all products <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}