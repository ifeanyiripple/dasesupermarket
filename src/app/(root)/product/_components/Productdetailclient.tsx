"use client"
// components/ProductDetailClient.tsx

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, Thumbs, FreeMode } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/client"
import {
  ShoppingCart, Heart, Star, ChevronLeft, ChevronRight,
  Share2, Shield, Truck, RotateCcw, Minus, Plus,
  Check, ArrowLeft, Zap, Weight,
} from "lucide-react"
import Link from "next/link"
import ProductCard, { type CardProduct, formatPrice } from "@/components/ProductCard"
import { useCart } from "@/context/cart-context"
import { toast }   from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductImage = {
  id:        string
  color:     string
  colorCode: string
  image:     string
}

export type SizeOptionItem = {
  id:        string
  name:      string
  price:     number
  isDefault: boolean
}

type Review = {
  id:          string
  rating:      number
  comment:     string
  createdDate: Date | string
  user: {
    id:    string
    name:  string | null
    image: string | null
  }
}

export type DBProduct = {
  id:              string
  name:            string
  description:     string
  price:           number
  originalPrice:   number | null
  category:        string
  brand:           string | null
  inStock:         boolean
  badge:           string | null
  isFeatured:      boolean
  netContent:      string | null
  containerType:   string | null
  keyFeatures:     string[]
  ingredients:     string | null
  storageInfo:     string | null
  countryOfOrigin: string | null
  avgRating:       number
  reviewCount:     number
  sizeOptions:     SizeOptionItem[]
  images:          ProductImage[]
  reviews:         Review[]
}

// ── Trust items ───────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Truck,     label: "Free Delivery",     sub: "Orders above ₦5,000" },
  { icon: Shield,    label: "Quality Guarantee", sub: "100% fresh or refund" },
  { icon: RotateCcw, label: "Easy Returns",      sub: "Within 24 hours"      },
]

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{emoji}</span>
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

