// app/api/mobile-auth/push-token/route.ts
// Mobile Expo push token — authenticated via mobile JWT (MOBILE_JWT_SECRET)

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// ─── Shared auth helper ────────────────────────────────────────────────────────

async function getUserId(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("Authorization")
  if (!header?.startsWith("Bearer ")) return null
  const token   = header.split(" ")[1]
  const payload = await verifyMobileToken(token)
  return payload?.userId ?? null
}

// ─── GET — check if a specific token already exists for this user ─────────────

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Unauthorized" } },
        { status: 401, headers: CORS }
      )
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 400, message: "token query param required" } },
        { status: 400, headers: CORS }
      )
    }

    const existing = await db.deviceToken.findFirst({
      where: { token, userId },
      select: { id: true },
    })

    return NextResponse.json(
      { success: true, hasToken: !!existing },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[push-token GET]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}

// ─── POST — register / upsert a push token ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Unauthorized" } },
        { status: 401, headers: CORS }
      )
    }

    const body = await req.json()
    const { token, platform } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: { code: 400, message: "token is required" } },
        { status: 400, headers: CORS }
      )
    }

    await db.deviceToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform:  platform ?? "unknown", // 'ios' | 'android'
      },
      update: {
        userId,
        platform:  platform ?? "unknown",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      { success: true, message: "Token registered" },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[push-token POST]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}

// ─── DELETE — remove a push token (user disabled notifications) ───────────────

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Unauthorized" } },
        { status: 401, headers: CORS }
      )
    }

    const body  = await req.json().catch(() => ({}))
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: { code: 400, message: "token is required" } },
        { status: 400, headers: CORS }
      )
    }

    await db.deviceToken.deleteMany({
      where: { token, userId },
    })

    return NextResponse.json(
      { success: true, message: "Token removed" },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[push-token DELETE]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}