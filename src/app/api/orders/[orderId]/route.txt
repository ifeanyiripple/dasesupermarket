// app/api/orders/[orderId]/route.ts
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

    const { orderId } = await params

    // ── Fetch the order, ensuring it belongs to the requesting user ────────
    const order = await db.order.findFirst({
      where: {
        id:     orderId,
        userId,          // ownership check — prevents accessing other users' orders
      },
      include: {
        orderItems: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 404, message: "Order not found" } },
        { status: 404, headers: CORS }
      )
    }

    return NextResponse.json(
      { success: true, data: { order } },
      { status: 200, headers: CORS }
    )
  } catch (err) {
    console.error("[orders/:orderId GET]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}