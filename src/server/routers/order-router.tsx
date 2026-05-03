// src/server/routers/order-router.ts
// Handles order creation, retrieval, and status updates
// Status updates also: persist history, fire Pusher real-time event, send FCM push

import { db }             from "@/lib/db"
import { router }         from "../__internals/router"
import { privateProcedure, publicProcedure } from "../procedures"
import { HTTPException }  from "hono/http-exception"
import { z }              from "zod"
import { pusherServer }   from "@/lib/pusher"

// ── Input schema for a single order item ─────────────────────────────────────
const ORDER_ITEM_SCHEMA = z.object({
  productId:      z.string(),
  name:           z.string(),
  description:    z.string(),
  category:       z.string(),
  brand:          z.string(),
  quantity:       z.number().min(1),
  price:          z.number().positive(),
  imageColor:     z.string(),
  imageColorCode: z.string(),
  imageUrl:       z.string(),
})

// ── Delivery status steps (must match DeliveryStatus enum in schema) ──────────
const DELIVERY_STATUS = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
type DeliveryStatusType = z.infer<typeof DELIVERY_STATUS>

const DELIVERY_LABELS: Record<DeliveryStatusType, string> = {
  PENDING:   "Order Placed",
  CONFIRMED: "Order Confirmed",
  SHIPPED:   "Out for Delivery",
  DELIVERED: "Order Delivered",
  CANCELLED: "Order Cancelled",
}

