"use client"
// app/search/_components/SearchResults.tsx

import { useState }       from "react"
import { useRouter }      from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Package, UtensilsCrossed, BedDouble, X } from "lucide-react"
import ProductCard, {
  type CardProduct,
  foodToCardProduct,
  roomToCardProduct,
} from "@/components/ProductCard"

// ── Prop types mirror the DB select shapes ────────────────────────────────────

type RawProduct = {
  id:            string
  name:          string
  description:   string
  price:         number
  originalPrice: number | null
  category:      string
  brand:         string | null
  inStock:       boolean
  badge:         string | null
  isFeatured:    boolean
  images: { id: string; color: string; colorCode: string; image: string }[]
}

type RawFood = {
  id:          string
  name:        string
  description: string
  price:       number
  category:    string
  inStock:     boolean
  badge:       string | null
  image:       string
  spicy:       boolean
  rating:      number
  prepTime:    string
  serves:      number
  isFeatured:  boolean
}

type RawRoom = {
  id:          string
  name:        string
  description: string
  price:       number
  roomNumber:  string | null
  capacity:    number
  status:      "AVAILABLE" | "OCCUPIED"
  bed:         string | null
  amenities:   any
  images:      string[]
  featured:    boolean
}

type Props = {
  query:      string
  activeType: string
  products:   RawProduct[]
  foods:      RawFood[]
  rooms:      RawRoom[]
}

// ── Convert raw DB rows to CardProduct ────────────────────────────────────────
function rawProductToCard(p: RawProduct): CardProduct {
  return {
    id:            p.id,
    name:          p.name,
    description:   p.description,
    price:         p.price,
    originalPrice: p.originalPrice,
    category:      p.category,
    brand:         p.brand,
    inStock:       p.inStock,
    badge:         p.badge,
    itemType:      "product",
    images:        p.images.length > 0
      ? p.images
      : [{ id: p.id, color: "Default", colorCode: "#1a5c38", image: "" }],
  }
}

// ── Type filter tabs ──────────────────────────────────────────────────────────
const TYPE_TABS = [
  { id: "all",     label: "All",      icon: Search          },
  { id: "product", label: "Products", icon: Package         },
  { id: "food",    label: "Food",     icon: UtensilsCrossed },
  { id: "room",    label: "Rooms",    icon: BedDouble       },
] as const

type FilterType = (typeof TYPE_TABS)[number]["id"]

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType
  label: string
  count: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <h2 className="text-sm font-extrabold text-gray-800">{label}</h2>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
        style={{ background: `${color}15`, color }}
      >
        {count}
      </span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Search size={24} className="text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-500">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs mt-1">
          Try a different spelling or browse the store instead.
        </p>
      </div>
    </div>
  )
}

// ── Empty search prompt ───────────────────────────────────────────────────────
function SearchPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-[#f0faf4] flex items-center justify-center">
        <Search size={24} className="text-[#1a5c38]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600">
          Search for anything on DASE
        </p>
        <p className="text-xs mt-1">Products, foods, rooms, brands, categories…</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SearchResults({
  query,
  activeType,
  products,
  foods,
  rooms,
}: Props) {
  const router = useRouter()

  // Local filter state — defaults to the URL param
  const [filterType, setFilterType] = useState<FilterType>(
    (activeType as FilterType) ?? "all"
  )

  // Convert to CardProduct
  const cardProducts = products.map(rawProductToCard)
  const cardFoods    = foods.map(foodToCardProduct)
  const cardRooms    = rooms.map(roomToCardProduct)

  // What to show based on filter
  const showProducts = filterType === "all" || filterType === "product"
  const showFoods    = filterType === "all" || filterType === "food"
  const showRooms    = filterType === "all" || filterType === "room"

  const counts: Record<FilterType, number> = {
    all:     products.length + foods.length + rooms.length,
    product: products.length,
    food:    foods.length,
    room:    rooms.length,
  }

  if (!query) return <SearchPrompt />

  return (
    <div>
      {/* ── Type filter tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        {TYPE_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = filterType === id
          const count    = counts[id]
          return (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                flex-shrink-0 transition-all border
                ${isActive
                  ? "bg-[#1a5c38] text-white border-[#1a5c38] shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#1a5c38]/30 hover:text-[#1a5c38]"
                }
              `}
            >
              <Icon size={12} />
              {label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Zero results ─────────────────────────────────────────────────── */}
      {counts[filterType] === 0 && <EmptyState query={query} />}

      {/* ── Results by section ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filterType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-10"
        >
          {/* Products */}
          {showProducts && cardProducts.length > 0 && (
            <section>
              <SectionHeading
                icon={Package}
                label="Supermarket Products"
                count={cardProducts.length}
                color="#1a5c38"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                {cardProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}

          {/* Foods */}
          {showFoods && cardFoods.length > 0 && (
            <section>
              <SectionHeading
                icon={UtensilsCrossed}
                label="Restaurant Menu"
                count={cardFoods.length}
                color="#C0392B"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                {cardFoods.map((f, i) => (
                  <ProductCard key={f.id} product={f} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}

          {/* Rooms */}
          {showRooms && cardRooms.length > 0 && (
            <section>
              <SectionHeading
                icon={BedDouble}
                label="Hotel Rooms"
                count={cardRooms.length}
                color="#BA7517"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3">
                {cardRooms.map((r, i) => (
                  <ProductCard key={r.id} product={r} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}