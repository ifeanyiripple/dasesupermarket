import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const DELIVERY_LABELS: Record<string, string> = {
  PENDING:   "Order Placed",
  CONFIRMED: "Order Confirmed",
  SHIPPED:   "Out for Delivery",
  DELIVERED: "Order Delivered",
  CANCELLED: "Order Cancelled",
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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
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

    // FCM push
    const deviceTokens = await db.deviceToken.findMany({
      where:  { userId: order.userId },
      select: { token: true },
    })
    const label = DELIVERY_LABELS[deliveryStatus] ?? deliveryStatus
    const pushBody = note ?? `Your order ${order.referenceId} has been updated.`
    await Promise.allSettled(deviceTokens.map((dt) => sendFcmPush(dt.token, label, pushBody)))

    return NextResponse.json(
      { success: true, message: "Order status updated", order: updatedOrder },
      { status: 200, headers: CORS }
    )
  } catch (err) {
    console.error("[updateOrderStatus POST]", err)
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers: CORS }
    )
  }
}