// Generates a short human-readable reference like DASE-20240301-AB12
function generateReference(): string {
  const date    = new Date()
  const dateStr = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("")
  const rand    = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DASE-${dateStr}-${rand}`
}

// ── Send FCM push notification to a single device token ──────────────────────
async function sendFcmPush(token: string, title: string, body: string): Promise<void> {
  const serverKey = process.env.FIREBASE_SERVER_KEY
  if (!serverKey) return // gracefully skip if not configured

  try {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `key=${serverKey}`,
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body, icon: "/logo.png" },
        data:          { type: "order_status_update" },
      }),
    })
  } catch (err) {
    console.warn("[FCM push] Failed to send:", err)
  }
}

export const ordersRouter = router({

  // ── Create order (authenticated users only) ───────────────────────────────
  createOrder: privateProcedure
    .input(z.object({
      amount:      z.number().positive(),
      currency:    z.string().default("NGN"),
      address:     z.string().optional(),
      phoneNumber: z.string().optional(),
      orderItems:  z.array(ORDER_ITEM_SCHEMA).min(1, "Order must have at least one item"),
    }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const user = await db.user.findUnique({ where: { id: ctx.user.id }, select: { id: true } })
        if (!user) throw new HTTPException(404, { message: "User not found" })

        const productIds = [...new Set(input.orderItems.map(i => i.productId))]
        const products   = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, inStock: true, price: true } })

        for (const item of input.orderItems) {
          const product = products.find(p => p.id === item.productId)
          if (!product)         throw new HTTPException(400, { message: `Product ${item.name} not found` })
          if (!product.inStock) throw new HTTPException(400, { message: `${item.name} is out of stock` })
        }

        let referenceId = generateReference()
        let attempts    = 0
        while (attempts < 5) {
          const existing = await db.order.findUnique({ where: { referenceId } })
          if (!existing) break
          referenceId = generateReference()
          attempts++
        }

        const order = await db.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              userId:         ctx.user.id,
              amount:         input.amount,
              currency:       input.currency,
              status:         "pending",
              deliveryStatus: "PENDING",
              referenceId,
              address:        input.address,
              phoneNumber:    input.phoneNumber,
              orderItems: {
                create: input.orderItems.map(item => ({
                  productId:      item.productId,
                  name:           item.name,
                  description:    item.description,
                  category:       item.category,
                  brand:          item.brand,
                  quantity:       item.quantity,
                  price:          item.price,
                  imageColor:     item.imageColor,
                  imageColorCode: item.imageColorCode,
                  imageUrl:       item.imageUrl,
                })),
              },
            },
            include: {
              orderItems: true,
              user: { select: { id: true, name: true, email: true } },
            },
          })

          // Create the first status history entry
          await tx.orderStatusUpdate.create({
            data: { orderId: newOrder.id, status: "PENDING", note: "Order placed successfully" },
          })

          return newOrder
        })

        console.log("Order created:", order.referenceId)

        return c.superjson({
          success: true,
          message: "Order placed successfully",
          order: {
            id:             order.id,
            referenceId:    order.referenceId,
            amount:         order.amount,
            status:         order.status,
            deliveryStatus: order.deliveryStatus,
            createDate:     order.createDate,
          },
        })
      } catch (error) {
        console.error("Error creating order:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while placing the order" })
      }
    }),

  // ── Get current user's orders ─────────────────────────────────────────────
  getMyOrders: privateProcedure
    .query(async ({ ctx, c }) => {
      try {
        const orders = await db.order.findMany({
          where:   { userId: ctx.user.id },
          orderBy: { createDate: "desc" },
          include: { orderItems: true },
        })
        return c.superjson({ success: true, orders })
      } catch (error) {
        console.error("Error fetching orders:", error)
        throw new HTTPException(500, { message: "Failed to fetch orders" })
      }
    }),

  // ── Get a single order by reference ID (owner or admin) ──────────────────
  getOrder: privateProcedure
    .input(z.object({ referenceId: z.string() }))
    .query(async ({ ctx, input, c }) => {
      try {
        const order = await db.order.findUnique({
          where:   { referenceId: input.referenceId },
          include: {
            orderItems:    true,
            statusUpdates: { orderBy: { createdAt: "asc" } },
            user: { select: { id: true, name: true, email: true } },
          },
        })
        if (!order) throw new HTTPException(404, { message: "Order not found" })

        const user = await db.user.findUnique({ where: { id: ctx.user.id }, select: { role: true } })
        if (order.userId !== ctx.user.id && user?.role !== "ADMIN") {
          throw new HTTPException(403, { message: "You don't have permission to view this order" })
        }
        return c.superjson({ success: true, order })
      } catch (error) {
        console.error("Error fetching order:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Failed to fetch order" })
      }
    }),

  // ── Update order delivery status (admin only) ─────────────────────────────
  // Also: creates OrderStatusUpdate record, fires Pusher event, sends FCM push
  updateOrderStatus: privateProcedure
    .input(z.object({
      id:             z.string(),
      deliveryStatus: DELIVERY_STATUS,
      note:           z.string().optional(),
      // Payment status update (optional, separate from delivery)
      status:         z.enum(["pending", "processing", "complete", "cancelled"]).optional(),
    }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        // Admin-only guard
        const adminUser = await db.user.findUnique({ where: { id: ctx.user.id }, select: { role: true } })
        if (!adminUser || adminUser.role !== "ADMIN") {
          throw new HTTPException(403, { message: "Admin access required" })
        }

        // Fetch the order to get userId for notification routing
        const order = await db.order.findUnique({
          where:  { id: input.id },
          select: { id: true, userId: true, referenceId: true, deliveryStatus: true },
        })
        if (!order) throw new HTTPException(404, { message: "Order not found" })

        // Persist status update in a transaction
        const [updatedOrder, statusUpdate] = await db.$transaction(async (tx) => {
          const updated = await tx.order.update({
            where: { id: input.id },
            data: {
              deliveryStatus: input.deliveryStatus,
              ...(input.status && { status: input.status }),
            },
          })

          const su = await tx.orderStatusUpdate.create({
            data: {
              orderId: input.id,
              status:  input.deliveryStatus,
              note:    input.note ?? null,
            },
          })

          return [updated, su]
        })

        // ── Pusher: real-time update for the user ─────────────────────────
        // Channel: "orders-{userId}" — Event: "status-updated"
        try {
          await pusherServer.trigger(
            `orders-${order.userId}`,
            "status-updated",
            {
              orderId:        input.id,
              referenceId:    order.referenceId,
              deliveryStatus: input.deliveryStatus,
              label:          DELIVERY_LABELS[input.deliveryStatus],
              note:           input.note,
              updatedAt:      statusUpdate.createdAt.toISOString(),
            }
          )
        } catch (pusherErr) {
          console.warn("[Pusher] Failed to trigger event:", pusherErr)
        }

        // ── FCM: push notification to all user device tokens ──────────────
        const deviceTokens = await db.deviceToken.findMany({
          where:  { userId: order.userId },
          select: { token: true },
        })
        const label = DELIVERY_LABELS[input.deliveryStatus]
        const body  = input.note ?? `Your order ${order.referenceId} has been updated.`
        await Promise.allSettled(deviceTokens.map(dt => sendFcmPush(dt.token, label, body)))

        return c.superjson({ success: true, message: "Order status updated", order: updatedOrder })
      } catch (error) {
        console.error("Error updating order:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Failed to update order" })
      }
    }),
})