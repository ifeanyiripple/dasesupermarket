// app/api/fcm-token/route.ts
// Web push notification token — authenticated via next-auth session

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await req.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    await db.deviceToken.upsert({
      where: { token },
      update: {
        userId:    session.user.id,
        updatedAt: new Date(),
      },
      create: {
        userId:    session.user.id,
        token,
        platform:  "web",
        userAgent: req.headers.get("user-agent") ?? "unknown",
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[fcm-token POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { token } = body

    if (token) {
      // Delete specific token
      await db.deviceToken.deleteMany({
        where: { token, userId: session.user.id },
      })
    } else {
      // Delete ALL web tokens for this user (opt-out all browser tabs)
      await db.deviceToken.deleteMany({
        where: { userId: session.user.id, platform: "web" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[fcm-token DELETE]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}