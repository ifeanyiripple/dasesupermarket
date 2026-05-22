// app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY missing");
      return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
    }

    const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (!timingSafeEqual(computed, signature)) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }

    // 2. Parse event
    const event = JSON.parse(rawBody);
    const eventType: string = event?.event;

    console.log("Paystack event received:", eventType);

    // 3. Handle charge.success (payment completed)
    if (eventType === "charge.success") {
      const data = event?.data;
      const paymentReference: string = data?.reference;
      const amountKobo: number = data?.amount; // Amount in kobo
      const channel: string = data?.channel; // "card", "bank", "ussd", etc.
      const metadata = data?.metadata || {};

      if (!paymentReference) {
        console.warn("charge.success missing reference");
        return NextResponse.json({ ok: true }, { status: 200 });
      }

       // Rejects any stray hotel events that somehow arrive here
  if (metadata.source && metadata.source !== "dase_supermarket") {
    console.warn(`[Supermarket] Rejected event from source: ${metadata.source}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

      // Find order by referenceId
      let order = await db.order.findUnique({
        where: { referenceId: paymentReference },
        include: { user: true, orderItems: true }
      });

      // If not found by referenceId, check metadata for orderId
      if (!order && metadata.orderId) {
        order = await db.order.findUnique({
          where: { id: metadata.orderId },
          include: { user: true, orderItems: true }
        });
      }

      if (order) {
        // Check if already processed
        if (order.status === "SUCCESS") {
          console.log(`Order ${order.id} already marked as SUCCESS`);
          return NextResponse.json({ ok: true }, { status: 200 });
        }

        // ── Amount verification (1-kobo tolerance for float precision) ──────────
  const expectedAmountKobo = Math.round(order.amount * 100);
  const diff = Math.abs(expectedAmountKobo - amountKobo);

  if (diff > 1000) { // 10 naira difference
    console.warn(
      `[Supermarket] Amount mismatch for order ${order.id}. ` +
      `Expected: ${expectedAmountKobo} kobo, Got: ${amountKobo} kobo`
    );
    await db.order.update({
      where: { id: order.id },
      data: { status: "FAILED", deliveryStatus: "PENDING" },
    });
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }
        // Update order as SUCCESS
        await db.order.update({
          where: { id: order.id },
          data: {
            status: "SUCCESS",
            deliveryStatus: "CONFIRMED", 
          }
        });

        console.log(`Order ${order.id} marked as SUCCESS`);
        
        // Revalidate relevant paths
        try {
          revalidatePath("/dashboard/orders");
          revalidatePath("/orders");
        } catch { }

        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // If no order found, log orphaned payment
      console.warn(`No order found for reference: ${paymentReference}`);
      
      // Store as orphaned payment for manual reconciliation if needed
      console.error("Orphaned payment detected:", {
        reference: paymentReference,
        amount: amountKobo / 100,
        channel,
        metadata,
        receivedAt: new Date().toISOString()
      });

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 4. Handle other events
    console.log(`Unhandled event type: ${eventType}`);
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}