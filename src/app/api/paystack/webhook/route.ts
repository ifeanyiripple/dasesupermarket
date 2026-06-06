// app/api/paystack/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { deriveOrderCategory, sendOrderEmails } from "@/lib/mail"

export const runtime = "nodejs"

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify webhook signature ───────────────────────────────────────────
    const rawBody  = await req.text()
    const signature = req.headers.get("x-paystack-signature") ?? ""

    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY missing")
      return NextResponse.json({ error: "server misconfigured" }, { status: 500 })
    }

    const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
    if (!timingSafeEqual(computed, signature)) {
      console.error("Invalid Paystack signature")
      return NextResponse.json({ error: "invalid signature" }, { status: 400 })
    }

    // ── 2. Parse event ────────────────────────────────────────────────────────
    const event     = JSON.parse(rawBody)
    const eventType = event?.event as string

    console.log("[webhook] Paystack event received:", eventType)

    // ── 3. charge.success ─────────────────────────────────────────────────────
    if (eventType === "charge.success") {
      const data             = event?.data
      const paymentReference = data?.reference  as string
      const amountKobo       = data?.amount     as number
      const channel          = data?.channel    as string
      const metadata         = data?.metadata   ?? {}

      if (!paymentReference) {
        console.warn("[webhook] charge.success missing reference")
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      // Reject stray events from other Dase verticals (hotel, etc.)
      if (metadata.source && metadata.source !== "dase_supermarket") {
        console.warn(`[webhook] Rejected event from source: ${metadata.source}`)
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      // ── Find the order (by referenceId first, then metadata.orderId) ─────────
      // Include user relation — will be null for guest orders
      let order = await db.order.findUnique({
        where:   { referenceId: paymentReference },
        include: { user: true, orderItems: true },
      })

      if (!order && metadata.orderId) {
        order = await db.order.findUnique({
          where:   { id: metadata.orderId },
          include: { user: true, orderItems: true },
        })
      }

      if (!order) {
        console.warn(`[webhook] No order found for reference: ${paymentReference}`)
        console.error("[webhook] Orphaned payment:", {
          reference:  paymentReference,
          amount:     amountKobo / 100,
          channel,
          metadata,
          receivedAt: new Date().toISOString(),
        })
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      // ── Already processed guard ───────────────────────────────────────────
      if (order.status === "SUCCESS") {
        console.log(`[webhook] Order ${order.id} already SUCCESS — skipping`)
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      // ── Amount verification (10 Naira tolerance for float precision) ──────
      const expectedKobo = Math.round(order.amount * 100)
      const diff         = Math.abs(expectedKobo - amountKobo)

      if (diff > 1000) {
        console.warn(
          `[webhook] Amount mismatch for order ${order.id}. ` +
          `Expected: ${expectedKobo} kobo, Got: ${amountKobo} kobo`
        )
        await db.order.update({
          where: { id: order.id },
          data:  { status: "FAILED", deliveryStatus: "PENDING" },
        })
        return NextResponse.json({ error: "amount mismatch" }, { status: 400 })
      }

      // ── Mark order as paid ────────────────────────────────────────────────
      await db.order.update({
        where: { id: order.id },
        data:  { status: "SUCCESS", deliveryStatus: "CONFIRMED" },
      })

      console.log(`[webhook] Order ${order.id} marked SUCCESS (${order.guestEmail ? "guest" : "user"})`)

      // ── Resolve customer identity for the confirmation email ──────────────
      // order.user is null for guest orders — fall back to guestEmail
      const customerEmail = order.user?.email   ?? order.guestEmail  ?? null
      const customerName  = order.user?.name    ?? (
        // Derive a friendly name from the email prefix for guests
        order.guestEmail
          ? order.guestEmail.split("@")[0]
          : "Customer"
      )
      const customerPhone = order.phoneNumber   ?? order.user?.phoneNumber ?? null

      // ── Send confirmation emails ──────────────────────────────────────────
      try {
        const category   = deriveOrderCategory(order.orderItems)
          const isRoomBooking = Boolean(metadata.roomBooking)

        const emailItems = order.orderItems.map(item => ({
          name:     item.name,
          quantity: item.quantity,
          price:    item.price,
          subtotal: item.quantity * item.price,
          variant:  item.imageColor !== "default" ? item.imageColor : undefined,
        }))

        await sendOrderEmails({
          customerName,
          customerEmail,           // works for both user email and raw guestEmail
          customerPhone,
          orderReference:   order.referenceId || order.id,
          category,
          items:            emailItems,
          totalAmount:      order.amount,
          paymentMethod:    channel || "card",
          paymentReference: paymentReference,
          ...(isRoomBooking && {
      roomName:  metadata.roomName  ?? null,
      checkIn:   metadata.checkIn   ?? null,
      checkOut:  metadata.checkOut  ?? null,
      nights:    metadata.nights    ?? null,
      guestName: metadata.guestName ?? customerName,
    }),

        })

        console.log(`[webhook] Confirmation email sent for order ${order.id} to ${customerEmail}`)
      } catch (emailErr) {
        // Never fail the webhook over an email error — payment is already confirmed
        console.error(`[webhook] Email failed for order ${order.id}:`, emailErr)
      }

      // ── Revalidate admin/order paths ──────────────────────────────────────
      try {
        revalidatePath("/dashboard/orders")
        revalidatePath("/orders")
      } catch { /* revalidation is non-critical */ }

      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 4. All other event types ──────────────────────────────────────────────
    console.log(`[webhook] Unhandled event type: ${eventType}`)
    return NextResponse.json({ ok: true }, { status: 200 })

  } catch (err) {
    console.error("[webhook] Unhandled error:", err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
