// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import getCurrentUser from "@/actions/getCurrentUser"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { amount, items, addressId, address, phoneNumber } = await req.json()

    const userId = user.id

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    // ── Step 1: Resolve every item to either a product or a food ──────────────
    // The client sends { productId, foodId } but the category heuristic can be
    // wrong (food categories are "Rice", "Chicken" etc, not "food").
    // Strategy: trust foodId when present; for anything sent as productId, look
    // it up in the Product table first, then fall back to the Food table.

    type ResolvedItem = typeof items[number] & {
      _resolvedProductId: string | null
      _resolvedFoodId: string | null
    }

    const resolvedItems: ResolvedItem[] = []

    for (const item of items) {
      // Client explicitly flagged this as food
      if (item.foodId) {
        resolvedItems.push({ ...item, _resolvedProductId: null, _resolvedFoodId: item.foodId })
        continue
      }

      // Client sent a productId — verify it exists in the Product table
      if (item.productId) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, inStock: true },
        })

        if (product) {
          if (!product.inStock) {
            return NextResponse.json(
              { error: `Product "${product.name}" is out of stock` },
              { status: 400 }
            )
          }
          resolvedItems.push({ ...item, _resolvedProductId: item.productId, _resolvedFoodId: null })
          continue
        }

        // Not a product — try the Food table (handles mis-classified cart items)
        const food = await db.food.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, inStock: true },
        })

        if (food) {
          if (!food.inStock) {
            return NextResponse.json(
              { error: `"${food.name}" is out of stock` },
              { status: 400 }
            )
          }
          resolvedItems.push({ ...item, _resolvedProductId: null, _resolvedFoodId: food.id })
          continue
        }

        // Found in neither table
        return NextResponse.json(
          { error: `Item not found: ${item.name} (id: ${item.productId})` },
          { status: 400 }
        )
      }

      // No id at all
      return NextResponse.json(
        { error: `Item "${item.name}" is missing a productId or foodId` },
        { status: 400 }
      )
    }

    // ── Step 2: Validate food items that were explicitly flagged ─────────────
    const explicitFoodIds = resolvedItems
      .filter(i => i.foodId && i._resolvedFoodId === i.foodId) // only the ones we didn't look up yet
      .map(i => i.foodId as string)

    if (explicitFoodIds.length > 0) {
      const existingFoods = await db.food.findMany({
        where: { id: { in: explicitFoodIds } },
        select: { id: true, name: true, inStock: true },
      })
      const foodMap = new Map(existingFoods.map(f => [f.id, f]))

      for (const id of explicitFoodIds) {
        if (!foodMap.has(id)) {
          return NextResponse.json({ error: `Food not found: ${id}` }, { status: 400 })
        }
        if (!foodMap.get(id)!.inStock) {
          return NextResponse.json(
            { error: `"${foodMap.get(id)!.name}" is out of stock` },
            { status: 400 }
          )
        }
      }
    }

    // ── Step 3: Create order ──────────────────────────────────────────────────
    const paymentReference = `PAY-${uuidv4()}`

    const order = await db.order.create({
      data: {
        userId,
        amount,
        currency: "NGN",
        status: "PENDING",
        addressId: addressId || null,
        deliveryStatus: "PENDING",
        referenceId: paymentReference,
        address: address || null,
        phoneNumber: phoneNumber || user.phonenumber || null,
        orderItems: {
          create: resolvedItems.map((item) => ({
            productId:      item._resolvedProductId,
            foodId:         item._resolvedFoodId,
            name:           item.name,
            description:    item.description    || "",
            category:       item.category       || "",
            brand:          item.brand          || "",
            quantity:       item.quantity,
            price:          item.price,
            imageColor:     item.imageColor     || "default",
            imageColorCode: item.imageColorCode || "#000000",
            imageUrl:       item.imageUrl       || "",
          })),
        },
      },
      include: { orderItems: true },
    })

    // ── Step 4: Initialize Paystack ────────────────────────────────────────────
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email:        user.email,
        amount:       Math.round(amount * 100), // kobo
        reference:    paymentReference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
        metadata: {
          source:      "dase_supermarket",
          orderId:     order.id,
          userId:      user.id,
          referenceId: paymentReference,
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } })
      return NextResponse.json(
        { error: "Failed to initialize Paystack transaction" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success:    true,
      paymentUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference:  paymentReference,
      order,
    })
  } catch (err) {
    console.error("Paystack initialization error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





// // app/api/paystack/initialize/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { db } from "@/lib/db" 
// import { v4 as uuidv4 } from "uuid"
// import getCurrentUser from "@/actions/getCurrentUser"

// export async function POST(req: NextRequest) {
//   const user = await getCurrentUser();
//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
  
//   try {
//     const { amount, items, addressId, address, phoneNumber } = await req.json()

//     const userId = user.id

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

   
// // ── Pre-flight: validate all productIds against both Product and Food ──
// const productIds: string[] = items.map((item: any) => item.productId)

// if (productIds.some((id) => !id)) {
//   return NextResponse.json(
//     { error: "One or more items are missing a productId" },
//     { status: 400 }
//   )
// }

// const [existingProducts, existingFoods] = await Promise.all([
//   db.product.findMany({ where: { id: { in: productIds } }, select: { id: true } }),
//   db.food.findMany({ where: { id: { in: productIds } }, select: { id: true } }),
// ])

// const validIds = new Set([
//   ...existingProducts.map((p) => p.id),
//   ...existingFoods.map((f) => f.id),
// ])

// const missingIds = productIds.filter((id) => !validIds.has(id))

// if (missingIds.length > 0) {
//   return NextResponse.json(
//     { error: `Items not found: ${missingIds.join(", ")}` },
//     { status: 400 }
//   )
// }
//     // ────────────────────────────────────────────────────────────────

//     // Generate payment reference
//     const paymentReference = `PAY-${uuidv4()}`

//     // Create Order in DB before redirecting to Paystack
//     const order = await db.order.create({
//       data: {
//         userId,
//         amount,
//         currency: "NGN",
//         status: "PENDING",
//         addressId: addressId || null,
//         deliveryStatus: "PENDING",
//         referenceId: paymentReference,
//         address: address || null,
//         phoneNumber: phoneNumber || user.phonenumber || null,
//         orderItems: {
//           create: items.map((item: any) => ({
//             productId: item.productId,
//             name: item.name,
//             description: item.description || "",
//             category: item.category || "",
//             brand: item.brand || "",
//             quantity: item.quantity,
//             price: item.price,
//             imageColor: item.imageColor || "default",
//             imageColorCode: item.imageColorCode || "#000000",
//             imageUrl: item.imageUrl || "",
//           }))
//         }
//       },
//       include: {
//         orderItems: true
//       }
//     })

//     // Call Paystack initialize
//     const response = await fetch("https://api.paystack.co/transaction/initialize", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: user?.email, 
//         amount: Math.round(amount * 100), // Paystack expects kobo
//         reference: paymentReference,
//         callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
//         metadata: {
//           orderId: order.id,
//           userId: user.id,
//           referenceId: paymentReference
//         }
//       }),
//     })

//     const data = await response.json()

//     if (!data.status) {
//       // Update order status to FAILED if Paystack initialization fails
//       await db.order.update({
//         where: { id: order.id },
//         data: { status: "FAILED" }
//       })
      
//       return NextResponse.json(
//         { error: "Failed to initialize Paystack transaction" },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       paymentUrl: data.data.authorization_url,
//       accessCode: data.data.access_code,
//       reference: paymentReference,
//       order: order
//     })
    
//   } catch (err) {
//     console.error("Paystack initialization error:", err)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }