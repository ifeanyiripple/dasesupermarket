import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { SignJWT } from "jose"
import { z } from "zod"

const JWT_SECRET = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET!)

async function signMobileToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)
}

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: { code: 405, message: "Use POST to login" } },
    { status: 405, headers: CORS }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 400, message: "Invalid input" } },
        { status: 400, headers: CORS }
      )
    }

    const { email, password } = parsed.data

    const user = await db.user.findUnique({
      where:  { email },
      select: {
        id: true, name: true, email: true, image: true,
        password: true, role: true,
        emailVerified: true, isTwoFactorEnabled: true,
        onboarded: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Invalid credentials" } },
        { status: 401, headers: CORS }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: { code: 403, message: "Please verify your email before logging in" } },
        { status: 403, headers: CORS }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: 401, message: "Invalid credentials" } },
        { status: 401, headers: CORS }
      )
    }

    const token = await signMobileToken(user.id)

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id:                 user.id,
            name:               user.name,
            email:              user.email,
            image:              user.image,
            role:               user.role,
            onboarded:          user.onboarded,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            emailVerified:      user.emailVerified?.toISOString() ?? null,
          },
        },
      },
      { headers: CORS }
    )
  } catch (err) {
    console.error("[mobile-auth/login]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}