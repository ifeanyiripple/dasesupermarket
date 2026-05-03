import { redirect }    from "next/navigation"
import { notFound }    from "next/navigation"
import { currentRole } from "@/lib/auth"
import { db }          from "@/lib/db"
import OrderDetailClient from "@/components/admin/OrderDetailClient"

export const dynamic = "force-dynamic"

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date)  return obj.toISOString()
  if (Array.isArray(obj))   return obj.map(serialize)
  if (typeof obj === "object")
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]))
  return obj
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { referenceId: string }
}) {
  const role = await currentRole()
  if (role !== "ADMIN") redirect("/")

  const order = await db.order.findUnique({
    where:   { referenceId: params.referenceId },
    include: {
      user:          { select: { id: true, name: true, email: true, phoneNumber: true } },
      orderItems:    {
        include: {
          product: { include: { images: true } },
          food:    true,
        },
      },
      statusUpdates: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!order) notFound()

  return <OrderDetailClient order={serialize(order)} />
}