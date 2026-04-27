// app/api/user/phone/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"
import { z } from "zod"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const PhoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+234[789][01]\d{8}$/,
      "Must be a valid Nigerian number in +234XXXXXXXXXX format"
    ),
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function PATCH(req: NextRequest) {
  try {
    // ── Resolve user ID from either session (web) or Bearer token (mobile) ──
    let userId: string | null = null

    const authHeader = req.headers.get("Authorization")

    if (authHeader?.startsWith("Bearer ")) {
      // Mobile path — verify JWT
      const token   = authHeader.split(" ")[1]
      const payload = await verifyMobileToken(token)
      if (!payload) {
        return NextResponse.json(
          { success: false, error: { code: 401, message: "Invalid or expired token" } },
          { status: 401, headers: CORS }
        )
      }
      userId = payload.userId
    } else {
      // Web path — verify Next-Auth session (no token needed)
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: { code: 401, message: "Unauthorized" } },
          { status: 401, headers: CORS }
        )
      }
      userId = session.user.id
    }

    // ── Validate body ──────────────────────────────────────────────────────
    const body   = await req.json()
    const parsed = PhoneSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 400, message: parsed.error.issues[0].message } },
        { status: 400, headers: CORS }
      )
    }

    // ── Confirm user exists ────────────────────────────────────────────────
    const existing = await db.user.findUnique({
      where:  { id: userId },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 404, message: "User not found" } },
        { status: 404, headers: CORS }
      )
    }

    // ── Update phone number ────────────────────────────────────────────────
    const updated = await db.user.update({
      where:  { id: userId },
      data:   { phoneNumber: parsed.data.phone },
      select: { id: true, phoneNumber: true },
    })

    return NextResponse.json(
      { success: true, data: { phoneNumber: updated.phoneNumber } },
      { status: 200, headers: CORS }
    )
  } catch (err) {
    console.error("[user/phone PATCH]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}