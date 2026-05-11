// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// ── Build a flat OR array that matches ANY keyword in ANY string field ─────────
// "Glass cup" → keywords = ["Glass", "cup"]
// Each keyword is tested against every field with case-insensitive `contains`.
// This means a product named "Glass Cup Set" matches, and so does one whose
// description mentions "glass" even if the name says something else entirely.

function buildProductWhere(keywords: string[]) {
  const mode = "insensitive" as const

  // One OR entry per (keyword × field) combination
  const stringConditions = keywords.flatMap(kw => [
    { name:             { contains: kw, mode } },
    { description:      { contains: kw, mode } },
    { category:         { contains: kw, mode } },
    { brand:            { contains: kw, mode } },
    { netContent:       { contains: kw, mode } },
    { containerType:    { contains: kw, mode } },
    { ingredients:      { contains: kw, mode } },
    { storageInfo:      { contains: kw, mode } },
    { countryOfOrigin:  { contains: kw, mode } },
    { badge:            { contains: kw, mode } },
  ])

  // keyFeatures is String[] — use hasSome to match any keyword in the array
  const arrayConditions = [
    { keyFeatures: { hasSome: keywords } },
  ]

  return { OR: [...stringConditions, ...arrayConditions] }
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

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q    = searchParams.get("q")?.trim() ?? ""
  const type = searchParams.get("type") ?? "all"

  if (!q) {
    return NextResponse.json({ success: true, products: [], foods: [], rooms: [], total: 0, query: q })
  }

  // Split on whitespace, remove empty strings, deduplicate
  const keywords = [...new Set(q.split(/\s+/).filter(Boolean))]

  const [rawProducts, rawFoods, rawRooms] = await Promise.all([

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

  const products = rawProducts.map(p => ({ ...p, _type: "product" as const }))
  const foods    = rawFoods.map(f => ({ ...f, _type: "food"    as const }))
  const rooms    = rawRooms.map(r => ({ ...r, _type: "room"    as const }))
  const total    = products.length + foods.length + rooms.length

  return NextResponse.json({ success: true, query: q, total, products, foods, rooms })
}