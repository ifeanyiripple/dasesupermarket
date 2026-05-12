"use client"
// components/sections/HomeTabs.tsx
import { useTheme } from "@/providers/theme-provider"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import ProductCard, {
  type CardProduct,
  foodToCardProduct,
  roomToCardProduct,
} from "@/components/ProductCard"
import HorizontalFoodCard from "@/components/Horizontalfoodcard"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import ShuffledProductGrid from "../ShuffledProductGrid"

// ── Types ─────────────────────────────────────────────────────────────────────

export type DBFoodItem = {
  id: string; name: string; description: string; price: number
  category: string; inStock: boolean; badge: string | null
  image: string; spicy: boolean; rating: number
  prepTime: string; serves: number; isFeatured: boolean
}

export type DBRoomItem = {
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

// ── Product type for the supermarket grid ─────────────────────────────────────
export type DBProductItem = {
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
  images: {
    id:        string
    color:     string
    colorCode: string
    image:     string
  }[]
}

// ── Helper: DB product → CardProduct (same pattern as foodToCardProduct) ──────
function productToCardProduct(p: DBProductItem): CardProduct {
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

// ── Tabs config ───────────────────────────────────────────────────────────────

const TABS = [
  {
    id:         "supermarket",
    label:      "Supermarket",
    icon:       "/icons/supermarket.svg",
    bg:         "#EAF3DE",
    border:     "#C0DD97",
    activeBg:   "#1a5c38",
    activeText: "white",
    textColor:  "#27500A",
  },
  {
    id:         "restaurant",
    label:      "Restaurant",
    icon:       "/icons/food.svg",
    bg:         "#FDF0EF",
    border:     "#F5B7B1",
    activeBg:   "#C0392B",
    activeText: "white",
    textColor:  "#922B21",
  },
  {
    id:         "hospitality",
    label:      "Hospitality",
    icon:       "/icons/rooms.svg",
    bg:         "#FDF3E3",
    border:     "#FAC775",
    activeBg:   "#BA7517",
    activeText: "white",
    textColor:  "#633806",
  },
  {
    id:         "farm",
    label:      "Farm Products",
    icon:       "/icons/farm.jpeg",
    bg:         "#E1F5EE",
    border:     "#9FE1CB",
    activeBg:   "#0F6E56",
    activeText: "white",
    textColor:  "#085041",
  },
] as const

type TabId = (typeof TABS)[number]["id"]

type Props = {
  foods:              DBFoodItem[]
  products?:          DBProductItem[]    // ← new
  supermarketContent: React.ReactNode
  rooms?:             DBRoomItem[]
}

// ── Shared category filter — used by both food and products ───────────────────
function CategoryFilter({
  categories,
  active,
  onChange,
  accentColor,
  layoutId,
}: {
  categories: string[]
  active: string
  onChange: (c: string) => void
  accentColor: string
  layoutId: string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-0.5">
      {["All", ...categories].map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              relative flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 whitespace-nowrap bg-transparent
              ${isActive
                ? "border-2"
                : "text-gray-400 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-600"
              }
            `}
            style={isActive ? { color: accentColor, borderColor: accentColor } : {}}
          >
            {cat}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 0 3px ${accentColor}18` }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Coming soon ───────────────────────────────────────────────────────────────
function ComingSoon({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <span className="text-5xl">{emoji}</span>
      <p className="text-sm font-semibold">{label} is coming soon</p>
      <p className="text-xs">We're stocking up — check back shortly!</p>
    </div>
  )
}

// ── Local Favourites strip ────────────────────────────────────────────────────
const LOCAL_FAVOURITES_CATEGORY = "Local Favourites"

function LocalFavouritesStrip({ items }: { items: CardProduct[] }) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 leading-none">🇳🇬 Local Favourites</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Most loved dishes</p>
        </div>
        <span className="ml-auto text-[10px] text-gray-400">{items.length} dishes</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((food, i) => (
          <HorizontalFoodCard key={food.id} product={food} delay={i * 0.05} />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">All Menu</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeTabs({ foods, products, supermarketContent, rooms }: Props) {
  const { activeTab, setActiveTab } = useTheme()

  // Food category state
  const [activeFoodCat, setActiveFoodCat] = useState("All")

  // Product category state — same pattern
  const [activeProductCat, setActiveProductCat] = useState("All")

  // Derive category lists
  const foodCategories    = [...new Set(foods.map((f) => f.category))]
  const productCategories = [...new Set((products ?? []).map((p) => p.category))]

  // Local favourites strip
  const localFavourites: CardProduct[] = foods
    .filter((f) => f.category === LOCAL_FAVOURITES_CATEGORY)
    .map(foodToCardProduct)

  // Filtered food grid
  const filteredFoods: CardProduct[] = foods
    .filter((f) => activeFoodCat === "All" || f.category === activeFoodCat)
    .map(foodToCardProduct)

  // Filtered product grid
  const filteredProducts: CardProduct[] = (products ?? [])
    .filter((p) => activeProductCat === "All" || p.category === activeProductCat)
    .map(productToCardProduct)

  const mappedRooms: CardProduct[] = rooms?.map(roomToCardProduct) || []

  return (
    <section className="w-full">

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="px-2 py-3 md:px-6">
        <div className="grid grid-cols-4 gap-1 md:gap-4">
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl md:rounded-2xl px-0.5 md:px-3 py-2 md:py-4 cursor-pointer min-h-[80px] md:min-h-[120px] overflow-hidden"
                style={{
                  background:  tab.bg,
                  border:      `${isActive ? "2px" : "1px"} solid ${isActive ? tab.activeBg : tab.border}`,
                  boxShadow:   isActive ? `0 4px 16px ${tab.activeBg}25` : "none",
                }}
              >
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={44}
                  height={44}
                  className="w-10 h-10 md:w-11 md:h-11 object-contain"
                />
                <span
                  className="text-[10px] md:text-xs font-medium text-center leading-tight tracking-tight"
                  style={{ color: isActive ? tab.activeBg : tab.textColor }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-active-bar"
                    className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full"
                    style={{ background: tab.activeBg }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >

          {/* ══ SUPERMARKET ══════════════════════════════════════════════════ */}
          {activeTab === "supermarket" && (
            <div>
              {/* ── Product category grid comes FIRST ────────────────────── */}
              {products && products.length > 0 && (
                <div className="px-2 md:px-6 pb-6">

                  {/* Section header */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-[15px] font-bold tracking-widest uppercase text-[#1a5c38] mb-0.5">
                        DASE Supermarket
                      </p>
                      {/* <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
                        Browse the Store 🛒
                      </h2> */}
                    </div>
                    <span className="text-[10px] text-gray-400">{filteredProducts.length} items</span>
                  </div>

                  {/* Category chips */}
                  {productCategories.length > 0 && (
                    <div className="mb-4">
                      <CategoryFilter
                        categories={productCategories}
                        active={activeProductCat}
                        onChange={setActiveProductCat}
                        accentColor="#1a5c38"
                        layoutId="product-cat-indicator"
                      />
                    </div>
                  )}

                  {/* Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                      {activeProductCat !== "All" && ` in ${activeProductCat}`}
                    </span>
                    {activeProductCat !== "All" && (
                      <button
                        onClick={() => setActiveProductCat("All")}
                        className="text-xs text-[#1a5c38] font-semibold hover:underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>

                  {/* Grid */}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No products in this category yet.
                    </div>
                  ) : (
                    <>
                    <div >
                      {filteredProducts.slice(0, 30).map((product, i) => (
                        // <ShuffledProductGrid products={products} />
                         <ProductCard key={product.id} product={product} delay={i * 0.04} />
                      ))}
                    </div>
                    {filteredProducts.length > 30 && (
      <div className="flex justify-center mt-6">
        <Link href="/shop">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] text-sm font-bold hover:bg-[var(--theme-primary)] hover:text-white transition-all">
            View all products <ArrowRight size={15} />
          </button>
        </Link>
      </div>
    )}
    </>
                  )}
                </div>
              )}

              {/* FeaturedProducts, WhyUs, PopularDeals — rendered below the grid */}
              {supermarketContent}
            </div>
          )}

          {/* ══ RESTAURANT ═══════════════════════════════════════════════════ */}
          {activeTab === "restaurant" && (
            <div className="px-2 md:px-6 pb-6">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[15px] font-bold tracking-widest uppercase text-[#C0392B] mb-0.5">
                    Oyo Royal Kitchen
                  </p>
                  <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
                    What would you like to eat? 🍽️
                  </h2>
                </div>
                <span className="text-[10px] text-gray-400">{filteredFoods.length} items</span>
              </div>

              <LocalFavouritesStrip items={localFavourites} />

              {foodCategories.length > 0 && (
                <div className="mb-4">
                  <CategoryFilter
                    categories={foodCategories}
                    active={activeFoodCat}
                    onChange={setActiveFoodCat}
                    accentColor="#C0392B"
                    layoutId="food-cat-indicator"
                  />
                </div>
              )}

              {filteredFoods.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No items in this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                  {filteredFoods.map((food, i) => (
                    <ProductCard key={food.id} product={food} delay={i * 0.04} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ HOSPITALITY ══════════════════════════════════════════════════ */}
          {activeTab === "hospitality" && (
            <div className="px-2 md:px-6 pb-6">
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-[15px] font-bold tracking-widest uppercase text-[#BA7517] mb-0.5">
                    DaseLuxury Lodge
                  </p>
                  <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
                    Comfort & Luxury Awaits 🏨
                  </h2>
                  <a
                    href="https://daseluxuryhotel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-[#BA7517] hover:text-[#633806] underline underline-offset-2 transition-colors mt-0.5"
                  >
                    <ExternalLink size={11} />
                    daseluxuryhotel.com
                  </a>
                </div>
                <span className="text-[10px] text-gray-400">{mappedRooms.length} rooms</span>
              </div>

              <div className="my-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-amber-700 mr-1">All rooms include:</span>
                {["WiFi", "24/7 Power Supply", "TV", "Security", "AC", "Cushion"].map((a) => (
                  <span key={a} className="text-[9px] bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {a}
                  </span>
                ))}
              </div>

              {mappedRooms.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No rooms available at this time.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {mappedRooms.map((room, i) => (
                    <ProductCard key={room.id} product={room} delay={i * 0.04} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ FARM ═════════════════════════════════════════════════════════ */}
          {activeTab === "farm" && (
            <div className="px-2 md:px-6 pb-6">
              <ComingSoon label="Farm Products" emoji="🌾" />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </section>
  )
}


