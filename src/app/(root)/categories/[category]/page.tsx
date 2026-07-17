// src/app/(root)/categories/[category]/page.tsx
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import CategoryIcon from "@/components/categories/CategoryIcon"
import { categories } from "@/utils/Categories"
import CategoryProductsClient from "./_components/CategoryProductsClient"
import type { CardProduct } from "@/components/ProductCard"

type Props = { params: Promise<{ category: string }> }

type RawProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: string
  brand: string | null
  inStock: boolean
  badge: string | null
  images: { id: string; color: string; colorCode: string; image: string }[]
}

function rawProductToCard(p: RawProduct): CardProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    brand: p.brand,
    inStock: p.inStock,
    badge: p.badge,
    itemType: "product",
    images:
      p.images.length > 0
        ? p.images
        : [{ id: p.id, color: "Default", colorCode: "#1a5c38", image: "" }],
  }
}

// Match the URL slug back to a canonical category label, case-insensitively.
function findCategory(slug: string) {
  const decoded = decodeURIComponent(slug)
  return (
    categories.find(
      (c) => c.label.toLowerCase() === decoded.toLowerCase() && c.label.toLowerCase() !== "all"
    ) ?? null
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const match = findCategory(category)
  const label = match?.label ?? decodeURIComponent(category)

  return {
    title: `${label} | DASE Supermarket`,
    description: `Shop ${label} at DASE Supermarket. Fresh, genuine products delivered across Oyo, Nigeria.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const match = findCategory(category)

  if (!match) notFound()

  const products = await db.product.findMany({
    where: { category: { equals: match.label, mode: "insensitive" } },
    include: {
      images: { select: { id: true, color: true, colorCode: true, image: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  })

  const cardProducts = products.map(rawProductToCard)

  // other categories to keep exploring
  const siblings = categories.filter(
    (c) => c.label.toLowerCase() !== "all" && c.label.toLowerCase() !== match.label.toLowerCase()
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        {/* header */}
        <section
          className="px-4 py-10 md:py-14"
          style={{ backgroundColor: "var(--theme-primary-hover, #144d2e)" }}
        >
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <span>/</span>
              <span className="text-white font-semibold">{match.label}</span>
            </nav>

            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
              >
                <CategoryIcon label={match.label} size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {match.label}
              </h1>
            </div>

            <p className="text-white/60 text-sm mt-2">
              {cardProducts.length} product{cardProducts.length !== 1 ? "s" : ""} available
            </p>

            <Link
              href="/categories"
              className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              Back to categories
            </Link>
          </div>
        </section>

        {/* products */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <CategoryProductsClient products={cardProducts} category={match.label} />
        </section>

        {/* other categories */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-gray-900">More categories</p>
            <Link
              href="/categories"
              className="text-xs font-bold"
              style={{ color: "var(--theme-primary, #1a5c38)" }}
            >
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {siblings.map((c) => (
              <Link
                key={c.label}
                href={`/categories/${encodeURIComponent(c.label)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors bg-white"
              >
                <span style={{ color: "var(--theme-primary, #1a5c38)" }} className="inline-flex">
                  <CategoryIcon label={c.label} size={13} />
                </span>
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
          <div className="rounded-2xl p-8 text-center bg-white border border-gray-100">
            <p className="font-black text-gray-900">Discover more amazing products</p>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Can&apos;t find what you need in {match.label}? Browse our entire collection.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/shop"
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--theme-primary, #1a5c38)" }}
              >
                Browse all products
              </Link>
              <Link
                href="/categories"
                className="px-6 py-2.5 rounded-xl text-sm font-black border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700"
              >
                All categories
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}