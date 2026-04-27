"use client"
// app/food/[id]/FoodDetailClient.tsx

import { useState }                        from "react"
import Image                               from "next/image"
import Link                                from "next/link"
import { motion, AnimatePresence }         from "framer-motion"
import {
  ShoppingCart, Heart, Star, Share2, Shield, Truck,
  RotateCcw, Minus, Plus, Check, ArrowLeft, Zap,
  Flame, Clock, Users, ChefHat, MessageSquare,
} from "lucide-react"
import { useCart }     from "@/context/cart-context"
import { formatPrice } from "@/components/ProductCard"
import { toast }       from "sonner"

// ── Meat option type ───────────────────────────────────────────────────────────
export type MeatOptionItem = {
  id:        string
  name:      string
  price:     number
  isDefault: boolean
}

// ── DB Food type ───────────────────────────────────────────────────────────────
export type DBFood = {
  id:          string
  name:        string
  category:    string
  description: string
  price:       number
  image:       string
  badge:       string | null
  spicy:       boolean
  rating:      number
  prepTime:    string
  serves:      number
  inStock:     boolean
  isFeatured:  boolean
  meatOptions: MeatOptionItem[]
  createdAt:   Date | string
  updatedAt:   Date | string
}

// ── Theme ──────────────────────────────────────────────────────────────────────
const PRIMARY   = "#C0392B"
const PRIMARY_H = "#A93226"
const BG_SOFT   = "#FDF0EF"

const TRUST_ITEMS = [
  { icon: Truck,     label: "Fast Prep",    sub: "Ready in your wait time" },
  { icon: Shield,    label: "Fresh & Hot",  sub: "Cooked to order"         },
  { icon: RotateCcw, label: "Satisfaction", sub: "Or we remake it"         },
]

const FOOD_BADGE_STYLES: Record<string, string> = {
  "Popular":       "bg-red-500 text-white",
  "Chef's Pick":   "bg-orange-600 text-white",
  "New":           "bg-blue-500 text-white",
  "Spicy Special": "bg-red-700 text-white",
}

// ─────────────────────────────────────────────────────────────────────────────
type Props = { food: DBFood }

