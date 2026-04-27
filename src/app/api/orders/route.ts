// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(req: NextRequest) {
  try {
    // ── Resolve user ID from either session (web) or Bearer token (mobile) ──
    let userId: string | null = null

    const authHeader = req.headers.get("Authorization")

    if (authHeader?.startsWith("Bearer ")) {
      const token   = authHeader.split(" ")[1]
      const payload = await verifyMobileToken(token)
      if (!payload) {
        return NextResponse.json(
          { success: false, error: { code: 401, message: "Invalid or expired token" } },
          { status: 401, headers: CORS }
        )
      }
      userId = payload.userId
    } else {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: { code: 401, message: "Unauthorized" } },
          { status: 401, headers: CORS }
        )
      }
      userId = session.user.id
    }

    // ── Optional pagination via query params ───────────────────────────────
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const skip  = (page - 1) * limit

    // ── Fetch orders with item snapshots ───────────────────────────────────
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where:   { userId },
        orderBy: { createDate: "desc" },
        skip,
        take: limit,
        include: {
          orderItems: {
            select: {
              id:             true,
              name:           true,
              quantity:       true,
              price:          true,
              imageUrl:       true,
              imageColor:     true,
              imageColorCode: true,
              category:       true,
              brand:          true,
            },
          },
        },
      }),
      db.order.count({ where: { userId } }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200, headers: CORS }
    )
  } catch (err) {
    console.error("[orders GET]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}