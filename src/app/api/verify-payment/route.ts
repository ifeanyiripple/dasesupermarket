import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference")
  const orderId = req.nextUrl.searchParams.get("orderId")

  if (!reference) {
    return NextResponse.json({ success: false })
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await res.json()

    if (data?.data?.status !== "success") {
      return NextResponse.json({ success: false })
    }

    // 🔥 Find order
    let order = await db.order.findUnique({
      where: { referenceId: reference },
    })

    if (!order && orderId) {
      order = await db.order.findUnique({
        where: { id: orderId },
      })
    }

    if (!order) {
      return NextResponse.json({ success: false })
    }

    // Prevent duplicate updates
    if (order.status !== "SUCCESS") {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
          deliveryStatus: "PENDING",
        },
      })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false })
  }
}