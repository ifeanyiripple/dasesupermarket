"use client"
// app/shop/page.tsx  (or components/ShopPageClient.tsx if you prefer)

import { useState, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { client } from "@/lib/client"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard, { type CardProduct } from "@/components/ProductCard"
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  ArrowUpDown, Package, LayoutGrid, LayoutList, Filter,
} from "lucide-react"
import ShuffledProductGrid from "@/components/ShuffledProductGrid"
import DaseAboutSection from "@/components/daseaboutsection"
import { useTheme } from "@/providers/theme-provider"

// ── Types ─────────────────────────────────────────────────────────────────────
type SortBy    = "createdAt" | "price" | "name"
type SortOrder = "asc" | "desc"

type Filters = {
  search:    string
  category:  string
  badge:     string
  inStock:   boolean | undefined
  minPrice:  number | undefined
  maxPrice:  number | undefined
  sortBy:    SortBy
  sortOrder: SortOrder
  page:      number
}

const LIMIT = 20

// ── Supermarket categories ───────────────────────────────────────────────────
// These map to the `category` field on Product records.
// Add more here later as new categories are introduced — the shop page
// will automatically pick them up via the `category` search param.
const SUPERMARKET_CATEGORIES = [
  { id: "Grocery",       label: "Grocery",       icon: "🛒" },
  { id: "Drinks",        label: "Drinks",        icon: "🍷" },
  { id: "Beverages",     label: "Beverages",     icon: "🥤" },
  { id: "Dairy",         label: "Dairy & Eggs",  icon: "🥚" },
  { id: "Household",     label: "Household",     icon: "🧴" },
  { id: "Swallow Foods", label: "Swallow Foods", icon: "🍚" },
  { id: "Electronics",   label: "Electronics",   icon: "🔌" },
]

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

