// src/app/api/rooms/route.ts
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
    const rooms = await db.room.findMany({
      select: {
        id: true, name: true, description: true, price: true,
        roomNumber: true, capacity: true, status: true,
        bed: true, amenities: true, images: true, featured: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      { success: true, data: { rooms } },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[GET /api/rooms]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}