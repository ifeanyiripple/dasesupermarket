import { db } from "@/lib/db"
import { j } from "./__internals/j"
import { HTTPException } from "hono/http-exception"
import getCurrentUser from "@/actions/getCurrentUser"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const authMiddleware = j.middleware(async ({ c, next }) => {
  const authHeader = c.req.header("Authorization")

  const auth = await getCurrentUser()

  if (!auth) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  const user = await db.user.findUnique({
    where: { id: auth.id },
  })

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  return next({ user })
})


// ── NEW: middleware for the Expo mobile app ───────────────────────────────────
const mobileAuthMiddleware = j.middleware(async ({ c, next }) => {
  const header = c.req.header("Authorization")
  if (!header?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing Bearer token" })
  }

  const token   = header.split(" ")[1]
  const payload = await verifyMobileToken(token)
  if (!payload) {
    throw new HTTPException(401, { message: "Invalid or expired token" })
  }

  const user = await db.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    throw new HTTPException(401, { message: "User not found" })
  }

  return next({ user })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const baseProcedure = j.procedure
export const publicProcedure = baseProcedure
export const privateProcedure = publicProcedure.use(authMiddleware)
export const mobileProcedure  = publicProcedure.use(mobileAuthMiddleware)  