// ── All product info stacked visibly ─────────────────────────────────────────
function ProductInfoSections({ product }: { product: DBProduct }) {
  const specRows = [
    { label: "Brand",             value: product.brand            },
    { label: "Category",          value: product.category         },
    { label: "Net Content",       value: product.netContent       },
    { label: "Container Type",    value: product.containerType    },
    { label: "Country of Origin", value: product.countryOfOrigin  },
    { label: "Storage Info",      value: product.storageInfo      },
  ].filter((r) => r.value)

  return (
    <div className="flex flex-col gap-5">

      {/* Description */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <SectionHeading emoji="📝" title="Description" />
        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          Sourced with care and delivered fresh to your door by DASE Supermarket, Oyo.
          Our products are quality-checked before dispatch to ensure you receive only the best.
        </p>
      </div>

      {/* Key Features */}
      {product.keyFeatures && product.keyFeatures.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <SectionHeading emoji="✨" title="Key Features" />
          <ul className="flex flex-col gap-2.5">
            {product.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={11} className="text-[#1a5c38]" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Product Info / Specifications */}
      {specRows.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <SectionHeading emoji="📋" title="Product Info" />
          <div className="divide-y divide-gray-50">
            {specRows.map((row) => (
              <div key={row.label} className="flex items-start gap-4 py-2.5">
                <span className="w-36 flex-shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-400 pt-0.5">
                  {row.label}
                </span>
                <span className="text-sm text-gray-700 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {product.ingredients && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <SectionHeading emoji="🧪" title="Ingredients" />
          <p className="text-sm text-gray-600 leading-relaxed">{product.ingredients}</p>
        </div>
      )}

    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = { product: DBProduct }

export default function ProductDetailClient({ product }: Props) {
  const { addToCart, isInCart } = useCart()

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [thumbsSwiper,   setThumbsSwiper]   = useState<SwiperType | null>(null)
  const [mainSwiper,     setMainSwiper]     = useState<SwiperType | null>(null)
  const [selectedColor,  setSelectedColor]  = useState<ProductImage>(product.images[0])
  const [quantity,       setQuantity]       = useState(1)
  const [wished,         setWished]         = useState(false)
  const [added,          setAdded]          = useState(false)
  const relSwiperRef                        = useRef<SwiperType | null>(null)

  const hasSizeOptions = product.sizeOptions && product.sizeOptions.length > 0
  const defaultSize    = hasSizeOptions
    ? (product.sizeOptions.find((s) => s.isDefault) ?? product.sizeOptions[0])
    : null
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(defaultSize?.id ?? null)
  const selectedSize = hasSizeOptions
    ? (product.sizeOptions.find((s) => s.id === selectedSizeId) ?? defaultSize)
    : null

  const effectivePrice = selectedSize ? selectedSize.price : product.price
  const alreadyInCart  = isInCart(product.id)

  const { data: relatedData } = useQuery({
    queryKey: ["products", "related", product.id, product.category],
    queryFn:  async () => {
      const res     = await client.products.getRelatedProducts.$get({
        productId: product.id,
        category:  product.category,
        limit:     10,
      })
      const rawText = await res.text()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const superjson = require("superjson")
      const parsed  = superjson.parse(rawText) as { success: boolean; products: CardProduct[] }
      return parsed.products ?? []
    },
    staleTime: 1000 * 60 * 5,
  })

  const related = relatedData ?? []
  const reviews = product.reviews ?? []

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const handleColorSelect = useCallback((img: ProductImage, idx: number) => {
    setSelectedColor(img)
    setActiveImageIdx(idx)
    mainSwiper?.slideTo(idx)
  }, [mainSwiper])

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const idx = swiper.realIndex
    setActiveImageIdx(idx)
    setSelectedColor(product.images[idx])
  }, [product.images])

  const handleAddToCart = () => {
    const sizeLabel = selectedSize ? ` (${selectedSize.name})` : ""

    addToCart({
      id:             product.id,
      name:           `${product.name}${sizeLabel}`,
      description:    product.description,
      itemType:       "product",
      category:       product.category,
      brand:          product.brand ?? "",
      price:          effectivePrice,
      imageColor:     selectedColor.color,
      imageColorCode: selectedColor.colorCode,
      imageUrl:       selectedColor.image,
    })

    toast.success(`${product.name}${sizeLabel} added to cart`, {
      description: `${product.category} · ${formatPrice(effectivePrice)}`,
      duration: 2000,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f8fdfb]">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-[#1a5c38] transition-colors flex items-center gap-1 whitespace-nowrap">
            <ArrowLeft size={12} /> Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1a5c38] transition-colors whitespace-nowrap">Shop</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.toLowerCase()}`} className="hover:text-[#1a5c38] transition-colors whitespace-nowrap">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[140px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">

          {/* LEFT: Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-3"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm h-[260px] sm:h-[340px] md:h-auto md:aspect-square">
              <Swiper
                modules={[Autoplay, Pagination, Thumbs]}
                slidesPerView={1}
                loop={product.images.length > 1}
                autoplay={{ delay: 3500, disableOnInteraction: true }}
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                onSwiper={setMainSwiper}
                onSlideChange={handleSlideChange}
                className="main-product-swiper h-full w-full"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={img.id} className="h-full">
                    <div className="relative w-full h-full">
                      <Image
                        src={img.image}
                        alt={`${product.name} — ${img.color}`}
                        fill
                        priority={idx === 0}
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <div className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: img.colorCode }} />
                        <span className="text-white text-[10px] font-semibold">{img.color}</span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  {product.badge === "sale" && discount
                    ? <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">{discount}% OFF</span>
                    : product.badge === "organic"
                    ? <span className="bg-[#1a5c38] text-white text-xs font-bold px-2.5 py-1 rounded-full">🌿 Organic</span>
                    : product.badge === "new"
                    ? <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">✨ New</span>
                    : <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">🔥 Hot</span>
                  }
                </div>
              )}

              <button
                onClick={() => setWished((v) => !v)}
                className="absolute top-3 right-3 z-10 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Heart size={15} className={wished ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>
            </div>

            {product.images.length > 1 && (
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={8}
                slidesPerView={Math.min(product.images.length, 5)}
                freeMode={true}
                watchSlidesProgress={true}
                className="thumbs-swiper w-full"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={img.id}>
                    <button
                      onClick={() => handleColorSelect(img, idx)}
                      className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImageIdx === idx ? "border-[#1a5c38] shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <Image src={img.image} alt={img.color} fill className="object-cover" sizes="80px" />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          {/* RIGHT: Product info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-[#2d7a4f]">{product.category}</span>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Share2 size={13} className="text-gray-500" />
              </button>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className={s <= Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                {product.inStock ? "✓ In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-gray-100 flex-wrap">
              <AnimatePresence mode="wait">
                <motion.span
                  key={effectivePrice}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="text-2xl md:text-3xl font-extrabold text-[#1a5c38]"
                >
                  {formatPrice(effectivePrice)}
                </motion.span>
              </AnimatePresence>
              {product.originalPrice && !hasSizeOptions && (
                <>
                  <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm font-bold text-red-500">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
              {selectedSize && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedSize.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="ml-auto text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
                  >
                    {selectedSize.name}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>

            {/* Colour variant selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Variant:</span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: selectedColor.colorCode }} />
                  {selectedColor.color}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {product.images.map((img, idx) => (
                  <motion.button
                    key={img.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleColorSelect(img, idx)}
                    title={img.color}
                    className={`relative w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImageIdx === idx ? "border-[#1a5c38] shadow-lg ring-2 ring-[#1a5c38]/20" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <Image src={img.image} alt={img.color} fill className="object-cover" sizes="40px" />
                    {activeImageIdx === idx && (
                      <div className="absolute inset-0 bg-[#1a5c38]/10 flex items-center justify-center">
                        <Check size={13} className="text-[#1a5c38] drop-shadow" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size / Weight Selector */}
            {hasSizeOptions && (
              <div className="flex flex-col gap-2.5 p-4 rounded-2xl border border-green-100 bg-green-50/40">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Weight size={13} className="text-[#1a5c38]" />
                  Choose size / weight
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizeOptions.map((option) => {
                    const isSelected = selectedSizeId === option.id
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedSizeId(option.id)}
                        className={`relative flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all focus:outline-none ${
                          isSelected
                            ? "border-[#1a5c38] bg-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-green-200"
                        }`}
                      >
                        {option.isDefault && (
                          <span className="absolute top-1.5 right-2 text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                            default
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-800 pr-10">{option.name}</span>
                        <span className="text-xs font-extrabold text-[#1a5c38]">{formatPrice(option.price)}</span>
                        {isSelected && (
                          <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-[#1a5c38] flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                Total: <span className="font-bold text-gray-700">{formatPrice(effectivePrice * quantity)}</span>
              </span>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${added || alreadyInCart ? "bg-[#2d7a4f] text-white" : "bg-[#1a5c38] hover:bg-[#2d7a4f] text-white shadow-lg shadow-[#1a5c38]/20"}`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <Check size={15} /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <ShoppingCart size={15} /> Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#1a5c38] text-[#1a5c38] text-sm font-bold hover:bg-[#f0faf4] transition-all"
              >
                <Zap size={14} /> Buy Now
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white border border-gray-100 text-center">
                  <Icon size={15} className="text-[#2d7a4f]" />
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">{label}</span>
                  <span className="text-[8px] md:text-[9px] text-gray-400 leading-tight hidden sm:block">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Full-width info sections below the hero grid ─────────────────── */}
        <div className="mt-8 md:mt-12">
          <ProductInfoSections product={product} />
        </div>

        {/* ── Reviews ───────────────────────────────────────────────────────── */}
         {reviews.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 md:mt-14"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#2d7a4f] mb-1">What Customers Say</p>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Customer Reviews</h2>
            </div>
            {product.avgRating > 0 && (
              <div className="hidden md:flex flex-col items-center gap-1 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
                <span className="text-3xl font-extrabold text-[#1a5c38]">{product.avgRating.toFixed(1)}</span>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">{product.reviewCount} reviews</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, i) => {
                const initials = (review.user.name ?? "A")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                const dateStr = new Date(review.createdDate).toLocaleDateString("en-NG", {
                  month: "short", day: "numeric", year: "numeric",
                })

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {review.user.image ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={review.user.image} alt={review.user.name ?? "User"} width={36} height={36} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1a5c38] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800">{review.user.name ?? "Anonymous"}</p>
                          <p className="text-[10px] text-gray-400">{dateStr}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{review.comment}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section> )}

        {/* ── Related Products ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 md:mt-14"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#2d7a4f] mb-1">
                {related.length > 0 ? `More from ${product.category}` : "You Might Also Like"}
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Related Products</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => relSwiperRef.current?.slidePrev()} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#2d7a4f] hover:text-[#2d7a4f] transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => relSwiperRef.current?.slideNext()} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#2d7a4f] hover:text-[#2d7a4f] transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {related.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No related products found.</div>
          ) : (
            <Swiper
              modules={[Autoplay, Navigation]}
              onSwiper={(s) => { relSwiperRef.current = s }}
              slidesPerView={2}
              spaceBetween={12}
              loop={related.length >= 4}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640:  { slidesPerView: 3, spaceBetween: 14 },
                1024: { slidesPerView: 4, spaceBetween: 16 },
                1280: { slidesPerView: 5, spaceBetween: 16 },
              }}
            >
              {related.map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard product={p} delay={0} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">Total Price</p>
            <p className="text-base font-extrabold text-[#1a5c38] leading-none">
              {formatPrice(effectivePrice * quantity)}
            </p>
            {selectedSize && (
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate">
                {selectedSize.name}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-50 flex-shrink-0 ${added ? "bg-[#2d7a4f] text-white" : "bg-[#1a5c38] text-white"}`}
          >
            <ShoppingCart size={15} />
            {added ? "Added ✓" : "Add to Cart"}
          </motion.button>
        </div>
      </div>

      <div className="h-20 md:hidden" />

      <style jsx global>{`
        .main-product-swiper .swiper-pagination { bottom: 6px; }
        .main-product-swiper .swiper-pagination-bullet { background: rgba(255,255,255,0.6); width: 6px; height: 6px; opacity: 1; }
        .main-product-swiper .swiper-pagination-bullet-active { background: white; width: 18px; border-radius: 3px; }
        .thumbs-swiper .swiper-slide-thumb-active > button { border-color: #1a5c38; }
      `}</style>
    </div>
  )
}