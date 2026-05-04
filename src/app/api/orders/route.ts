// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: CORS }
      )
    }

    const admin = await db.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true },
    })
    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403, headers: CORS }
      )
    }

    const body = await req.json()
    const { id, deliveryStatus, note, status } = body

    if (!id || !deliveryStatus) {
      return NextResponse.json(
        { success: false, error: "id and deliveryStatus are required" },
        { status: 400, headers: CORS }
      )
    }

    const order = await db.order.findUnique({
      where:  { id },
      select: { id: true, userId: true, referenceId: true },
    })
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: CORS }
      )
    }

    const [updatedOrder] = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          deliveryStatus,
          ...(status && { status }),
        },
      })
      await tx.orderStatusUpdate.create({
        data: { orderId: id, status: deliveryStatus, note: note ?? null },
      })
      return [updated]
    })

    const deviceTokens = await db.deviceToken.findMany({
      where:  { userId: order.userId },
      select: { token: true },
    })

    const DELIVERY_LABELS: Record<string, string> = {
      PENDING:   "Order Placed",
      CONFIRMED: "Order Confirmed",
      SHIPPED:   "Out for Delivery",
      DELIVERED: "Order Delivered",
      CANCELLED: "Order Cancelled",
    }

    const label    = DELIVERY_LABELS[deliveryStatus] ?? deliveryStatus
    const pushBody = note ?? `Your order ${order.referenceId} has been updated.`
    await Promise.allSettled(deviceTokens.map((dt) => sendFcmPush(dt.token, label, pushBody)))

    return NextResponse.json(
      { success: true, message: "Order status updated", order: updatedOrder },
      { status: 200, headers: CORS }
    )
  } catch (err) {
    console.error("[orders POST]", err)
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers: CORS }
    )
  }
}

async function sendFcmPush(token: string, title: string, body: string) {
  const serverKey = process.env.FIREBASE_SERVER_KEY
  if (!serverKey) return
  try {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `key=${serverKey}` },
      body: JSON.stringify({
        to:           token,
        notification: { title, body, icon: "/logo.png" },
        data:         { type: "order_status_update" },
      }),
    })
  } catch (err) {
    console.warn("[FCM push] Failed:", err)
  }
}