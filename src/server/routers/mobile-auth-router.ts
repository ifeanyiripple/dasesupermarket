import { Hono } from "hono"
import { db } from "@/lib/db"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

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
  code:     z.string().optional(),
})

const RegisterSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8),
  phone:    z.string().optional(),
})

export const mobileAuthRouter = new Hono()

  .post("/login", async (c) => {
    const body   = await c.req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({ success: false, error: { message: "Invalid input" } }, 400)
    }

    const { email, password } = parsed.data

    const user = await db.user.findUnique({
      where:  { email },
      select: {
        id: true, name: true, email: true,
        password: true, role: true,
        emailVerified: true, isTwoFactorEnabled: true,
        onboarded: true,
      },
    })

    if (!user || !user.password) {
      return c.json({ success: false, error: { message: "Invalid credentials" } }, 401)
    }

    if (!user.emailVerified) {
      return c.json(
        { success: false, error: { code: 403, message: "Please verify your email before logging in" } },
        403
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return c.json({ success: false, error: { message: "Invalid credentials" } }, 401)
    }

    const token = await signMobileToken(user.id)

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id:                 user.id,
          name:               user.name,
          email:              user.email,
          role:               user.role,
          onboarded:          user.onboarded,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          emailVerified:      user.emailVerified?.toISOString() ?? null,
        },
      },
    })
  })

  .post("/register", async (c) => {
    const body   = await c.req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({ success: false, error: { message: "Invalid input" } }, 400)
    }

    const { name, email, password } = parsed.data

    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      return c.json(
        { success: false, error: { message: "An account with this email already exists" } },
        409
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await db.user.create({
      data: { name, email, password: hashed },
    })

    // TODO: trigger your existing email verification flow here

    return c.json({
      success: true,
      data: { userId: user.id, message: "Account created. Please verify your email." },
    })
  })

  .get("/me", async (c) => {
    const header = c.req.header("Authorization")
    if (!header?.startsWith("Bearer ")) {
      return c.json({ success: false, error: { message: "Missing Bearer token" } }, 401)
    }

    const token   = header.split(" ")[1]
    const payload = await verifyMobileToken(token)
    if (!payload) {
      return c.json({ success: false, error: { message: "Invalid or expired token" } }, 401)
    }

    const user = await db.user.findUnique({
      where:  { id: payload.userId },
      select: {
        id: true, name: true, email: true,
        role: true, onboarded: true,
        isTwoFactorEnabled: true, emailVerified: true,
      },
    })

    if (!user) {
      return c.json({ success: false, error: { message: "User not found" } }, 404)
    }

    return c.json({ success: true, data: { user } })
  })