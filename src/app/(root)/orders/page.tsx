"use client"
// app/orders/page.tsx

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag, ArrowLeft, ArrowRight, Package,
  Clock, CheckCircle2, XCircle, Truck, RefreshCw,
  ChevronRight, CalendarDays,
} from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatPrice } from "@/components/ProductCard"
import Navbar from "@/components/layout/Navbar"

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id:             string
  name:           string
  quantity:       number
  price:          number
  imageUrl:       string
  imageColor:     string
  imageColorCode: string
  category:       string
  brand:          string
}

interface Order {
  id:             string
  amount:         number
  currency:       string
  status:         string
  deliveryStatus: string
  createDate:     string
  referenceId:    string
  address:        string | null
  phoneNumber:    string | null
  orderItems:     OrderItem[]
}

// ── Status config ─────────────────────────────────────────────────────────────
const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  SUCCESS: { label: "Paid",    color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: Clock         },
  FAILED:  { label: "Failed",  color: "#dc2626", bg: "#fee2e2", icon: XCircle       },
}

const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Processing",  color: "#d97706", bg: "#fef3c7" },
  CONFIRMED: { label: "Confirmed",   color: "#2563eb", bg: "#dbeafe" },
  SHIPPED:   { label: "Shipped",     color: "#7c3aed", bg: "#ede9fe" },
  DELIVERED: { label: "Delivered",   color: "#16a34a", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled",   color: "#dc2626", bg: "#fee2e2" },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  })
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order, theme }: { order: Order; theme: any }) {
  const payment  = PAYMENT_STATUS[order.status]  ?? PAYMENT_STATUS.PENDING
  const delivery = DELIVERY_STATUS[order.deliveryStatus] ?? DELIVERY_STATUS.PENDING
  const PayIcon  = payment.icon
  const previewItems = order.orderItems.slice(0, 3)
  const extra        = order.orderItems.length - 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/orders/${order.id}`}>
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4
                     hover:shadow-md hover:border-gray-200 transition-all group"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium">Order</span>
              <span className="text-sm font-bold text-gray-700 tracking-wide">
                #{order.referenceId.replace("PAY-", "").slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Payment badge */}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ color: payment.color, backgroundColor: payment.bg }}
              >
                <PayIcon size={11} />
                {payment.label}
              </span>

              {/* Delivery badge */}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ color: delivery.color, backgroundColor: delivery.bg }}
              >
                <Truck size={11} />
                {delivery.label}
              </span>
            </div>
          </div>

          {/* Item previews */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {previewItems.map((item, i) => (
                <div
                  key={item.id}
                  className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0"
                  style={{ zIndex: previewItems.length - i }}
                >
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
                </div>
              ))}
              {extra > 0 && (
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-sm flex items-center justify-center
                             text-xs font-bold text-gray-500 flex-shrink-0"
                  style={{ backgroundColor: theme.primaryLight, zIndex: 0 }}
                >
                  +{extra}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 line-clamp-1">
                {order.orderItems.map(i => i.name).join(", ")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.orderItems.reduce((s, i) => s + i.quantity, 0)} item
                {order.orderItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays size={12} />
              {formatDate(order.createDate)}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base font-extrabold" style={{ color: theme.primary }}>
                {formatPrice(order.amount)}
              </span>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ORDERS PAGE ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function OrdersPage() {
  const { theme } = useTheme()
  const user      = useCurrentUser()
  const router    = useRouter()

  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [page,    setPage]    = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!user) { router.push("/auth/login?callbackUrl=/orders"); return }
    fetchOrders(page)
  }, [user, page])

  async function fetchOrders(p: number) {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch(`/api/orders?page=${p}&limit=10`)
      const json = await res.json()

      if (!json.success) throw new Error(json.error?.message ?? "Failed to load orders")

      setOrders(json.data.orders)
      setTotalPages(json.data.pagination.totalPages)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-8 w-full">
          <div className="h-8 w-40 rounded-xl bg-gray-200 animate-pulse mb-6" />
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Package size={40} style={{ color: theme.primaryBorder }} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">No orders yet</h1>
            <p className="text-gray-400 text-sm">
              You haven&apos;t placed any orders. Start shopping and your orders will appear here.
            </p>
            <Link
              href="/shop"
              className="flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-bold text-sm shadow-lg"
              style={{ backgroundColor: theme.primary, boxShadow: `0 8px 20px ${theme.primary}30` }}
            >
              <ShoppingBag size={16} /> Browse Products
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">My Orders</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track and review your purchases</p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Order list */}
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} theme={theme} />
            ))}
          </div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center
                         text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={15} />
            </button>

            <span className="text-sm text-gray-500">
              Page <span className="font-bold text-gray-800">{page}</span> of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center
                         text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}