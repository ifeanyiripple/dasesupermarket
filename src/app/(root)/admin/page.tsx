// app/admin/page.tsx

import { redirect }     from "next/navigation"
import { currentRole }  from "@/lib/auth"
import { db }           from "@/lib/db"
import AdminDashboardClient from "@/components/admin/Admindashboardclient"

export const metadata = { title: "Admin — DASE Supermarket" }
export const dynamic  = "force-dynamic"

// Recursively serialize Dates → ISO strings for the server→client boundary
function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date)  return obj.toISOString()
  if (Array.isArray(obj))   return obj.map(serialize)
  if (typeof obj === "object")
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]))
  return obj
}

export default async function AdminPage() {
  const role = await currentRole()
  if (role !== "ADMIN") redirect("/")

  const [products, orders, users] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images:     true,
        reviews:    { include: { user: { select: { id: true, name: true, image: true } } } },
        orderItems: true,
        _count:     { select: { reviews: true, orderItems: true } },
      },
    }),

    db.order.findMany({
      orderBy: { createDate: "desc" },
      include: {
        user:       { select: { id: true, name: true, email: true } },
        orderItems: true,
      },
    }),

    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reviews: { select: { id: true } },
        orders:  { select: { id: true, amount: true, status: true } },
      },
    }),
  ])

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue     = orders.filter(o => o.status === "complete").reduce((s, o) => s + o.amount, 0)
  const pendingOrders    = orders.filter(o => o.status === "pending").length
  const completedOrders  = orders.filter(o => o.status === "complete").length
  const inStockProducts  = products.filter(p => p.inStock).length
  const featuredProducts = products.filter(p => p.isFeatured).length

  // Avg rating per product
  const productsWithRating = products.map(p => {
    const ratings = p.reviews.map(r => r.rating)
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    return { ...p, avgRating: Math.round(avg * 10) / 10, reviewCount: ratings.length }
  })

  const stats = {
    totalProducts:    products.length,
    inStockProducts,
    featuredProducts,
    totalOrders:      orders.length,
    pendingOrders,
    completedOrders,
    totalRevenue,
    totalUsers:       users.length,
    totalReviews:     products.reduce((s, p) => s + p._count.reviews, 0),
  }

  return (
    <AdminDashboardClient
      data={serialize({ products: productsWithRating, orders, users, stats })}
    />
  )
}