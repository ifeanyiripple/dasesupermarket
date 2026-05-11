// app/search/page.tsx

import { Suspense }  from "react"
import { db }        from "@/lib/db"
import Navbar        from "@/components/layout/Navbar"
import SearchResults from "./_components/SearchResults"
import { Search }    from "lucide-react"

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>
}

// ── Keyword helpers (same logic as the API route) ─────────────────────────────

function buildProductWhere(keywords: string[]) {
  const mode = "insensitive" as const
  const stringConditions = keywords.flatMap(kw => [
    { name:            { contains: kw, mode } },
    { description:     { contains: kw, mode } },
    { category:        { contains: kw, mode } },
    { brand:           { contains: kw, mode } },
    { netContent:      { contains: kw, mode } },
    { containerType:   { contains: kw, mode } },
    { ingredients:     { contains: kw, mode } },
    { storageInfo:     { contains: kw, mode } },
    { countryOfOrigin: { contains: kw, mode } },
    { badge:           { contains: kw, mode } },
  ])
  return { OR: [...stringConditions, { keyFeatures: { hasSome: keywords } }] }
}

function buildFoodWhere(keywords: string[]) {
  const mode = "insensitive" as const
  return {
    OR: keywords.flatMap(kw => [
      { name:        { contains: kw, mode } },
      { description: { contains: kw, mode } },
      { category:    { contains: kw, mode } },
      { prepTime:    { contains: kw, mode } },
      { badge:       { contains: kw, mode } },
    ]),
  }
}

function buildRoomWhere(keywords: string[]) {
  const mode = "insensitive" as const
  return {
    OR: keywords.flatMap(kw => [
      { name:        { contains: kw, mode } },
      { description: { contains: kw, mode } },
      { bed:         { contains: kw, mode } },
      { roomNumber:  { contains: kw, mode } },
    ]),
  }
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function fetchResults(q: string, type: string) {
  if (!q.trim()) return { products: [], foods: [], rooms: [] }

  const keywords = [...new Set(q.split(/\s+/).filter(Boolean))]

  const [products, foods, rooms] = await Promise.all([

    (type === "all" || type === "product")
      ? db.product.findMany({
          where:  buildProductWhere(keywords),
          select: {
            id:            true,
            name:          true,
            description:   true,
            price:         true,
            originalPrice: true,
            category:      true,
            brand:         true,
            inStock:       true,
            badge:         true,
            isFeatured:    true,
            images: {
              select: { id: true, color: true, colorCode: true, image: true },
              take:   3,
            },
          },
          take: 40,
        })
      : Promise.resolve([]),

    (type === "all" || type === "food")
      ? db.food.findMany({
          where:  buildFoodWhere(keywords),
          select: {
            id:          true,
            name:        true,
            description: true,
            price:       true,
            category:    true,
            inStock:     true,
            badge:       true,
            image:       true,
            spicy:       true,
            rating:      true,
            prepTime:    true,
            serves:      true,
            isFeatured:  true,
          },
          take: 20,
        })
      : Promise.resolve([]),

    (type === "all" || type === "room")
      ? db.room.findMany({
          where:  buildRoomWhere(keywords),
          select: {
            id:          true,
            name:        true,
            description: true,
            price:       true,
            roomNumber:  true,
            capacity:    true,
            status:      true,
            bed:         true,
            amenities:   true,
            images:      true,
            featured:    true,
          },
          take: 10,
        })
      : Promise.resolve([]),
  ])

  return { products, foods, rooms }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", type = "all" } = await searchParams
  const { products, foods, rooms } = await fetchResults(q, type)
  const total = products.length + foods.length + rooms.length

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fdfb]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-12 py-6 md:py-10">

        <div className="mb-6">
          {q ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Search size={16} className="text-[#1a5c38]" />
                <p className="text-xs font-bold tracking-widest uppercase text-[#1a5c38]">
                  Search Results
                </p>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                &ldquo;{q}&rdquo;
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {total === 0
                  ? "No results found — try a different word"
                  : `${total} result${total !== 1 ? "s" : ""} across products, food, and rooms`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
                Search DASE
              </h1>
              <p className="text-sm text-gray-400">
                Find products, food, and rooms all in one place.
              </p>
            </>
          )}
        </div>

        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults
            query={q}
            activeType={type}
            products={products}
            foods={foods}
            rooms={rooms}
          />
        </Suspense>
      </main>
    </div>
  )
}

export async function generateMetadata({ searchParams }: Props) {
  const { q = "" } = await searchParams
  return { title: q ? `"${q}" — DASE Search` : "Search — DASE" }
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-[3/4]" />
      ))}
    </div>
  )
}