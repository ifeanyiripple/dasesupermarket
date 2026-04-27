"use client"
// app/orders/[orderId]/page.tsx

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft, Package, MapPin, Phone, Hash,
  CalendarDays, CheckCircle2, Clock, XCircle,
  Truck, CreditCard, ShoppingBag, AlertCircle,
} from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatPrice } from "@/components/ProductCard"
import Navbar from "@/components/layout/Navbar"

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id:             string
  name:           string
  description:    string
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
const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2; desc: string }> = {
  SUCCESS: { label: "Payment Successful", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2, desc: "Your payment was received successfully." },
  PENDING: { label: "Payment Pending",    color: "#d97706", bg: "#fef3c7", icon: Clock,        desc: "We are awaiting payment confirmation."  },
  FAILED:  { label: "Payment Failed",     color: "#dc2626", bg: "#fee2e2", icon: XCircle,      desc: "The payment for this order was unsuccessful." },
}

const DELIVERY_STEPS = [
  { key: "PENDING",   label: "Order Placed"  },
  { key: "CONFIRMED", label: "Confirmed"     },
  { key: "SHIPPED",   label: "Shipped"       },
  { key: "DELIVERED", label: "Delivered"     },
]

const DELIVERY_INDEX: Record<string, number> = {
  PENDING:   0,
  CONFIRMED: 1,
  SHIPPED:   2,
  DELIVERED: 3,
  CANCELLED: -1,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-NG", {
    hour:   "2-digit",
    minute: "2-digit",
  })
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string
  icon:  React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-gray-400" />
        <h2 className="font-extrabold text-gray-800 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Delivery tracker ──────────────────────────────────────────────────────────
function DeliveryTracker({ status, theme }: { status: string; theme: any }) {
  const currentIdx  = DELIVERY_INDEX[status] ?? 0
  const isCancelled = status === "CANCELLED"

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
        <XCircle size={14} className="text-red-500" />
        <span className="text-sm font-semibold text-red-600">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0">
      {DELIVERY_STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        const last    = i === DELIVERY_STEPS.length - 1

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0"
                style={{
                  backgroundColor: done ? theme.primary : "#f3f4f6",
                  borderColor:     done ? theme.primary : "#e5e7eb",
                  boxShadow:       current ? `0 0 0 4px ${theme.primary}25` : "none",
                }}
              >
                {done
                  ? <CheckCircle2 size={13} color="white" />
                  : <div className="w-2 h-2 rounded-full bg-gray-300" />
                }
              </div>
              <span
                className="text-[10px] font-semibold text-center leading-tight whitespace-nowrap"
                style={{ color: done ? theme.primary : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!last && (
              <div
                className="flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all"
                style={{ backgroundColor: i < currentIdx ? theme.primary : "#e5e7eb" }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ORDER DETAIL PAGE ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default  function OrderDetailPage() {
  const { theme } = useTheme()
  const user      = useCurrentUser()
  const router    = useRouter()
  const params    = useParams()
  const orderId   = params?.orderId as string

  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    if (!user) { router.push("/auth/login?callbackUrl=/orders"); return }
    if (!orderId) return
    fetchOrder()
  }, [user, orderId])

  async function fetchOrder() {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch(`/api/orders/${orderId}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message ?? "Order not found")
      setOrder(json.data.order)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-4">
          <div className="h-6 w-32 rounded-xl bg-gray-200 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </main>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800">Order not found</h2>
            <p className="text-sm text-gray-400">{error || "This order doesn't exist or you don't have access to it."}</p>
            <Link
              href="/orders"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowLeft size={15} /> Back to Orders
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const payment     = PAYMENT_STATUS[order.status] ?? PAYMENT_STATUS.PENDING
  const PayIcon     = payment.icon
  const subtotal    = order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQty    = order.orderItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Back */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* ── Payment status banner ──────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{ backgroundColor: payment.bg }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${payment.color}20` }}
            >
              <PayIcon size={20} style={{ color: payment.color }} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-gray-800">{payment.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{payment.desc}</p>
            </div>
            <span
              className="text-lg font-extrabold flex-shrink-0"
              style={{ color: theme.primary }}
            >
              {formatPrice(order.amount)}
            </span>
          </div>

          {/* ── Order meta ─────────────────────────────────────────────── */}
          <Section title="Order Details" icon={Hash}>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Reference</p>
                <p className="font-bold text-gray-700 text-xs tracking-widest">
                  {order.referenceId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="font-bold text-gray-700 text-xs">
                  {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                  <CalendarDays size={10} /> Date Placed
                </p>
                <p className="font-semibold text-gray-700 text-xs">{formatDate(order.createDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Time</p>
                <p className="font-semibold text-gray-700 text-xs">{formatTime(order.createDate)}</p>
              </div>
            </div>
          </Section>

          {/* ── Delivery tracker ───────────────────────────────────────── */}
          <Section title="Delivery Status" icon={Truck}>
            <DeliveryTracker status={order.deliveryStatus} theme={theme} />
          </Section>

          {/* ── Delivery info ───────────────────────────────────────────── */}
          <Section title="Delivery Information" icon={MapPin}>
            {order.address ? (
              <div className="flex flex-col gap-3">
                {/* Address — read-only */}
                <div
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}15` }}
                  >
                    <MapPin size={14} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                    <p className="text-sm font-semibold text-gray-700 leading-snug">
                      {order.address}
                    </p>
                  </div>
                </div>

                {/* Phone — read-only */}
                {order.phoneNumber && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${theme.primary}15` }}
                    >
                      <Phone size={14} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Contact Number</p>
                      <p className="text-sm font-semibold text-gray-700">{order.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Delivery details cannot be changed once an order is placed.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No delivery address recorded.</p>
            )}
          </Section>

          {/* ── Order items ─────────────────────────────────────────────── */}
          <Section title={`Items Ordered (${totalQty})`} icon={ShoppingBag}>
            <div className="flex flex-col divide-y divide-gray-50">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Image */}
                  <div
                    className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                          style={{ backgroundColor: item.imageColorCode }}
                        />
                        <span className="text-xs text-gray-400">{item.imageColor}</span>
                        {item.brand && <span className="text-xs text-gray-400">· {item.brand}</span>}
                        <span className="text-xs text-gray-300">· {item.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">Qty: <span className="font-bold text-gray-600">{item.quantity}</span></span>
                      <span className="text-sm font-extrabold" style={{ color: theme.primary }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Price summary ───────────────────────────────────────────── */}
          <Section title="Price Summary" icon={CreditCard}>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({totalQty} item{totalQty !== 1 ? "s" : ""})</span>
                <span className="font-semibold text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              {order.amount !== subtotal && (
                <div className="flex justify-between text-gray-500">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-gray-700">
                    {order.amount - subtotal <= 0 ? (
                      <span style={{ color: theme.primary }}>Free 🎉</span>
                    ) : (
                      formatPrice(order.amount - subtotal)
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-base">
                <span>Total Paid</span>
                <span style={{ color: theme.primary }}>{formatPrice(order.amount)}</span>
              </div>
              <p className="text-xs text-gray-400">Currency: {order.currency}</p>
            </div>
          </Section>

          {/* ── Help CTA ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-700">Need help with this order?</p>
              <p className="text-xs text-gray-400 mt-0.5">Our support team is here for you.</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: theme.primary }}
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}