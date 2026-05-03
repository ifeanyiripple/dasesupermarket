"use client"
// components/admin/OrderDetailClient.tsx

import { useState }    from "react"
import { useMutation } from "@tanstack/react-query"
import { client }      from "@/lib/client"
import { toast }       from "sonner"
import { formatPrice } from "@/components/ProductCard"
import { cn }          from "@/lib/utils"
import Link            from "next/link"
import {
  ArrowLeft, User, MapPin, Phone, Calendar,
  CheckCircle2, Clock, Truck, XCircle, ShoppingBag,
  Send, Loader2, Package,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type DeliveryStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
type PaymentStatus  = "pending" | "processing" | "complete" | "cancelled"

type StatusUpdate = {
  id:        string
  status:    DeliveryStatus
  note:      string | null
  createdAt: string
}

type OrderItem = {
  id:             string
  name:           string
  description:    string
  category:       string
  brand:          string
  quantity:       number
  price:          number
  imageColor:     string
  imageColorCode: string
  imageUrl:       string
}

type Order = {
  id:             string
  referenceId:    string
  amount:         number
  currency:       string
  status:         string
  deliveryStatus: DeliveryStatus
  createDate:     string
  address:        string | null
  phoneNumber:    string | null
  user:           { id: string; name: string | null; email: string | null; phoneNumber: string | null }
  orderItems:     OrderItem[]
  statusUpdates:  StatusUpdate[]
}

// ── Config ─────────────────────────────────────────────────────────────────────

const DELIVERY_CFG: Record<DeliveryStatus, {
  label: string; color: string; bg: string; border: string; dot: string; icon: React.ReactNode
}> = {
  PENDING:   { label: "Order Placed",     color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-400",  icon: <Clock       size={13} /> },
  CONFIRMED: { label: "Order Confirmed",  color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",   icon: <CheckCircle2 size={13} /> },
  SHIPPED:   { label: "Out for Delivery", color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500", icon: <Truck       size={13} /> },
  DELIVERED: { label: "Delivered",        color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500",  icon: <CheckCircle2 size={13} /> },
  CANCELLED: { label: "Cancelled",        color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500",    icon: <XCircle     size={13} /> },
}

const PAYMENT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "text-amber-700", bg: "bg-amber-50"  },
  processing: { label: "Processing", color: "text-blue-700",  bg: "bg-blue-50"   },
  complete:   { label: "Completed",  color: "text-green-700", bg: "bg-green-50"  },
  cancelled:  { label: "Cancelled",  color: "text-red-700",   bg: "bg-red-50"    },
}

// Progress steps exclude CANCELLED — it's a branch, not a step
const PROGRESS_STEPS: DeliveryStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function OrderDetailClient({ order: initial }: { order: Order }) {
  const [order,           setOrder]          = useState(initial)
  const [selDelivery,     setSelDelivery]    = useState<DeliveryStatus>(initial.deliveryStatus)
  const [selPayment,      setSelPayment]     = useState<PaymentStatus>(initial.status as PaymentStatus)
  const [note,            setNote]           = useState("")

  const isCancelled = order.deliveryStatus === "CANCELLED"
  const stepIdx     = PROGRESS_STEPS.indexOf(order.deliveryStatus)

  const hasChange =
    selDelivery !== order.deliveryStatus ||
    selPayment  !== order.status         ||
    note.trim() !== ""

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: () =>
      client.orders.updateOrderStatus.$post({
        id:             order.id,
        deliveryStatus: selDelivery,
        note:           note.trim() || undefined,
        ...(selPayment !== order.status && { status: selPayment }),
      }),
    onSuccess: async (res) => {
      const json = await res.json() as any
      if (!json.success) { toast.error("Update failed"); return }
      toast.success("Status updated — customer notified 🔔")
      setOrder(prev => ({
        ...prev,
        deliveryStatus: selDelivery,
        status:         selPayment,
        statusUpdates: [
          ...prev.statusUpdates,
          { id: crypto.randomUUID(), status: selDelivery, note: note.trim() || null, createdAt: new Date().toISOString() },
        ],
      }))
      setNote("")
    },
    onError: () => toast.error("Failed to update order status"),
  })

  const deliveryCfg = DELIVERY_CFG[order.deliveryStatus]
  const paymentCfg  = PAYMENT_CFG[order.status] ?? PAYMENT_CFG["pending"]

  return (
    <div className="min-h-screen bg-[#f7fdfb]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#0d3d25] sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Orders</span>
            </Link>
            <span className="text-white/20 text-lg">/</span>
            <div>
              <h1 className="text-white font-bold text-base font-mono leading-none">{order.referenceId}</h1>
              <p className="text-white/40 text-[11px] mt-0.5 leading-none">{fmtDate(order.createDate)}</p>
            </div>
          </div>
          <span className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border",
            deliveryCfg.bg, deliveryCfg.color, deliveryCfg.border
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", deliveryCfg.dot)} />
            {deliveryCfg.label}
          </span>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Admin Console</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">DASE Supermarket</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-widest">
            Order Detail
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ LEFT: info + items ═══════════════════════════════════════════ */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Progress bar */}
            {!isCancelled && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Delivery Progress
                </p>
                <div className="relative flex items-start justify-between">
                  {/* Track */}
                  <div className="absolute left-[14px] right-[14px] top-[14px] h-0.5 bg-gray-100" />
                  <div
                    className="absolute left-[14px] top-[14px] h-0.5 bg-[#1a5c38] transition-all duration-700"
                    style={{ width: stepIdx >= 0 ? `${(stepIdx / (PROGRESS_STEPS.length - 1)) * 100}%` : "0%" }}
                  />
                  {PROGRESS_STEPS.map((step, i) => {
                    const cfg  = DELIVERY_CFG[step]
                    const done = i <= stepIdx
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                        <div className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                          done ? "bg-[#1a5c38] border-[#1a5c38] text-white" : "bg-white border-gray-200 text-gray-300"
                        )}>
                          {cfg.icon}
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wide text-center leading-tight",
                          i === stepIdx ? "text-[#1a5c38]" : done ? "text-gray-500" : "text-gray-300"
                        )}>
                          {cfg.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Order meta */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Order Details</p>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: <User size={14} />, label: "Customer", value: order.user.name ?? "Guest", sub: order.user.email ?? "" },
                  { icon: <Phone size={14} />, label: "Phone", value: order.phoneNumber ?? order.user.phoneNumber ?? "—", sub: "" },
                  { icon: <MapPin size={14} />, label: "Delivery Address", value: order.address ?? "Not provided", sub: "" },
                  { icon: <Calendar size={14} />, label: "Placed On", value: fmtDate(order.createDate), sub: "" },
                ].map(({ icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f0faf4] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#1a5c38]">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{value}</p>
                      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Payment</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", paymentCfg.bg, paymentCfg.color)}>
                    {paymentCfg.label}
                  </span>
                </div>
                <p className="text-xl font-extrabold text-[#1a5c38]">{formatPrice(order.amount)}</p>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Items
                </p>
                <span className="text-[10px] font-bold bg-[#f0faf4] text-[#1a5c38] px-2 py-0.5 rounded-full">
                  {order.orderItems.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {order.orderItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100"
                      style={{ backgroundColor: item.imageColorCode + "22" }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: item.imageColorCode }} />
                        <span className="text-[10px] text-gray-400">{item.imageColor}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-extrabold text-[#1a5c38]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-[#f7fdfb] border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {order.orderItems.reduce((s, i) => s + i.quantity, 0)} items total
                </p>
                <p className="text-lg font-extrabold text-[#1a5c38]">{formatPrice(order.amount)}</p>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: update form + timeline ════════════════════════════════ */}
          <div className="flex flex-col gap-6">

            {/* Update form */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Update Order</p>

              {/* Delivery status */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Delivery Status</p>
              <div className="flex flex-col gap-1.5 mb-4">
                {(Object.keys(DELIVERY_CFG) as DeliveryStatus[]).map(s => {
                  const cfg = DELIVERY_CFG[s]
                  const sel = selDelivery === s
                  return (
                    <button key={s} type="button" onClick={() => setSelDelivery(s)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm font-semibold transition-all",
                        sel
                          ? cn(cfg.bg, cfg.color, cfg.border)
                          : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50/60"
                      )}>
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", sel ? cfg.dot : "bg-gray-200")} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Payment status */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Status</p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {(["pending", "processing", "complete", "cancelled"] as PaymentStatus[]).map(s => {
                  const cfg = PAYMENT_CFG[s]
                  const sel = selPayment === s
                  return (
                    <button key={s} type="button" onClick={() => setSelPayment(s)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all",
                        sel ? cn(cfg.bg, cfg.color, "ring-1 ring-current border-current") : "border-gray-100 text-gray-400 hover:bg-gray-50"
                      )}>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Note */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                Note <span className="normal-case font-normal">(optional)</span>
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Driver assigned: Emeka, picked up at 2pm…"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#1a5c38]/40 focus:ring-2 focus:ring-[#1a5c38]/5 text-gray-700 placeholder:text-gray-300 mb-4"
              />

              <button
                onClick={() => updateStatus()}
                disabled={isPending || !hasChange}
                className="w-full h-11 bg-[#1a5c38] hover:bg-[#2d7a4f] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                  : <><Send size={14} /> Update & Notify Customer</>}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                A push notification is sent automatically.
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">Timeline</p>

              {order.statusUpdates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No timeline entries yet.</p>
              ) : (
                <div className="relative">
                  {/* Vertical connector */}
                  <div className="absolute left-[13px] top-3.5 bottom-3.5 w-px bg-gray-100" />

                  <div className="flex flex-col gap-0">
                    {order.statusUpdates.map((su, i) => {
                      const cfg    = DELIVERY_CFG[su.status] ?? DELIVERY_CFG["PENDING"]
                      const isLast = i === order.statusUpdates.length - 1
                      return (
                        <div key={su.id} className="relative flex gap-4 pb-5 last:pb-0">
                          {/* Step dot */}
                          <div className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 bg-white",
                            isLast ? "border-[#1a5c38] text-[#1a5c38]" : "border-gray-200 text-gray-400"
                          )}>
                            <span className={cn("w-2 h-2 rounded-full", isLast ? "bg-[#1a5c38]" : cfg.dot, "opacity-60")} />
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={cn("text-sm font-bold leading-none", isLast ? "text-gray-800" : "text-gray-500")}>
                              {cfg.label}
                            </p>
                            {su.note && (
                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{su.note}</p>
                            )}
                            <p className="text-[10px] text-gray-300 mt-1">{fmtDate(su.createdAt)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}