"use client"
// components/HorizontalFoodCard.tsx

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, Check, Flame, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { type CardProduct, formatPrice } from "@/components/ProductCard"

type Props = {
  product: CardProduct
  delay?:  number
}

const PRIMARY   = "#C0392B"
const PRIMARY_H = "#A93226"
const BG_SOFT   = "#FDF0EF"

export default function HorizontalFoodCard({ product, delay = 0 }: Props) {
  const router                  = useRouter()
  const { addToCart, isInCart } = useCart()
  const [added, setAdded]       = useState(false)

  const primaryImage  = product.images[0]
  const alreadyInCart = isInCart(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.inStock || !primaryImage) return

    addToCart({
      id:             product.id,
      name:           product.name,
      description:    product.description,
      itemType:       "food",
      category:       product.category,
      brand:          product.brand ?? "",
      price:          product.price,
      imageColor:     primaryImage.color,
      imageColorCode: primaryImage.colorCode,
      imageUrl:       primaryImage.image,
    })

    toast.success(`${product.name} added to cart`, {
      description: `${product.category} · ${formatPrice(product.price)}`,
      duration: 2000,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleCardClick = () => {
    router.push(`/food/${product.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay }}
      whileTap={{ scale: 0.985 }}
      onClick={handleCardClick}
      className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-200 p-2.5 cursor-pointer overflow-hidden"
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-xl overflow-hidden"
        style={{ background: BG_SOFT }}
      >
        {primaryImage ? (
          <Image
            src={primaryImage.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl select-none">🍽️</div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[8px] font-bold text-gray-400 uppercase">Unavail.</span>
          </div>
        )}

        {/* Spicy badge */}
        {product.spicy && (
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-red-600 text-white rounded-full px-1 py-0.5">
            <Flame size={7} />
            <span className="text-[7px] font-bold">Spicy</span>
          </div>
        )}
      </div>

      {/* ── Info ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h3
          className="font-bold text-sm leading-snug line-clamp-1"
          style={{ color: PRIMARY }}
        >
          {product.name}
        </h3>

        <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
          {product.description}
        </p>

        {product.prepTime && (
          <div className="flex items-center gap-0.5 text-gray-300 mt-0.5">
            <Clock size={8} />
            <span className="text-[9px]">{product.prepTime}</span>
          </div>
        )}
      </div>

      {/* ── Price + CTA ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-end gap-1.5 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="text-sm font-extrabold leading-none whitespace-nowrap"
          style={{ color: PRIMARY }}
        >
          {formatPrice(product.price)}
        </span>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: added || alreadyInCart ? PRIMARY_H : PRIMARY }}
        >
          {added || alreadyInCart ? (
            <><Check size={10} />{added ? "Added" : "In Cart"}</>
          ) : (
            <><ShoppingCart size={10} />Order</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}