// src/app/api/foods/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET() {
  try {
    const foods = await db.food.findMany({
      select: {
        id: true, name: true, description: true, price: true,
        category: true, inStock: true, badge: true, image: true,
        spicy: true, rating: true, prepTime: true, serves: true,
        isFeatured: true,
        meatOptions: {
          select: { id: true, name: true, price: true, isDefault: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      { success: true, data: { foods } },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[GET /api/foods]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}