"use client"
// app/categories/[category]/_components/CategoryProductsClient.tsx

import { motion } from "framer-motion"
import ProductCard, { type CardProduct } from "@/components/ProductCard"
import CategoryIcon from "@/components/categories/CategoryIcon"

type Props = {
  products: CardProduct[]
  category: string
}

export default function CategoryProductsClient({ products, category }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-gray-100">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            backgroundColor: "var(--theme-primary-light, #EAF3DE)",
            color: "var(--theme-primary, #1a5c38)",
          }}
        >
          <CategoryIcon label={category} size={28} />
        </div>
        <p className="font-black text-gray-900">No {category.toLowerCase()} yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          We&apos;re restocking this aisle — check back soon or browse other categories.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} delay={idx * 0.03} />
      ))}
    </motion.div>
  )
}