"use client"
// components/sections/PopularDeals.tsx

import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/client"
import ProductCard, { type CardProduct } from "@/components/ProductCard"
import Link from "next/link"
import ShuffledProductGrid from "../ShuffledProductGrid"

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 md:h-48 bg-gray-100" />
      <div className="p-2.5 md:p-3.5 flex flex-col gap-2">
        <div className="h-2 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-7 bg-gray-100 rounded-lg mt-2" />
      </div>
    </div>
  )
}

export default function PopularDeals() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "deals"],
    queryFn:  async () => {
      // Fetch products with "sale" or "hot" badge
      const res     = await client.products.getProducts.$get({
        badge:     "sale",
        limit:     8,
        page:      1,
        sortBy:    "createdAt",
        sortOrder: "desc",
      })
      const rawText = await res.text()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const superjson = require("superjson")
      const parsed  = superjson.parse(rawText) as { success: boolean; products: CardProduct[] }
      return parsed.products ?? []
    },
    staleTime: 1000 * 60 * 5,
  })

  const products = data ?? []

  return (
    <section className="py-6 md:py-14 bg-[#f7fdf9]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-red-500 mb-1 flex items-center gap-1">
              <Zap size={11} className="fill-red-500" /> Limited Time
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Popular Deals</h2>
          </div>
          <Link href="/shop?badge=sale">
            <motion.span
              whileHover={{ x: 4 }}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1a5c38] hover:text-[#2d7a4f] transition-colors cursor-pointer"
            >
              All deals <ArrowRight size={16} />
            </motion.span>
          </Link>
        </motion.div>

        {isPending && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Could not load deals. Please refresh the page.
          </div>
        )}

        {!isPending && !isError && products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No deals available right now — check back soon!
          </div>
        )}

        {!isPending && !isError && products.length > 0 && (
         <ShuffledProductGrid products={products} />
        )}
      </div>
    </section>
  )
}