// app/api/paystack/initialize/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amount,
      email,        // effectiveEmail from checkout — always present
      guestEmail,   // only set when not logged in; null for authenticated users
      items,
      addressId,
      address,
      phoneNumber,
      notes,
    } = body

    // ── Step 1: Resolve identity ──────────────────────────────────────────────
    // Priority: active session > guest email matching a real account > pure guest

    const session = await auth()

    let resolvedUserId:    string | null = session?.user?.id ?? null
    let resolvedGuestEmail: string | null = null
    let paystackEmail:      string        = email  // what we pass to Paystack

    if (!resolvedUserId && guestEmail) {
      const normalised = guestEmail.trim().toLowerCase()

      // Check if this guest email belongs to a registered account
      const matchedUser = await db.user.findUnique({
        where:  { email: normalised },
        select: { id: true, email: true },
      })

      if (matchedUser) {
        // Treat this order as a proper user order — not a guest order
        resolvedUserId     = matchedUser.id
        resolvedGuestEmail = null
        paystackEmail      = matchedUser.email!   // use the canonical account email
      } else {
        // True guest — no account found
        resolvedGuestEmail = normalised
        paystackEmail      = normalised
      }
    }

    // At minimum we must have either a userId or a guestEmail to proceed
    if (!resolvedUserId && !resolvedGuestEmail) {
      return NextResponse.json(
        { error: "A valid email address is required to place an order" },
        { status: 401 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    // ── Step 2: Resolve every cart item to a Product or Food row ─────────────

    type ResolvedItem = (typeof items)[number] & {
      _resolvedProductId: string | null
      _resolvedFoodId:    string | null
    }

    const resolvedItems: ResolvedItem[] = []

    for (const item of items) {
      // Client explicitly flagged as food
      if (item.foodId) {
        resolvedItems.push({
          ...item,
          _resolvedProductId: null,
          _resolvedFoodId:    item.foodId,
        })
        continue
      }

      if (item.productId) {
        // Try Product table first
        const product = await db.product.findUnique({
          where:  { id: item.productId },
          select: { id: true, name: true, inStock: true },
        })

        if (product) {
          if (!product.inStock) {
            return NextResponse.json(
              { error: `"${product.name}" is out of stock` },
              { status: 400 }
            )
          }
          resolvedItems.push({
            ...item,
            _resolvedProductId: item.productId,
            _resolvedFoodId:    null,
          })
          continue
        }

        // Fall back to Food table (handles mis-classified cart items)
        const food = await db.food.findUnique({
          where:  { id: item.productId },
          select: { id: true, name: true, inStock: true },
        })

        if (food) {
          if (!food.inStock) {
            return NextResponse.json(
              { error: `"${food.name}" is out of stock` },
              { status: 400 }
            )
          }
          resolvedItems.push({
            ...item,
            _resolvedProductId: null,
            _resolvedFoodId:    food.id,
          })
          continue
        }

        return NextResponse.json(
          { error: `Item not found: ${item.name} (id: ${item.productId})` },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `Item "${item.name}" is missing a productId or foodId` },
        { status: 400 }
      )
    }

    // ── Step 3: Validate explicitly-flagged food items ────────────────────────

    const explicitFoodIds = resolvedItems
      .filter(i => i.foodId && i._resolvedFoodId === i.foodId)
      .map(i => i.foodId as string)

    if (explicitFoodIds.length > 0) {
      const existingFoods = await db.food.findMany({
        where:  { id: { in: explicitFoodIds } },
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

    // ── Step 4: Create the order ──────────────────────────────────────────────

    const paymentReference = `PAY-${uuidv4()}`

  // Resolve a phone number — preference: address phone > passed phone > account phone
let resolvedPhone: string | null = phoneNumber || null
if (!resolvedPhone && resolvedUserId) {
  const accountUser = await db.user.findUnique({
    where:  { id: resolvedUserId },
    select: { phoneNumber: true },
  })
  resolvedPhone = accountUser?.phoneNumber ?? null
}

// Build the data object dynamically based on whether we have a userId
const orderData: any = {
  amount,
  currency:       "NGN",
  status:         "PENDING",
  deliveryStatus: "PENDING",
  referenceId:    paymentReference,
  addressId:      addressId  || null,
  address:        address    || null,
  phoneNumber:    resolvedPhone,
  notes:          notes      || null,
  orderItems: {
    create: resolvedItems.map(item => ({
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
}

// Only add user relation if we have a userId
if (resolvedUserId) {
  orderData.user = {
    connect: { id: resolvedUserId }
  }
}

// Always add guestEmail if it exists
if (resolvedGuestEmail) {
  orderData.guestEmail = resolvedGuestEmail
}

const order = await db.order.create({
  data: orderData,
  include: { orderItems: true },
})

    // const order = await db.order.create({
    //   data: {
    //     // userId is set for authenticated users AND guests whose email matched an account
    //     userId:     resolvedUserId,
    //     // guestEmail is only set for true guests (no matching account found)
    //     guestEmail: resolvedGuestEmail,
    //     amount,
    //     currency:       "NGN",
    //     status:         "PENDING",
    //     deliveryStatus: "PENDING",
    //     referenceId:    paymentReference,
    //     addressId:      addressId  || null,
    //     address:        address    || null,
    //     phoneNumber:    resolvedPhone,
    //     notes:          notes      || null,
    //     orderItems: {
    //       create: resolvedItems.map(item => ({
    //         productId:      item._resolvedProductId,
    //         foodId:         item._resolvedFoodId,
    //         name:           item.name,
    //         description:    item.description    || "",
    //         category:       item.category       || "",
    //         brand:          item.brand          || "",
    //         quantity:       item.quantity,
    //         price:          item.price,
    //         imageColor:     item.imageColor     || "default",
    //         imageColorCode: item.imageColorCode || "#000000",
    //         imageUrl:       item.imageUrl       || "",
    //       })),
    //     },
    //   },
    //   include: { orderItems: true },
    // })

    // ── Step 5: Initialize Paystack transaction ───────────────────────────────

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email:        paystackEmail,
        amount:       Math.round(amount * 100), // convert to kobo
        reference:    paymentReference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
        metadata: {
          source:      "dase_supermarket",
          orderId:     order.id,
          userId:      resolvedUserId,
          guestEmail:  resolvedGuestEmail,
          referenceId: paymentReference,
        },
      }),
    })

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      await db.order.update({
        where: { id: order.id },
        data:  { status: "FAILED" },
      })
      return NextResponse.json(
        { error: "Failed to initialize Paystack transaction" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success:    true,
      paymentUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference:  paymentReference,
      order,
    })
  } catch (err) {
    console.error("[paystack/initialize]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


// // app/api/paystack/initialize/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { db } from "@/lib/db"
// import { v4 as uuidv4 } from "uuid"
// import getCurrentUser from "@/actions/getCurrentUser"

// export async function POST(req: NextRequest) {
//   const user = await getCurrentUser()
//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   try {
//     const { amount, items, addressId, address, phoneNumber } = await req.json()

//     const userId = user.id

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "No items in order" }, { status: 400 })
//     }

//     // ── Step 1: Resolve every item to either a product or a food ──────────────
//     // The client sends { productId, foodId } but the category heuristic can be
//     // wrong (food categories are "Rice", "Chicken" etc, not "food").
//     // Strategy: trust foodId when present; for anything sent as productId, look
//     // it up in the Product table first, then fall back to the Food table.

//     type ResolvedItem = typeof items[number] & {
//       _resolvedProductId: string | null
//       _resolvedFoodId: string | null
//     }

//     const resolvedItems: ResolvedItem[] = []

//     for (const item of items) {
//       // Client explicitly flagged this as food
//       if (item.foodId) {
//         resolvedItems.push({ ...item, _resolvedProductId: null, _resolvedFoodId: item.foodId })
//         continue
//       }

//       // Client sent a productId — verify it exists in the Product table
//       if (item.productId) {
//         const product = await db.product.findUnique({
//           where: { id: item.productId },
//           select: { id: true, name: true, inStock: true },
//         })

//         if (product) {
//           if (!product.inStock) {
//             return NextResponse.json(
//               { error: `Product "${product.name}" is out of stock` },
//               { status: 400 }
//             )
//           }
//           resolvedItems.push({ ...item, _resolvedProductId: item.productId, _resolvedFoodId: null })
//           continue
//         }

//         // Not a product — try the Food table (handles mis-classified cart items)
//         const food = await db.food.findUnique({
//           where: { id: item.productId },
//           select: { id: true, name: true, inStock: true },
//         })

//         if (food) {
//           if (!food.inStock) {
//             return NextResponse.json(
//               { error: `"${food.name}" is out of stock` },
//               { status: 400 }
//             )
//           }
//           resolvedItems.push({ ...item, _resolvedProductId: null, _resolvedFoodId: food.id })
//           continue
//         }

//         // Found in neither table
//         return NextResponse.json(
//           { error: `Item not found: ${item.name} (id: ${item.productId})` },
//           { status: 400 }
//         )
//       }

//       // No id at all
//       return NextResponse.json(
//         { error: `Item "${item.name}" is missing a productId or foodId` },
//         { status: 400 }
//       )
//     }

//     // ── Step 2: Validate food items that were explicitly flagged ─────────────
//     const explicitFoodIds = resolvedItems
//       .filter(i => i.foodId && i._resolvedFoodId === i.foodId) // only the ones we didn't look up yet
//       .map(i => i.foodId as string)

//     if (explicitFoodIds.length > 0) {
//       const existingFoods = await db.food.findMany({
//         where: { id: { in: explicitFoodIds } },
//         select: { id: true, name: true, inStock: true },
//       })
//       const foodMap = new Map(existingFoods.map(f => [f.id, f]))

//       for (const id of explicitFoodIds) {
//         if (!foodMap.has(id)) {
//           return NextResponse.json({ error: `Food not found: ${id}` }, { status: 400 })
//         }
//         if (!foodMap.get(id)!.inStock) {
//           return NextResponse.json(
//             { error: `"${foodMap.get(id)!.name}" is out of stock` },
//             { status: 400 }
//           )
//         }
//       }
//     }

//   // asign guest email to identity so the API can resolve guest addresses


//     // ── Step 3: Create order ──────────────────────────────────────────────────
//     const paymentReference = `PAY-${uuidv4()}`

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
//           create: resolvedItems.map((item) => ({
//             productId:      item._resolvedProductId,
//             foodId:         item._resolvedFoodId,
//             name:           item.name,
//             description:    item.description    || "",
//             category:       item.category       || "",
//             brand:          item.brand          || "",
//             quantity:       item.quantity,
//             price:          item.price,
//             imageColor:     item.imageColor     || "default",
//             imageColorCode: item.imageColorCode || "#000000",
//             imageUrl:       item.imageUrl       || "",
//           })),
//         },
//       },
//       include: { orderItems: true },
//     })

//     // ── Step 4: Initialize Paystack ────────────────────────────────────────────
//     const response = await fetch("https://api.paystack.co/transaction/initialize", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email:        user.email,
//         amount:       Math.round(amount * 100), // kobo
//         reference:    paymentReference,
//         callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
//         metadata: {
//           source:      "dase_supermarket",
//           orderId:     order.id,
//           userId:      user.id,
//           referenceId: paymentReference,
//         },
//       }),
//     })

//     const data = await response.json()

//     if (!data.status) {
//       await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } })
//       return NextResponse.json(
//         { error: "Failed to initialize Paystack transaction" },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json({
//       success:    true,
//       paymentUrl: data.data.authorization_url,
//       accessCode: data.data.access_code,
//       reference:  paymentReference,
//       order,
//     })
//   } catch (err) {
//     console.error("Paystack initialization error:", err)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


