// src/app/(root)/categories/page.tsx
import { db } from "@/lib/db"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import CategoryIcon from "@/components/categories/CategoryIcon"
import { categories } from "@/utils/Categories"

export const metadata: Metadata = {
  title: "Shop by Category | DASE Supermarket",
  description:
    "Browse DASE Supermarket by category — Fruits, Vegetables, Dairy, Bakery, Household essentials and more, delivered across Oyo, Nigeria.",
}

async function getCategoryCounts() {
  const rows = await db.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  })

  const counts: Record<string, number> = {}

  for (const row of rows) {
    counts[row.category.toLowerCase()] = row._count._all
  }

  return counts
}

export default async function CategoriesPage() {
  const counts = await getCategoryCounts()

  const totalProducts = Object.values(counts).reduce(
    (sum, n) => sum + n,
    0
  )

  // Only show categories that have at least one product
  const tiles = categories.filter((cat) => {
    const key = cat.label.toLowerCase()
    return key !== "all" && (counts[key] ?? 0) > 0
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <section
          className="px-4 py-10 md:py-16"
          style={{
            backgroundColor: "var(--theme-primary-hover, #144d2e)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">
                Categories
              </span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Shop by Category
            </h1>

            <p className="text-white/60 text-sm mt-3 max-w-xl">
              {totalProducts} product
              {totalProducts !== 1 ? "s" : ""} across every aisle —
              find exactly what you need.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-black text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              View all products
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Category Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
          {tiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {tiles.map((cat) => {
                const count = counts[cat.label.toLowerCase()]
                const slug = encodeURIComponent(cat.label)

                return (
                  <Link
                    key={cat.label}
                    href={`/categories/${slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 p-4 md:p-5 bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1.5px var(--theme-primary, #1a5c38)",
                      }}
                    />

                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: cat.color,
                        color: "var(--theme-primary, #1a5c38)",
                      }}
                    >
                      <CategoryIcon
                        label={cat.label}
                        size={22}
                      />
                    </div>

                    <p className="text-sm font-black leading-tight mb-1 text-gray-900">
                      {cat.label}
                    </p>

                    <p className="text-[11px] text-gray-400 mb-3">
                      {count} product
                      {count !== 1 ? "s" : ""}
                    </p>

                    <div
                      className="inline-flex items-center gap-1 text-[11px] font-black"
                      style={{
                        color: "var(--theme-primary, #1a5c38)",
                      }}
                    >
                      Explore
                      <ArrowRight
                        size={11}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                No categories available
              </h2>
              <p className="text-gray-500 mt-2">
                Products will appear here once they have been added.
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
          <div className="rounded-2xl p-8 md:p-12 text-center bg-white border border-gray-100">
            <p className="text-lg md:text-2xl font-black text-gray-900">
              Can&apos;t find what you&apos;re looking for?
            </p>

            <p className="text-sm text-gray-500 mt-2 mb-6">
              Browse our entire collection or search for specific
              items.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/shop"
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor:
                    "var(--theme-primary, #1a5c38)",
                }}
              >
                All products
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}