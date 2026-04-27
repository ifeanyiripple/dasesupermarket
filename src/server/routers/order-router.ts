// src/server/routers/orders.ts
// Handles order creation, retrieval, and status updates

import { db }             from "@/lib/db"
import { router }         from "../__internals/router"
import { privateProcedure, publicProcedure } from "../procedures"
import { HTTPException }  from "hono/http-exception"
import { z }              from "zod"

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

// Generates a short human-readable reference like DASE-20240301-AB12
function generateReference(): string {
  const date = new Date()
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("")
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DASE-${dateStr}-${rand}`
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
        // Verify user exists
        const user = await db.user.findUnique({
          where:  { id: ctx.user.id },
          select: { id: true },
        })
        if (!user) throw new HTTPException(404, { message: "User not found" })

        // Verify all products exist and are in stock
        const productIds = [...new Set(input.orderItems.map(i => i.productId))]
        const products   = await db.product.findMany({
          where:  { id: { in: productIds } },
          select: { id: true, inStock: true, price: true },
        })

        for (const item of input.orderItems) {
          const product = products.find(p => p.id === item.productId)
          if (!product)        throw new HTTPException(400, { message: `Product ${item.name} not found` })
          if (!product.inStock) throw new HTTPException(400, { message: `${item.name} is out of stock` })
        }

        // Generate unique reference (retry if collision)
        let referenceId = generateReference()
        let attempts    = 0
        while (attempts < 5) {
          const existing = await db.order.findUnique({ where: { referenceId } })
          if (!existing) break
          referenceId = generateReference()
          attempts++
        }

        // Create order with items in a transaction
        const order = await db.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              userId:         ctx.user.id,
              amount:         input.amount,
              currency:       input.currency,
              status:         "pending",
              deliveryStatus: "pending",
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
          include: {
            orderItems: true,
          },
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
            orderItems: true,
            user: { select: { id: true, name: true, email: true } },
          },
        })

        if (!order) throw new HTTPException(404, { message: "Order not found" })

        // Only the owner or admin can view
        const user = await db.user.findUnique({
          where:  { id: ctx.user.id },
          select: { role: true },
        })
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

  // ── Update order status (admin only) ─────────────────────────────────────
  updateOrderStatus: privateProcedure
    .input(z.object({
      id:             z.string(),
      status:         z.enum(["pending", "processing", "complete", "cancelled"]).optional(),
      deliveryStatus: z.enum(["pending", "dispatched", "delivered", "returned"]).optional(),
    }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const user = await db.user.findUnique({
          where:  { id: ctx.user.id },
          select: { role: true },
        })
        if (!user || user.role !== "ADMIN") {
          throw new HTTPException(403, { message: "Admin access required" })
        }

        const updated = await db.order.update({
          where: { id: input.id },
          data: {
            ...(input.status         && { status:         input.status         }),
            ...(input.deliveryStatus && { deliveryStatus: input.deliveryStatus }),
          },
        })

        return c.superjson({ success: true, message: "Order updated", order: updated })
      } catch (error) {
        console.error("Error updating order:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Failed to update order" })
      }
    }),
})