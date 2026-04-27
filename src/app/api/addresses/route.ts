
// ═══════════════════════════════════════════════════════════════
// FILE 1: app/api/addresses/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const AddressSchema = z.object({
  label:       z.string().optional(),
  fullName:    z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  state:       z.string().min(1, "State is required"),
  lga:         z.string().min(1, "LGA is required"),
  town:        z.string().min(1, "Town is required"),
  street:      z.string().optional(),
  isDefault:   z.boolean().optional().default(false),
})

// GET /api/addresses — list all addresses for the signed-in user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addresses = await db.address.findMany({
      where:   { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true, label: true, fullName: true, phoneNumber: true,
        state: true, lga: true, town: true, street: true,
        isDefault: true, createdAt: true,
      },
    })

    return NextResponse.json({ success: true, addresses })
  } catch (err) {
    console.error("[addresses GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST /api/addresses — create a new address
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body   = await req.json()
    const parsed = AddressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const data = parsed.data

    // If this is the default address, clear existing defaults first
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data:  { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    })

    return NextResponse.json({ success: true, address }, { status: 201 })
  } catch (err) {
    console.error("[addresses POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
