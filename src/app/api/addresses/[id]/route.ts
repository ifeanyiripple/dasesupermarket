// ═══════════════════════════════════════════════════════════════
// FILE 2: app/api/addresses/[id]/route.ts
// ═══════════════════════════════════════════════════════════════


import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const UpdateSchema = z.object({
  label:       z.string().optional(),
  fullName:    z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  state:       z.string().min(1).optional(),
  lga:         z.string().min(1).optional(),
  town:        z.string().min(1).optional(),
  street:      z.string().optional(),
  isDefault:   z.boolean().optional(),
  latitude:         z.number().optional(),          // ← new
  longitude:        z.number().optional(),          // ← new
  formattedAddress: z.string().optional(),          // ← new
  placeId:          z.string().optional(), 
})

// ── Shared auth helper — works for both web session and mobile JWT ──────────
async function resolveUserId(req: NextRequest): Promise<string | null> {
  // 1. Try NextAuth session (web browser users)
  const session = await auth()
  if (session?.user?.id) return session.user.id

  // 2. Fall back to mobile JWT (Expo app users)
  const header = req.headers.get("Authorization")
  if (header?.startsWith("Bearer ")) {
    const payload = await verifyMobileToken(header.split(" ")[1])
    if (payload?.userId) return payload.userId
  }

  return null
}

// PATCH /api/addresses/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    // Confirm the address belongs to this user
    const existing = await db.address.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    const body   = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const data = parsed.data

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: userId },
        data:  { isDefault: false },
      })
    }

    const updated = await db.address.update({
      where: { id: id },
      data,
    })

    return NextResponse.json({ success: true, address: updated })
  } catch (err) {
    console.error("[addresses PATCH]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE /api/addresses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(_req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.address.deleteMany({
      where: { id, userId: userId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[addresses DELETE]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

