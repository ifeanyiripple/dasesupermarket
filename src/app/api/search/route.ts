// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q    = searchParams.get("q")?.trim() ?? ""
  const type = searchParams.get("type") ?? "all"   // "all" | "product" | "food" | "room"

  if (!q || q.length < 1) {
    return NextResponse.json({ success: true, results: [], total: 0, query: q })
  }

  const term = { contains: q, mode: "insensitive" as const }

  // ── Run queries in parallel ───────────────────────────────────────────────
  const [rawProducts, rawFoods, rawRooms] = await Promise.all([

    // Products
    (type === "all" || type === "product")
      ? db.product.findMany({
          where: {
            OR: [
              { name:        term },
              { description: term },
              { category:    term },
              { brand:       term },
              { netContent:  term },
            ],
          },
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
              take: 3,
            },
          },
          take: 30,
        })
      : Promise.resolve([]),

    // Foods
    (type === "all" || type === "food")
      ? db.food.findMany({
          where: {
            OR: [
              { name:        term },
              { description: term },
              { category:    term },
            ],
          },
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

    // Rooms
    (type === "all" || type === "room")
      ? db.room.findMany({
          where: {
            OR: [
              { name:        term },
              { description: term },
              { bed:         term },
            ],
          },
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

  // ── Tag each result with its type so the client can render correctly ───────
  const products = rawProducts.map(p => ({ ...p, _type: "product" as const }))
  const foods    = rawFoods.map(f => ({ ...f, _type: "food"    as const }))
  const rooms    = rawRooms.map(r => ({ ...r, _type: "room"    as const }))

  const total = products.length + foods.length + rooms.length

  return NextResponse.json({
    success: true,
    query:   q,
    total,
    products,
    foods,
    rooms,
  })
}