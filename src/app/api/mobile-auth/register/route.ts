import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const RegisterSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8),
  phone:    z.string().optional(),
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
    { success: false, error: { code: 405, message: "Use POST to register" } },
    { status: 405, headers: CORS }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 400, message: "Invalid input" } },
        { status: 400, headers: CORS }
      )
    }

    const { name, email, password } = parsed.data

    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json(
        { success: false, error: { code: 409, message: "An account with this email already exists" } },
        { status: 409, headers: CORS }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await db.user.create({
      data:   { name, email, password: hashed },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          userId:  user.id,
          message: "Account created. Please verify your email.",
        },
      },
      { status: 201, headers: CORS }
    )
  } catch (err) {
    console.error("[mobile-auth/register]", err)
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Server error" } },
      { status: 500, headers: CORS }
    )
  }
}