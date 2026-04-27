import { db } from "@/lib/db"
import { HTTPException } from "hono/http-exception"
import { router } from "../__internals/router"
import { publicProcedure } from "../procedures"
import getCurrentUser from "@/actions/getCurrentUser"

export const dynamic = "force-dynamic"

export const authRouter = router({
  getDatabaseSyncStatus: publicProcedure.query(async ({ c, ctx }) => {
    

    const auth = await getCurrentUser()
       if (!auth) {
         return c.json({ isSynced: false })
       }
     
       const user = await db.user.findUnique({
         where: { id: auth.id },
       })

    console.log('USER IN DB:', user);

    if (!user) {
      await db.user.create({
        data: {
          id: auth.id,
        },
      })
    }

    return c.json({ isSynced: true })
  }),
})

// route.ts
