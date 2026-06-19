"use client"
// components/ShuffledProductGrid.tsx
// Wraps any product array — shuffles once on mount, never re-shuffles on re-render

import { useMemo } from "react"
import ProductCard, { type CardProduct } from "@/components/ProductCard"
import { shuffle } from "@/utils/shuffle"

type Props = {
  products: CardProduct[]
  columns?: "4" | "3" | "2"  // override grid columns if needed
  delayMultiplier?: number
  limit?: number  
}

export default function ShuffledProductGrid({
  products,
  columns = "4",
  delayMultiplier = 0.05,
  limit,
}: Props) {
  // useMemo with empty deps → shuffle runs exactly once per mount
  // If the parent re-renders (e.g. filters change), the shuffle is stable
  // until the component unmounts and remounts (which happens on page nav)
  const shuffled = useMemo(() => {
    const all = shuffle(products)
    return typeof limit === "number" ? all.slice(0, limit) : all
  }, [products, limit])

  const gridClass = {
    "4": "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5",
    "3": "grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5",
    "2": "grid grid-cols-2 gap-4 md:gap-5",
  }[columns]

  return (
    <div className={gridClass}>
      {shuffled.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          delay={i * delayMultiplier}
        />
      ))}
    </div>
  )
}