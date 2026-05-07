import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

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

const AddressSchema = z.object({
  label:       z.string().optional(),
  fullName:    z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  state:       z.string().min(1, "State is required"),
  lga:         z.string().min(1, "LGA is required"),
  town:        z.string().min(1, "Town is required"),
  street:      z.string().optional(),
  isDefault:   z.boolean().optional().default(false),
  latitude:         z.number().optional(),          // ← new
  longitude:        z.number().optional(),          // ← new
  formattedAddress: z.string().optional(),          // ← new
  placeId:          z.string().optional(), 
})

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

    const addresses = await db.address.findMany({
      where:   { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true, label: true, fullName: true, phoneNumber: true,
        state: true, lga: true, town: true, street: true,
        isDefault: true, createdAt: true,
      },
    })

    return NextResponse.json({ success: true, addresses }, { headers: CORS })
  } catch (err) {
    console.error("[addresses GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

    const body   = await req.json()
    const parsed = AddressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400, headers: CORS })
    }

    const data = parsed.data

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId },
        data:  { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: { userId, ...data },
    })

    return NextResponse.json({ success: true, address }, { status: 201, headers: CORS })
  } catch (err) {
    console.error("[addresses POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}