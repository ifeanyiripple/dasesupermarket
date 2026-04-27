import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(req: NextRequest) {
  try {
    const header = req.headers.get("Authorization")
    if (!header?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Missing Bearer token" } },
        { status: 401, headers: CORS }
      )
    }

    const token   = header.split(" ")[1]
    const payload = await verifyMobileToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Invalid or expired token" } },
        { status: 401, headers: CORS }
      )
    }

    const user = await db.user.findUnique({
      where:  { id: payload.userId },
      select: {
        id: true, name: true, email: true, image: true,
        role: true, onboarded: true,
        isTwoFactorEnabled: true, emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 404, message: "User not found" } },
        { status: 404, headers: CORS }
      )
    }

    return NextResponse.json({ success: true, data: { user } }, { headers: CORS })
  } catch (err) {
    console.error("[mobile-auth/me]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}