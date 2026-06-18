// app/sitemap.ts
// Next.js App Router sitemap — auto-served at /sitemap.xml
// Covers: static pages, all products, foods, rooms, and category pages.
// Priority and changeFrequency are tuned for an e-commerce store.

import { MetadataRoute } from "next"
import { db } from "@/lib/db"

export const revalidate = 3600 // regenerate every hour
export const dynamic = "force-dynamic"

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dasesupermarket.com"
).replace(/\/$/, "") // strip trailing slash if any

// ── Helpers ───────────────────────────────────────────────────────────────────

type Frequency =
  | "always" | "hourly" | "daily"
  | "weekly" | "monthly" | "yearly" | "never"

function url(
  path: string,
  opts: {
    lastModified?: Date
    changeFrequency?: Frequency
    priority?: number
  } = {}
): MetadataRoute.Sitemap[number] {
  return {
    url:             `${BASE_URL}${path}`,
    lastModified:    opts.lastModified    ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority:        opts.priority        ?? 0.7,
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── 1. Fetch all DB data in parallel ───────────────────────────────────────
  const [products, foods, rooms] = await Promise.all([

    db.product.findMany({
      select: {
        id:         true,
        category:   true,
        inStock:    true,
        isFeatured: true,
        updatedAt:  true,
      },
      orderBy: { updatedAt: "desc" },
    }),

    db.food.findMany({
      select: {
        id:        true,
        category:  true,
        inStock:   true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),

    db.room.findMany({
      select: {
        id:        true,
        status:    true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  // ── 2. Static pages ────────────────────────────────────────────────────────
  // Priority scale:
  //   1.0 = homepage (most important page on the site)
  //   0.9 = primary commercial pages (shop, food, rooms)
  //   0.8 = supporting pages users frequently visit
  //   0.5 = informational pages (about, contact)
  //   0.3 = utility pages (search, auth) — indexable but low value

  const staticPages: MetadataRoute.Sitemap = [

    // ── Homepage ─────────────────────────────────────────────────────────────
    url("/", {
      changeFrequency: "daily",
      priority:        1.0,
    }),

    // ── Primary commercial destinations ──────────────────────────────────────
    url("/shop", {
      changeFrequency: "daily",
      priority:        0.9,
      lastModified:    products[0]?.updatedAt,
    }),
    url("/food", {
      changeFrequency: "daily",
      priority:        0.9,
      lastModified:    foods[0]?.updatedAt,
    }),
    url("/rooms", {
      changeFrequency: "weekly",
      priority:        0.85,
      lastModified:    rooms[0]?.updatedAt,
    }),

    // ── Supporting ────────────────────────────────────────────────────────────
    url("/categories", {
      changeFrequency: "weekly",
      priority:        0.8,
    }),
    url("/deals", {
      changeFrequency: "daily",
      priority:        0.8,
    }),

    // ── Informational ─────────────────────────────────────────────────────────
    url("/about-us", {
      changeFrequency: "monthly",
      priority:        0.5,
    }),
    url("/contact-us", {
      changeFrequency: "monthly",
      priority:        0.5,
    }),

    // ── Utility ───────────────────────────────────────────────────────────────
    // Search is indexable — Google can discover product names through it,
    // but it shouldn't compete with actual product pages in rankings.
    url("/search", {
      changeFrequency: "always",
      priority:        0.3,
    }),
  ]

  // ── 3. Product pages ───────────────────────────────────────────────────────
  // Featured + in-stock products get the highest priority (0.9).
  // Regular in-stock products get 0.8.
  // Out-of-stock products still get indexed (0.5) because they may come back
  // and we don't want to lose their accumulated link equity.

  const productPages: MetadataRoute.Sitemap = products.map(p => {
    const priority = p.isFeatured && p.inStock ? 0.9
                   : p.inStock                 ? 0.8
                   :                             0.5

    const changeFrequency: Frequency = p.inStock ? "weekly" : "monthly"

    return url(`/product/${p.id}`, {
      lastModified:    p.updatedAt,
      changeFrequency,
      priority,
    })
  })

  // ── 4. Food / menu item pages ──────────────────────────────────────────────
  // Same logic: available dishes rank higher than unavailable ones.

  const foodPages: MetadataRoute.Sitemap = foods.map(f => ({
    url:             `${BASE_URL}/food/${f.id}`,
    lastModified:    f.updatedAt,
    changeFrequency: (f.inStock ? "weekly" : "monthly") as Frequency,
    priority:        f.inStock ? 0.8 : 0.5,
  }))

  // ── 5. Room pages ──────────────────────────────────────────────────────────
  // Available rooms are actively bookable → higher priority.

  const roomPages: MetadataRoute.Sitemap = rooms.map(r => ({
    url:             `${BASE_URL}/hotel/${r.id}`,
    lastModified:    r.updatedAt,
    changeFrequency: (r.status === "AVAILABLE" ? "weekly" : "monthly") as Frequency,
    priority:        r.status === "AVAILABLE" ? 0.8 : 0.5,
  }))

  // ── 6. Category pages ──────────────────────────────────────────────────────
  // One URL per unique product category, e.g. /categories/beverages
  // These are excellent landing pages for branded search terms.

  const productCategories = [...new Set(products.map(p => p.category))]
  const foodCategories    = [...new Set(foods.map(f => f.category))]

  const categoryPages: MetadataRoute.Sitemap = [
    ...productCategories.map(cat =>
      url(`/categories/${encodeURIComponent(cat.toLowerCase())}`, {
        changeFrequency: "weekly",
        priority:        0.75,
      })
    ),
    ...foodCategories.map(cat =>
      url(`/food/category/${encodeURIComponent(cat.toLowerCase())}`, {
        changeFrequency: "weekly",
        priority:        0.7,
      })
    ),
  ]

  // ── Combine — order matters: static first, then products (highest traffic) ─
  return [
    ...staticPages,
    ...productPages,
    ...foodPages,
    ...roomPages,
    ...categoryPages,
  ]
}