// ── Mini shop hero ────────────────────────────────────────────────────────────
function ShopHero({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  const { theme } = useTheme()
  const [local, setLocal] = useState(search)

  useEffect(() => {
    setLocal(search)
  }, [search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(local.trim())
  }

  // ── Input style helpers ───────────────────────────────────────────────────
  const buttonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = theme.primaryHover
  }
  const buttonLeaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = theme.primary
  }

  return (
    <div className="py-12 md:py-16 px-6" style={{ 
      background: `linear-gradient(to bottom right, ${theme.primaryHover}, ${theme.primary}, ${theme.primaryHover})` 
    }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
          style={{ color: `${theme.primaryLight}` }}
        >
          🛒 DASE {theme.id === "hospitality" ? "Hotel" : theme.id === "restaurant" ? "Restaurant" : "Supermarket"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl font-extrabold text-white mb-3"
        >
          Browse All {theme.id === "hospitality" ? "Rooms" : theme.id === "restaurant" ? "Foods" : "Products"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-sm mb-8"
        >
          {theme.id === "hospitality" 
            ? "Comfortable rooms and premium hospitality — book your stay in Oyo" 
            : theme.id === "restaurant"
            ? "Fresh meals and local delicacies — order online for delivery"
            : "Fresh groceries and daily essentials — delivered to your door in Oyo"}
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-xl max-w-xl mx-auto"
        >
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={local}
            onChange={e => setLocal(e.target.value)}
            placeholder={
              theme.id === "hospitality" 
                ? "Search rooms, amenities..."
                : theme.id === "restaurant"
                ? "Search meals, categories..."
                : "Search products, brands, categories..."
            }
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {local && (
            <button type="button" onClick={() => { setLocal(""); onSearch("") }}>
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <button 
            type="submit" 
            className="flex-shrink-0 px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-colors"
            style={{ backgroundColor: theme.primary }}
            onMouseEnter={buttonHoverStyle}
            onMouseLeave={buttonLeaveStyle}
          >
            Search
          </button>
        </motion.form>
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  const { theme } = useTheme()
  
  if (pages <= 1) return null
  const items: (number | "...")[] = []
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) items.push(i)
  } else {
    items.push(1)
    if (page > 3) items.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) items.push(i)
    if (page < pages - 2) items.push("...")
    items.push(pages)
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  const buttonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.borderColor = theme.primary
      e.currentTarget.style.color = theme.primaryText
    }
  }
  const buttonLeaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.borderColor = "#e5e7eb"
      e.currentTarget.style.color = "#6b7280"
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        onMouseEnter={buttonHoverStyle}
        onMouseLeave={buttonLeaveStyle}
      >
        <ChevronLeft size={16} />
      </button>
      {items.map((item, i) =>
        item === "..." ? (
          <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onChange(item as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all`}
            style={{
              backgroundColor: page === item ? theme.primary : "transparent",
              color: page === item ? "white" : "#6b7280",
              border: page === item ? "none" : "1px solid #e5e7eb"
            }}
            onMouseEnter={(e) => {
              if (page !== item) {
                e.currentTarget.style.borderColor = theme.primary
                e.currentTarget.style.color = theme.primaryText
              }
            }}
            onMouseLeave={(e) => {
              if (page !== item) {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.color = "#6b7280"
              }
            }}
          >
            {item}
          </button>
        )
      )}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        onMouseEnter={buttonHoverStyle}
        onMouseLeave={buttonLeaveStyle}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ── Filter sidebar / drawer ───────────────────────────────────────────────────
function FilterPanel({
  filters, onChange, onReset, totalResults,
}: {
  filters: Filters
  onChange: (partial: Partial<Filters>) => void
  onReset: () => void
  totalResults: number
}) {
  const { theme } = useTheme()
  const hasActiveFilters = filters.category || filters.badge || filters.inStock !== undefined || filters.minPrice !== undefined || filters.maxPrice !== undefined

  // ── Style helpers ─────────────────────────────────────────────────────────
  const categoryButtonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? theme.primary : "transparent",
    color: isActive ? "white" : "#6b7280",
  })

  const categoryHoverStyle = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = theme.primaryLight
    }
  }
  const categoryLeaveStyle = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = "transparent"
    }
  }

  const badgeButtonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? theme.primary : "#f9fafb",
    color: isActive ? "white" : "#6b7280",
    borderColor: isActive ? theme.primary : "#e5e7eb",
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Active filter count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Filters</p>
        {hasActiveFilters && (
          <button 
            onClick={onReset} 
            className="text-xs font-semibold hover:underline"
            style={{ color: theme.primary }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">{totalResults} product{totalResults !== 1 ? "s" : ""} found</p>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-600">Category</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onChange({ category: "", page: 1 })}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all`}
            style={categoryButtonStyle(!filters.category)}
            onMouseEnter={(e) => categoryHoverStyle(e, !filters.category)}
            onMouseLeave={(e) => categoryLeaveStyle(e, !filters.category)}
          >
            🛒 All Categories
          </button>
          {SUPERMARKET_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onChange({ category: cat.id, page: 1 })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all`}
              style={categoryButtonStyle(filters.category === cat.id)}
              onMouseEnter={(e) => categoryHoverStyle(e, filters.category === cat.id)}
              onMouseLeave={(e) => categoryLeaveStyle(e, filters.category === cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-600">Badge</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "",        label: "All" },
            { id: "new",     label: "✨ New" },
            { id: "sale",    label: "🏷️ Sale" },
            { id: "hot",     label: "🔥 Hot" },
            { id: "organic", label: "🌿 Organic" },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => onChange({ badge: b.id, page: 1 })}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center transition-all border`}
              style={badgeButtonStyle(filters.badge === b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-600">Availability</p>
        <div className="flex flex-col gap-1">
          {[
            { label: "All", value: undefined },
            { label: "✓ In Stock", value: true },
            { label: "Out of Stock", value: false },
          ].map(s => (
            <button
              key={String(s.value)}
              onClick={() => onChange({ inStock: s.value, page: 1 })}
              className={`px-3 py-2 rounded-xl text-sm text-left transition-all`}
              style={categoryButtonStyle(filters.inStock === s.value)}
              onMouseEnter={(e) => categoryHoverStyle(e, filters.inStock === s.value)}
              onMouseLeave={(e) => categoryLeaveStyle(e, filters.inStock === s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-600">Price Range (₦)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={e => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none transition-all"
            onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb" }}
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={e => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none transition-all"
            onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb" }}
          />
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Under ₦1k",    min: undefined, max: 1000    },
            { label: "₦1k–5k",      min: 1000,      max: 5000    },
            { label: "₦5k–10k",     min: 5000,      max: 10000   },
            { label: "₦10k+",       min: 10000,     max: undefined },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => onChange({ minPrice: p.min, maxPrice: p.max, page: 1 })}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 border border-gray-200 text-gray-500 transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.primary
                e.currentTarget.style.color = theme.primaryText
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.color = "#6b7280"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_FILTERS: Filters = {
  search:    "",
  category:  "",
  badge:     "",
  inStock:   undefined,
  minPrice:  undefined,
  maxPrice:  undefined,
  sortBy:    "createdAt",
  sortOrder: "desc",
  page:      1,
}

export default function ShopPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const router       = useRouter()

  // Initialise from URL query params — category, badge, search and q are
  // all read here so links from the homepage / About section
  // (e.g. /shop?category=Drinks) just work without any extra wiring.
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") ?? "",
    badge:    searchParams.get("badge")    ?? "",
    search:   searchParams.get("search") ?? searchParams.get("q") ?? "",
  })

  // Keep filters in sync if the URL search params change after the page
  // has already mounted (e.g. clicking a different category link while
  // already on /shop).
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get("category") ?? "",
      badge:    searchParams.get("badge")    ?? "",
      search:   searchParams.get("search") ?? searchParams.get("q") ?? "",
      page:     1,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const updateFilters = useCallback((partial: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...partial }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // ── Fetch products ──────────────────────────────────────────────────────────
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "shop", filters],
    queryFn:  async () => {
      const res = await client.products.getProducts.$get({
        page:      filters.page,
        limit:     LIMIT,
        sortBy:    filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.search   ? { search:   filters.search   } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.badge    ? { badge:    filters.badge    } : {}),
        ...(filters.inStock  !== undefined ? { inStock: filters.inStock } : {}),
        ...(filters.minPrice !== undefined ? { minPrice: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { maxPrice: filters.maxPrice } : {}),
      })
      const rawText = await res.text()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const superjson = require("superjson")
      const parsed = superjson.parse(rawText) as {
        success: boolean
        products: CardProduct[]
        pagination: { page: number; limit: number; total: number; pages: number }
      }
      return parsed
    },
    staleTime:    1000 * 60 * 2,
    placeholderData: prev => prev,   // keep old data visible while loading next page
  })

  const products   = data?.products   ?? []
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0, limit: LIMIT }

  const hasActiveFilters = !!(filters.category || filters.badge || filters.inStock !== undefined || filters.minPrice !== undefined || filters.maxPrice !== undefined)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <ShopHero search={filters.search} onSearch={s => updateFilters({ search: s, page: 1 })} />

        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
          <div className="flex gap-8">

            {/* ── Sidebar filters (desktop) ─────────────────────────────── */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <FilterPanel
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                  totalResults={pagination.total}
                />
              </div>
            </aside>

            {/* ── Main content ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 transition-all"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.primary }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb" }}
                  >
                    <Filter size={14} />
                    Filters
                    {hasActiveFilters && (
                      <span 
                        className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: theme.primary }}
                      >
                        !
                      </span>
                    )}
                  </button>

                  {/* Active filter chips */}
                  {filters.category && (
                    <span 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={{ 
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryText,
                        borderColor: `${theme.primary}33`
                      }}
                    >
                      {filters.category}
                      <button onClick={() => updateFilters({ category: "", page: 1 })}><X size={10} /></button>
                    </span>
                  )}
                  {filters.badge && (
                    <span 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={{ 
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryText,
                        borderColor: `${theme.primary}33`
                      }}
                    >
                      {filters.badge}
                      <button onClick={() => updateFilters({ badge: "", page: 1 })}><X size={10} /></button>
                    </span>
                  )}
                  {filters.search && (
                    <span 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={{ 
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryText,
                        borderColor: `${theme.primary}33`
                      }}
                    >
                      "{filters.search}"
                      <button onClick={() => updateFilters({ search: "", page: 1 })}><X size={10} /></button>
                    </span>
                  )}
                  {hasActiveFilters && (
                    <button 
                      onClick={resetFilters} 
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={13} className="text-gray-400" />
                  <select
                    value={`${filters.sortBy}_${filters.sortOrder}`}
                    onChange={e => {
                      const [sortBy, sortOrder] = e.target.value.split("_") as [SortBy, SortOrder]
                      updateFilters({ sortBy, sortOrder, page: 1 })
                    }}
                    className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 cursor-pointer transition-all focus:outline-none"
                    onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb" }}
                  >
                    <option value="createdAt_desc">Newest First</option>
                    <option value="createdAt_asc">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A–Z</option>
                    <option value="name_desc">Name: Z–A</option>
                  </select>
                </div>
              </div>

              {/* Loading */}
              {isPending && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: LIMIT }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="text-center py-20 text-gray-400 text-sm">
                  Could not load products. Please refresh the page.
                </div>
              )}

              {/* Empty */}
              {!isPending && !isError && products.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Package size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-semibold">No products found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
                  <button 
                    onClick={resetFilters} 
                    className="px-5 py-2 rounded-xl text-white text-sm font-bold transition-colors"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}

              {/* Grid */}
              {!isPending && !isError && products.length > 0 && (
                <>
                 <ShuffledProductGrid products={products} />

                  {/* Pagination info */}
                  <p className="text-center text-xs text-gray-400 mt-6">
                    Showing {(pagination.page - 1) * LIMIT + 1}–{Math.min(pagination.page * LIMIT, pagination.total)} of {pagination.total} products
                  </p>

                  <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    onChange={p => { updateFilters({ page: p }); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile filter drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
                <p className="font-bold text-gray-800">Filters</p>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel
                  filters={filters}
                  onChange={f => { updateFilters(f); setMobileFiltersOpen(false) }}
                  onReset={() => { resetFilters(); setMobileFiltersOpen(false) }}
                  totalResults={pagination.total}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
       <DaseAboutSection />
    </div>
  )
}