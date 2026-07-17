"use client"
// components/ProductCard.tsx

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import { ShoppingCart, Star, Heart, Check, Flame, Clock, BedDouble, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { useTheme } from "@/providers/theme-provider"

// ── Core card type — shared by products, foods AND rooms ──────────────────────
export type CardProduct = {
  id:            string
  name:          string
  description:   string
  price:         number
  originalPrice: number | null
  category:      string
  brand:         string | null
  inStock:       boolean
  badge:         string | null
  avgRating?:    number
  reviewCount?:  number
  // ── Food-specific extras ──────────────────────────────────────────────────
  itemType?:    "product" | "food" | "room"
  spicy?:       boolean
  prepTime?:    string
  // ── Room-specific extras ──────────────────────────────────────────────────
  capacity?:    number
  bed?:         string
  amenities?:   string[]
  roomStatus?:  "AVAILABLE" | "OCCUPIED"
  roomNumber?:  string
  images: {
    id:        string
    color:     string
    colorCode: string
    image:     string
  }[]
}

// ── Helper: convert a DB Food row to CardProduct ──────────────────────────────
export function foodToCardProduct(food: {
  id: string; name: string; description: string; price: number
  category: string; inStock: boolean; badge: string | null; image: string
  spicy: boolean; rating: number; prepTime: string; serves: number
}): CardProduct {
  return {
    id:            food.id,
    name:          food.name,
    description:   food.description,
    price:         food.price,
    originalPrice: null,
    category:      food.category,
    brand:         null,
    inStock:       food.inStock,
    badge:         food.badge,
    avgRating:     food.rating,
    reviewCount:   0,
    itemType:      "food",
    spicy:         food.spicy,
    prepTime:      food.prepTime,
    images: [{
      id:        food.id,
      color:     "Default",
      colorCode: "#C0392B",
      image:     food.image,
    }],
  }
}

// ── Helper: convert a DB Room row to CardProduct ──────────────────────────────
export function roomToCardProduct(room: {
  id: string; name: string; description: string; price: number
  roomNumber: string | null; capacity: number
  status: "AVAILABLE" | "OCCUPIED" ; bed: string | null
  amenities: any; images: string[]; featured: boolean
}): CardProduct {
  return {
    id:            room.id,
    name:          room.name,
    description:   room.description,
    price:         room.price,
    originalPrice: null,
    category:      "Hospitality",
    brand:         null,
    inStock:       room.status === "AVAILABLE",
    badge:         room.featured ? "Featured" : null,
    avgRating:     undefined,
    reviewCount:   0,
    itemType:      "room",
    capacity:      room.capacity,
    bed:           room.bed ?? undefined,
    amenities:     Array.isArray(room.amenities) ? room.amenities : [],
    roomStatus:    room.status,
    roomNumber:    room.roomNumber ?? undefined,
    images:        room.images.map((img, idx) => ({
      id:        `${room.id}-img-${idx}`,
      color:     "Default",
      colorCode: "#BA7517",
      image:     img,
    })),
  }
}

// ── Badge maps ────────────────────────────────────────────────────────────────
const PRODUCT_BADGE_STYLES: Record<string, string> = {
  new:     "bg-blue-500 text-white",
  sale:    "bg-red-500 text-white",
  hot:     "bg-orange-500 text-white",
  organic: "bg-[#1a5c38] text-white",
}
const PRODUCT_BADGE_LABELS: Record<string, string> = {
  new: "✨ New", sale: "Sale", hot: "🔥 Hot", organic: "🌿 Organic",
}

const FOOD_BADGE_STYLES: Record<string, string> = {
  "Popular":       "bg-red-500 text-white",
  "Chef's Pick":   "bg-orange-600 text-white",
  "New":           "bg-blue-500 text-white",
  "Spicy Special": "bg-red-700 text-white",
}

const ROOM_BADGE_STYLES: Record<string, string> = {
  "Featured": "bg-[#BA7517] text-white",
}

export const formatPrice = (price: number) =>
  `₦${price.toLocaleString("en-NG")}`

type Props = {
  product: CardProduct
  delay?:  number
}

export default function ProductCard({ product, delay = 0 }: Props) {
  const router                  = useRouter()
  const { addToCart, isInCart } = useCart()
  const { theme }               = useTheme()
  const [wished, setWished]     = useState(false)
  const [added,  setAdded]      = useState(false)

  const isFood = product.itemType === "food"
  const isRoom = product.itemType === "room"

  // ── Theme tokens using the theme provider ──────────────────────────────────
  const PRIMARY    = theme.primary
  const PRIMARY_H  = theme.primaryHover
  const BG_SOFT    = theme.primaryLight
  const IN_CART_BG = PRIMARY

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const rating      = product.avgRating   ?? 0
  const reviewCount = product.reviewCount ?? 0
  const primaryImage = product.images[0]

  // ── Badge rendering ───────────────────────────────────────────────────────
  const badgeStyle = product.badge
    ? isRoom
      ? (ROOM_BADGE_STYLES[product.badge]    ?? "bg-[#BA7517] text-white")
      : isFood
        ? (FOOD_BADGE_STYLES[product.badge]  ?? "bg-gray-500 text-white")
        : (PRODUCT_BADGE_STYLES[product.badge] ?? "")
    : ""

  const badgeLabel = product.badge
    ? isRoom
      ? product.badge
      : isFood
        ? product.badge
        : product.badge === "sale" && discount
          ? `${discount}% Off`
          : (PRODUCT_BADGE_LABELS[product.badge] ?? product.badge)
    : ""

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Rooms → open booking site instead
    if (isRoom) {
        router.push(`/hotel/${product.id}`)
      return
    }

    if (!product.inStock || !primaryImage) return

    addToCart({
      id:             product.id,
      name:           product.name,
      description:    product.description,
       itemType:       isFood ? "food" : "product",
      category:       product.category,
      brand:          product.brand ?? "",
      price:          product.price,
      imageColor:     primaryImage.color,
      imageColorCode: primaryImage.colorCode,
      imageUrl:       primaryImage.image,
    })

    toast.success(`${product.name} added to cart`, {
      description: isFood
        ? `${product.category} · ${formatPrice(product.price)}`
        : `${primaryImage.color} · ${formatPrice(product.price)}`,
      duration: 2000,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation()
    setWished(v => !v)
  }

  const alreadyInCart = !isRoom && isInCart(product.id)

  const handleCardClick = () => {
    if (isRoom) {
        router.push(`/hotel/${product.id}`)  
    } else {
      router.push(isFood ? `/food/${product.id}` : `/product/${product.id}`)
    }
  }

  // ── Room status label ─────────────────────────────────────────────────────
  const roomAvailable = product.roomStatus === "AVAILABLE"

  // ── Input style helpers ───────────────────────────────────────────────────
  const buttonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isRoom && product.inStock) {
      e.currentTarget.style.background = PRIMARY_H
    }
  }
  const buttonLeaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isRoom && product.inStock) {
      e.currentTarget.style.background = added || alreadyInCart ? PRIMARY_H : PRIMARY
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
      style={{ borderTop: `2px solid ${PRIMARY}22` }}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div
        className="relative h-36 md:h-48 overflow-hidden flex-shrink-0"
        style={{ background: BG_SOFT }}
      >
        {product.images.length > 0 ? (
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            loop={product.images.length > 1}
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            className="h-full w-full"
          >
            {product.images.map((img, idx) => (
              <SwiperSlide key={img.id ?? idx}>
                <div className="relative w-full h-36 md:h-48">
                  <Image
                    src={img.image}
                    alt={`${product.name} — ${img.color}`}
                    fill
                    //unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">
            {isRoom ? "🏨" : isFood ? "🍽️" : "🛒"}
          </div>
        )}

        {/* Badge */}
        {product.badge && badgeStyle && (
          <span className={`absolute top-2 left-2 z-10 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${badgeStyle}`}>
            {badgeLabel}
          </span>
        )}

        {/* Room status pill (bottom-left) */}
        {isRoom && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              roomAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
              {roomAvailable ? "Available" : "Occupied"}
            </span>
          </div>
        )}

        {/* Out of stock — food / product only */}
        {!isRoom && !product.inStock && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white px-2 py-1 rounded-full border border-gray-200">
              {isFood ? "Unavailable" : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className="absolute top-2 right-2 z-20 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart size={11} className={wished ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>

        {/* Spicy indicator (food only) */}
        {isFood && product.spicy && (
          <div
            className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-red-600 text-white rounded-full px-1.5 py-0.5"
            style={{ top: product.badge ? "24px" : "8px" }}
          >
            <Flame size={9} />
            <span className="text-[8px] font-bold">Spicy</span>
          </div>
        )}

        {/* In-cart indicator (product / food only) */}
        {alreadyInCart && (
          <div
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white rounded-full px-2 py-0.5"
            style={{ background: IN_CART_BG }}
          >
            <Check size={9} />
            <span className="text-[9px] font-bold">In cart</span>
          </div>
        )}
      </div>

      {/* ── Details ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 p-2.5 md:p-3.5 flex-1">
        <h3 className="font-bold text-gray-800 text-xs md:text-sm leading-snug line-clamp-2">
          {product.name}
          {isRoom && product.roomNumber && (
            <span className="ml-1 font-normal text-gray-400">#{product.roomNumber}</span>
          )}
        </h3>

        {/* Prep time (food) */}
        {isFood && product.prepTime && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={9} />
            <span className="text-[9px]">{product.prepTime}</span>
          </div>
        )}

        {/* Capacity + bed row (room) */}
        {isRoom && (
          <div className="flex items-center gap-2.5 text-gray-500">
            {product.capacity && (
              <span className="flex items-center gap-0.5 text-[9px]">
                <Users size={9} /> {product.capacity} guest{product.capacity > 1 ? "s" : ""}
              </span>
            )}
            {product.bed && (
              <span className="flex items-center gap-0.5 text-[9px]">
                <BedDouble size={9} /> {product.bed}
              </span>
            )}
          </div>
        )}

        {/* Amenity chips (room) */}
        {isRoom && product.amenities && product.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-[8px] bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium"
              >
                {a}
              </span>
            ))}
            {product.amenities.length > 3 && (
              <span className="text-[8px] text-gray-400 self-center">
                +{product.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating row */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={9}
                  className={
                    s <= Math.round(rating)
                      ? isFood  ? "fill-red-400 text-red-400"
                      : isRoom  ? "fill-amber-500 text-amber-500"
                      : "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              ))}
            </div>
            {!isFood && !isRoom && (
              <span className="text-[9px] md:text-[10px] text-gray-400 leading-none">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-1 mt-auto pt-1">
          <span
            className="text-sm md:text-base font-extrabold leading-none"
            style={{ color: PRIMARY }}
          >
            {formatPrice(product.price)}
          </span>
          {isRoom && (
            <span className="text-[9px] text-gray-400">/night</span>
          )}
          {product.originalPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through leading-none">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          disabled={!isRoom && !product.inStock}
          className="w-full mt-1.5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          style={{
            background: added || alreadyInCart ? PRIMARY_H : PRIMARY,
          }}
          onMouseEnter={buttonHoverStyle}
          onMouseLeave={buttonLeaveStyle}
        >
          {isRoom ? (
            <>View Detail</>
          ) : (
            <>
              <ShoppingCart size={11} className="md:w-3.5 md:h-3.5" />
              {added ? "Added ✓" : alreadyInCart ? "In Cart" : isFood ? "Order" : "Add to Cart"}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}