export default function FoodDetailClient({ food }: Props) {
  const { addToCart, isInCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [wished,   setWished]   = useState(false)
  const [added,    setAdded]    = useState(false)
  const [note,     setNote]     = useState("")

  // ── Meat option state ──────────────────────────────────────────────────────
  const hasMeatOptions = food.meatOptions && food.meatOptions.length > 0
  const defaultMeat    = hasMeatOptions
    ? (food.meatOptions.find((m) => m.isDefault) ?? food.meatOptions[0])
    : null
  const [selectedMeatId, setSelectedMeatId] = useState<string | null>(
    defaultMeat?.id ?? null
  )

  const selectedMeat  = hasMeatOptions
    ? (food.meatOptions.find((m) => m.id === selectedMeatId) ?? defaultMeat)
    : null

  const effectivePrice = selectedMeat ? selectedMeat.price : food.price
  const alreadyInCart  = isInCart(food.id)

  const handleAddToCart = () => {
    const meatLabel = selectedMeat ? ` (${selectedMeat.name})` : ""
    const noteText  = note.trim() ? ` — Note: ${note.trim()}` : ""

    addToCart({
      id:             food.id,
      name:           `${food.name}${meatLabel}`,
      description:    `${food.description}${noteText}`,
      itemType:       "food",
      category:       food.category,
      brand:          "",
      price:          effectivePrice,
      imageColor:     selectedMeat?.name ?? "Default",
      imageColorCode: PRIMARY,
      imageUrl:       food.image,
    })

    toast.success(`${food.name}${meatLabel} added to cart`, {
      description: `${food.category} · ${formatPrice(effectivePrice)}`,
      duration: 2000,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: "#FFFAF9" }}>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-[#C0392B] transition-colors flex items-center gap-1 whitespace-nowrap">
            <ArrowLeft size={12} /> Home
          </Link>
          <span>/</span>
          <Link href="/?tab=restaurant" className="hover:text-[#C0392B] transition-colors whitespace-nowrap">Restaurant</Link>
          <span>/</span>
          <span className="text-gray-500 whitespace-nowrap">{food.category}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[140px]">{food.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* LEFT: Food image ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-3"
          >
            <div
              className="relative rounded-3xl overflow-hidden shadow-xl h-[280px] sm:h-[360px] md:aspect-square"
              style={{ background: BG_SOFT }}
            >
              <Image
                src={food.image}
                alt={food.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {food.badge && FOOD_BADGE_STYLES[food.badge] && (
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full shadow ${FOOD_BADGE_STYLES[food.badge]}`}>
                    {food.badge}
                  </span>
                </div>
              )}

              {food.spicy && (
                <div
                  className="absolute z-10 flex items-center gap-1 text-white rounded-full px-2.5 py-1 text-xs font-bold shadow"
                  style={{
                    background: PRIMARY,
                    top:  food.badge ? "52px" : "16px",
                    left: "16px",
                  }}
                >
                  <Flame size={12} /> Spicy
                </div>
              )}

              <button
                onClick={() => setWished(v => !v)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Heart size={16} className={wished ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white">
                  <Clock size={13} />
                  <span className="text-xs font-semibold">{food.prepTime}</span>
                </div>
                <div className="w-px h-3 bg-white/40" />
                <div className="flex items-center gap-1.5 text-white">
                  <Users size={13} />
                  <span className="text-xs font-semibold">Serves {food.serves}</span>
                </div>
                {food.rating > 0 && (
                  <>
                    <div className="w-px h-3 bg-white/40" />
                    <div className="flex items-center gap-1 text-white">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{food.rating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Food info ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: PRIMARY }}>
                {food.category}
              </span>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Share2 size={13} className="text-gray-500" />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {food.name}
            </h1>

            {food.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      size={13}
                      className={
                        s <= Math.round(food.rating)
                          ? "fill-red-400 text-red-400"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{food.rating.toFixed(1)}</span>
                <span
                  className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: food.inStock ? "#FDE8E8" : "#FEE2E2",
                    color:      food.inStock ? PRIMARY    : "#991B1B",
                  }}
                >
                  {food.inStock ? "✓ Available" : "Unavailable"}
                </span>
              </div>
            )}

            {/* Price — animates when meat selection changes */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 flex-wrap">
              <AnimatePresence mode="wait">
                <motion.span
                  key={effectivePrice}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="text-2xl md:text-3xl font-extrabold"
                  style={{ color: PRIMARY }}
                >
                  {formatPrice(effectivePrice)}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-gray-400">per serving</span>
              {selectedMeat && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedMeat.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="ml-auto text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
                  >
                    with {selectedMeat.name}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{food.description}</p>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-red-700">
                <Clock size={11} /> {food.prepTime}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-red-700">
                <Users size={11} /> Serves {food.serves}
              </div>
              {food.spicy && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-xs font-semibold text-white">
                  <Flame size={11} /> Spicy
                </div>
              )}
            </div>

            {/* ── Meat / Protein Selector ────────────────────────────────── */}
            {hasMeatOptions && (
              <div className="flex flex-col gap-2.5 p-4 rounded-2xl border border-red-100 bg-red-50/40">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <ChefHat size={13} style={{ color: PRIMARY }} />
                  Choose your protein
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {food.meatOptions.map((option) => {
                    const isSelected = selectedMeatId === option.id
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedMeatId(option.id)}
                        className={`relative flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all focus:outline-none ${
                          isSelected
                            ? "border-[#C0392B] bg-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-red-200"
                        }`}
                      >
                        {option.isDefault && (
                          <span className="absolute top-1.5 right-2 text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                            default
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-800 pr-10">{option.name}</span>
                        <span className="text-xs font-extrabold" style={{ color: PRIMARY }}>
                          {formatPrice(option.price)}
                        </span>
                        {isSelected && (
                          <span
                            className="absolute bottom-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: PRIMARY }}
                          >
                            <Check size={9} className="text-white" />
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Special Request Note ───────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MessageSquare size={12} style={{ color: PRIMARY }} />
                Special request
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. No pepper, extra sauce, well done meat..."
                rows={2}
                maxLength={200}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent placeholder:text-gray-300 transition-all"
              />
              {note.length > 0 && (
                <p className="text-[10px] text-gray-400 text-right">{note.length}/200</p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                Total:{" "}
                <span className="font-bold text-gray-700">{formatPrice(effectivePrice * quantity)}</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!food.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{
                  background: added || alreadyInCart ? PRIMARY_H : PRIMARY,
                  boxShadow:  `0 6px 20px ${PRIMARY}40`,
                }}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <Check size={15} /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <ShoppingCart size={15} /> Order Now
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{ border: `2px solid ${PRIMARY}`, color: PRIMARY }}
              >
                <Zap size={14} /> Buy Now
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white border border-red-50 text-center shadow-sm">
                  <Icon size={15} style={{ color: PRIMARY }} />
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">{label}</span>
                  <span className="text-[8px] text-gray-400 leading-tight hidden sm:block">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">Total Price</p>
            <p className="text-base font-extrabold leading-none" style={{ color: PRIMARY }}>
              {formatPrice(effectivePrice * quantity)}
            </p>
            {selectedMeat && (
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate">
                with {selectedMeat.name}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!food.inStock}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 flex-shrink-0"
            style={{ background: added ? PRIMARY_H : PRIMARY }}
          >
            <ShoppingCart size={15} />
            {added ? "Added ✓" : "Order"}
          </motion.button>
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </div>
  )
}