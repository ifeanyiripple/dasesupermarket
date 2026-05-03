"use client"
// components/admin/AdminDashboardClient.tsx

import { useState, useMemo, useRef, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, Package, ShoppingCart, Users, Star,
  LogOut, ShieldCheck, Search, Trash2, Pencil,
  TrendingUp, CheckCircle2, XCircle, MoreVertical,
  Plus, Eye, Loader2, AlertCircle, RefreshCw,
  ArrowUpRight, Boxes, BadgeCheck, AlertTriangle,
  UtensilsCrossed, BedDouble,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { toast } from "sonner"
import Link from "next/link"
import ItemFormModal from "@/components/admin/Itemformmodal"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/components/ProductCard"

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminData = {
  products: any[]
  orders:   any[]
  users:    any[]
  foods:    any[]   // ← add to your server fetch
  rooms:    any[]   // ← add to your server fetch
  stats: {
    totalProducts:    number
    inStockProducts:  number
    featuredProducts: number
    totalOrders:      number
    pendingOrders:    number
    completedOrders:  number
    totalRevenue:     number
    totalUsers:       number
    totalReviews:     number
  }
}

// ── Active modal state — one unified slot ─────────────────────────────────────
type ModalState =
  | { mode: "product"; item?: any }
  | { mode: "food";    item?: any }
  | { mode: "room";    item?: any }
  | null

type Tab = "overview" | "products" | "food" | "rooms" | "orders" | "users" | "reviews"

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  processing: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  complete:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  cancelled:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  AVAILABLE:  { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  OCCUPIED:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
  ADMIN:      { bg: "bg-[#f0faf4]", text: "text-[#1a5c38]",  dot: "bg-[#1a5c38]" },
  USER:       { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400"   },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG["pending"]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${accent ? "bg-[#0d3d25] border-[#0d3d25]" : "bg-white border-gray-100"}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-white/10" : "bg-[#f0faf4] border border-[#1a5c38]/10"}`}>
        <span className={accent ? "text-[#7ec89a]" : "text-[#1a5c38]"}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold leading-none ${accent ? "text-[#7ec89a]" : "text-gray-800"}`}>{value}</p>
      <p className={`text-[10px] uppercase tracking-widest mt-1.5 ${accent ? "text-white/40" : "text-gray-400"}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${accent ? "text-white/60" : "text-[#1a5c38]/60"}`}>{sub}</p>}
    </div>
  )
}

// ── Mini progress bar ─────────────────────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</p>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs font-bold text-gray-600 w-8 text-right">{value}</p>
    </div>
  )
}

// ── Search input ──────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#1a5c38]/40 focus:ring-2 focus:ring-[#1a5c38]/5 transition min-w-[200px]" />
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, count, children }: { title: string; count?: number; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">{title}</h2>
        {count !== undefined && (
          <span className="bg-[#f0faf4] text-[#1a5c38] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Table primitives ──────────────────────────────────────────────────────────
function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {head.map(h => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-5 py-3.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
        {empty && <div className="py-14 text-center text-gray-400 text-sm">No records found</div>}
      </div>
    </div>
  )
}
const TR = ({ children }: { children: React.ReactNode }) => <tr className="hover:bg-gray-50/70 transition-colors">{children}</tr>
const TD = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => <td className={`px-5 py-3.5 text-gray-600 align-middle text-sm ${className}`}>{children}</td>

// ── Three-dot menu ────────────────────────────────────────────────────────────
function ActionMenu({ items }: { items: { label: string; icon: React.ReactNode; onClick: () => void; variant?: "default" | "danger" }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <MoreVertical size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }} className="absolute right-0 top-8 z-50 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {items.map((item, i) => (
              <button key={i} onClick={() => { item.onClick(); setOpen(false) }}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-medium transition-colors ${item.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="flex-shrink-0">{item.icon}</span>{item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirm({ title, description, onConfirm, onClose, isLoading }: {
  title: string; description: string; onConfirm: () => void; onClose: () => void; isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-red-500 px-6 py-4">
          <h3 className="text-white font-bold text-base">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="h-9 px-4 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading}
            className="h-9 px-5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50 inline-flex items-center gap-2 transition-all">
            {isLoading ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Delete</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Badge styles ──────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, string> = {
  new:     "bg-blue-100 text-blue-700",
  sale:    "bg-red-100 text-red-700",
  hot:     "bg-orange-100 text-orange-700",
  organic: "bg-[#f0faf4] text-[#1a5c38]",
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",   icon: <BarChart3 size={14} /> },
  { id: "products",  label: "Products",   icon: <Package size={14} /> },
  { id: "food",      label: "Food Menu",  icon: <UtensilsCrossed size={14} /> },
  { id: "rooms",     label: "Rooms",      icon: <BedDouble size={14} /> },
  { id: "orders",    label: "Orders",     icon: <ShoppingCart size={14} /> },
  { id: "users",     label: "Users",      icon: <Users size={14} /> },
  { id: "reviews",   label: "Reviews",    icon: <Star size={14} /> },
]

export default function AdminDashboardClient({ data }: { data: AdminData }) {
  const { products, orders, users, stats } = data
  const [foods, setFoods] = useState<any[]>(data.foods ?? [])
const [rooms, setRooms] = useState<any[]>(data.rooms ?? [])
const [loadingFoods, setLoadingFoods] = useState(false)
const [loadingRooms, setLoadingRooms] = useState(false)

useEffect(() => {
  async function fetchFoods() {
    setLoadingFoods(true)
    try {
      const res = await fetch("/api/foods")
      const json = await res.json()
      if (json.success) setFoods(json.data.foods)
    } catch (e) {
      console.error("Failed to fetch foods", e)
    } finally {
      setLoadingFoods(false)
    }
  }

  async function fetchRooms() {
    setLoadingRooms(true)
    try {
      const res = await fetch("/api/rooms")
      const json = await res.json()
      if (json.success) setRooms(json.data.rooms)
    } catch (e) {
      console.error("Failed to fetch rooms", e)
    } finally {
      setLoadingRooms(false)
    }
  }

  fetchFoods()
  fetchRooms()
}, [])

  const queryClient = useQueryClient()

  const [activeTab,      setActiveTab]      = useState<Tab>("overview")
  const [productSearch,  setProductSearch]  = useState("")
  const [foodSearch,     setFoodSearch]     = useState("")
  const [roomSearch,     setRoomSearch]     = useState("")
  const [orderSearch,    setOrderSearch]    = useState("")
  const [userSearch,     setUserSearch]     = useState("")
  const [reviewSearch,   setReviewSearch]   = useState("")
  const [stockFilter,    setStockFilter]    = useState("ALL")
  const [orderFilter,    setOrderFilter]    = useState("ALL")

  // ── Unified modal state ───────────────────────────────────────────────────
  const [activeModal,    setActiveModal]    = useState<ModalState>(null)
  const [deletingItem,   setDeletingItem]   = useState<{ type: "product" | "food" | "room" | "review"; item: any } | null>(null)

  // ── Delete mutations ──────────────────────────────────────────────────────
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useMutation({
    mutationFn: async (id: string) => client.products.deleteProduct.$post({ id }),
    onSuccess:  () => { toast.success("Product deleted"); setDeletingItem(null); queryClient.invalidateQueries({ queryKey: ["admin-products"] }) },
    onError:    (e: any) => toast.error(e?.message || "Failed to delete"),
  })

  const { mutate: deleteReview, isPending: isDeletingReview } = useMutation({
    mutationFn: async (id: string) => client.products.deleteReview.$post({ reviewId: id }),
    onSuccess:  () => { toast.success("Review deleted"); setDeletingItem(null) },
    onError:    (e: any) => toast.error(e?.message || "Failed to delete review"),
  })

  // Food/Room delete — uses server actions (add delete-food.ts / delete-room.ts actions)
  const [isDeleting, startDeleteTransition] = useTransition()

  const handleDelete = () => {
    if (!deletingItem) return
    const { type, item } = deletingItem
    if (type === "product") { deleteProduct(item.id); return }
    if (type === "review")  { deleteReview(item.id); return }
    // Food / Room — wire to your server action when ready:
    // startDeleteTransition(async () => {
    //   const res = type === "food" ? await deleteFoodAction(item.id) : await deleteRoomAction(item.id)
    //   if (res.error) { toast.error(res.error); return }
    //   toast.success(`${type === "food" ? "Food" : "Room"} deleted`)
    //   setDeletingItem(null)
    // })
    toast.info("Delete action for food/room — wire your server action here")
    setDeletingItem(null)
  }

  const isDeletePending = isDeletingProduct || isDeletingReview || isDeleting

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const closeModal  = () => setActiveModal(null)
  const handleSuccess = () => { setActiveModal(null); window.location.reload() }

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let r = products
    if (productSearch) { const q = productSearch.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)) }
    if (stockFilter === "IN_STOCK")  r = r.filter(p => p.inStock)
    if (stockFilter === "OUT")       r = r.filter(p => !p.inStock)
    if (stockFilter === "FEATURED")  r = r.filter(p => p.isFeatured)
    return r
  }, [products, productSearch, stockFilter])

  const filteredFoods = useMemo(() => {
    if (!foodSearch) return foods
    const q = foodSearch.toLowerCase()
    return foods.filter((f: any) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
  }, [foods, foodSearch])

  const filteredRooms = useMemo(() => {
    if (!roomSearch) return rooms
    const q = roomSearch.toLowerCase()
    return rooms.filter((r: any) => r.name.toLowerCase().includes(q) || (r.roomNumber ?? "").toLowerCase().includes(q))
  }, [rooms, roomSearch])

  const filteredOrders = useMemo(() => {
    let r = orders
    if (orderSearch) { const q = orderSearch.toLowerCase(); r = r.filter(o => o.referenceId?.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q)) }
    if (orderFilter !== "ALL") r = r.filter(o => o.status === orderFilter)
    return r
  }, [orders, orderSearch, orderFilter])

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users
    const q = userSearch.toLowerCase()
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }, [users, userSearch])

  const allReviews = useMemo(() =>
    products.flatMap(p => (p.reviews ?? []).map((r: any) => ({ ...r, productName: p.name, productId: p.id }))),
  [products])

  const filteredReviews = useMemo(() => {
    if (!reviewSearch) return allReviews
    const q = reviewSearch.toLowerCase()
    return allReviews.filter((r: any) => r.productName.toLowerCase().includes(q) || r.user?.name?.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q))
  }, [allReviews, reviewSearch])

  const fmtDate  = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" })

  return (
    <div className="min-h-screen bg-[#f7fdfb]">

      {/* ── Item Form Modal (Product / Food / Room) ───────────────────────── */}
      {activeModal && (
        <ItemFormModal
          mode={activeModal.mode}
          item={activeModal.item}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {deletingItem && (
        <DeleteConfirm
          title={`Delete ${deletingItem.type.charAt(0).toUpperCase() + deletingItem.type.slice(1)}`}
          description={`Are you sure you want to permanently delete "${deletingItem.item.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeletingItem(null)}
          isLoading={isDeletePending}
        />
      )}

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1a5c38] flex items-center justify-center">
              <ShieldCheck size={16} className="text-[#7ec89a]" />
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1a5c38]">Admin</p>
              <p className="text-[9px] text-gray-400 tracking-widest">DASE Supermarket</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden sm:block text-xs uppercase tracking-widest text-gray-400 hover:text-[#1a5c38] transition-colors">← Store</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={13} /><span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Store <span className="text-[#1a5c38]">Dashboard</span></h1>
          <p className="text-gray-400 text-xs mt-0.5">DASE Supermarket · Admin Console</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={<TrendingUp size={16}/>}    label="Revenue"   value={formatPrice(stats.totalRevenue)} sub="From completed orders" accent />
          <StatCard icon={<Package size={16}/>}       label="Products"  value={stats.totalProducts}  sub={`${stats.inStockProducts} in stock`} />
          <StatCard icon={<ShoppingCart size={16}/>}  label="Orders"    value={stats.totalOrders}    sub={`${stats.pendingOrders} pending`} />
          <StatCard icon={<Users size={16}/>}         label="Customers" value={stats.totalUsers}     sub="registered" />
          <StatCard icon={<Star size={16}/>}          label="Reviews"   value={stats.totalReviews}   sub="all products" />
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap gap-1.5 mb-6 bg-gray-100 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? "bg-[#1a5c38] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}>
              {t.icon}<span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Order status */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Order Status</h3>
                  <div className="space-y-3">
                    <MiniBar label="Completed"  value={stats.completedOrders} max={stats.totalOrders} color="#1a5c38" />
                    <MiniBar label="Pending"    value={stats.pendingOrders}   max={stats.totalOrders} color="#f59e0b" />
                    <MiniBar label="Cancelled"  value={orders.filter((o:any) => o.status === "cancelled").length} max={stats.totalOrders} color="#ef4444" />
                  </div>
                </div>
                {/* Product stock */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Product Overview</h3>
                  <div className="space-y-3">
                    <MiniBar label="In Stock"     value={stats.inStockProducts}                   max={stats.totalProducts} color="#1a5c38" />
                    <MiniBar label="Out of Stock" value={stats.totalProducts - stats.inStockProducts} max={stats.totalProducts} color="#ef4444" />
                    <MiniBar label="Featured"     value={stats.featuredProducts}                  max={stats.totalProducts} color="#2d7a4f" />
                  </div>
                </div>
                {/* Recent orders */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-700 font-mono">{o.referenceId}</p>
                          <p className="text-[10px] text-gray-400">{o.user?.name ?? "Guest"} · {fmtShort(o.createDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#1a5c38]">{formatPrice(o.amount)}</span>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick actions */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Add Product",  icon: <Plus size={14}/>,              action: () => setActiveModal({ mode: "product" }) },
                      { label: "Add Food",     icon: <UtensilsCrossed size={14}/>,   action: () => setActiveModal({ mode: "food" }) },
                      { label: "Add Room",     icon: <BedDouble size={14}/>,         action: () => setActiveModal({ mode: "room" }) },
                      { label: "View Orders",  icon: <ShoppingCart size={14}/>,      action: () => setActiveTab("orders") },
                    ].map(a => (
                      <button key={a.label} onClick={a.action}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-[#f0faf4] hover:border-[#1a5c38]/20 hover:text-[#1a5c38] transition-all">
                        <span className="text-[#1a5c38]/60">{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Top reviewed */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Top Reviewed Products</h3>
                  <div className="space-y-2">
                    {[...products].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        {p.images?.[0] && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <img src={p.images[0].image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.reviewCount} reviews · ⭐ {p.avgRating}</p>
                        </div>
                        <span className="text-sm font-bold text-[#1a5c38] flex-shrink-0">{formatPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PRODUCTS ══════════════════════════════════════════════════ */}
            {activeTab === "products" && (
              <div>
                <SectionHeader title="Products" count={filteredProducts.length}>
                  <div className="flex flex-wrap gap-2">
                    <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Search products…" />
                    <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:border-[#1a5c38]/30 cursor-pointer">
                      <option value="ALL">All Products</option>
                      <option value="IN_STOCK">In Stock</option>
                      <option value="OUT">Out of Stock</option>
                      <option value="FEATURED">Featured</option>
                    </select>
                    <button onClick={() => setActiveModal({ mode: "product" })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a5c38] text-white text-xs font-bold hover:bg-[#2d7a4f] transition-colors">
                      <Plus size={13} /> Add Product
                    </button>
                  </div>
                </SectionHeader>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl">
                    No products found.{" "}
                    <button onClick={() => setActiveModal({ mode: "product" })} className="text-[#1a5c38] font-medium hover:underline">Add your first product</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((p: any) => (
                      <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-40 bg-[#f0faf4] overflow-hidden">
                          {p.images?.[0] ? (
                            <img src={p.images[0].image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300"><Package size={32} /></div>
                          )}
                          {p.badge && BADGE_STYLES[p.badge] && (
                            <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_STYLES[p.badge]}`}>
                              {p.badge}
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold bg-[#1a5c38] text-white px-2 py-0.5 rounded-full">
                              <BadgeCheck size={9} /> Featured
                            </span>
                          )}
                          {!p.inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-full border">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1">{p.name}</h3>
                            <ActionMenu items={[
                              { label: "Edit",   icon: <Pencil size={13}/>, onClick: () => setActiveModal({ mode: "product", item: p }) },
                              { label: "View",   icon: <Eye size={13}/>,   onClick: () => window.open(`/product/${p.id}`, "_blank") },
                              { label: "Delete", icon: <Trash2 size={13}/>,onClick: () => setDeletingItem({ type: "product", item: p }), variant: "danger" },
                            ]} />
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{p.category}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-base font-extrabold text-[#1a5c38]">{formatPrice(p.price)}</p>
                              {p.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400">{p.reviewCount} reviews</p>
                              {p.avgRating > 0 && <p className="text-[10px] text-amber-500 font-bold">⭐ {p.avgRating}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                            <span className="text-[9px] text-gray-400">{p.images?.length ?? 0} images</span>
                            <span className="text-gray-200">·</span>
                            <span className={`text-[9px] font-semibold ${p.inStock ? "text-green-600" : "text-red-500"}`}>
                              {p.inStock ? "✓ In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ FOOD MENU ═════════════════════════════════════════════════ */}
            {activeTab === "food" && (
              <div>
                <SectionHeader title="Food Menu" count={filteredFoods.length}>
                  <div className="flex flex-wrap gap-2">
                    <SearchInput value={foodSearch} onChange={setFoodSearch} placeholder="Search food…" />
                    <button onClick={() => setActiveModal({ mode: "food" })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3d1a0d] text-white text-xs font-bold hover:bg-[#5a2a12] transition-colors">
                      <Plus size={13} /> Add Food
                    </button>
                  </div>
                </SectionHeader>

                {filteredFoods.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl">
                    No food items found.{" "}
                    <button onClick={() => setActiveModal({ mode: "food" })} className="text-[#3d1a0d] font-medium hover:underline">Add your first dish</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFoods.map((f: any) => (
                      <div key={f.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-40 bg-amber-50 overflow-hidden">
                          {f.image ? (
                            <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300"><UtensilsCrossed size={32} /></div>
                          )}
                          {f.badge && (
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {f.badge}
                            </span>
                          )}
                          {f.spicy && (
                            <span className="absolute top-2 right-2 text-[10px]">🌶</span>
                          )}
                          {!f.inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-full border">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1">{f.name}</h3>
                            <ActionMenu items={[
                              { label: "Edit",   icon: <Pencil size={13}/>, onClick: () => setActiveModal({ mode: "food", item: f }) },
                              { label: "Delete", icon: <Trash2 size={13}/>, onClick: () => setDeletingItem({ type: "food", item: f }), variant: "danger" },
                            ]} />
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{f.category}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-base font-extrabold text-amber-600">{formatPrice(f.price)}</p>
                            <div className="text-right">
                              {f.rating > 0 && <p className="text-[10px] text-amber-500 font-bold">⭐ {f.rating}</p>}
                              <p className="text-[10px] text-gray-400">⏱ {f.prepTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
                            <span className={`text-[9px] font-semibold ${f.inStock ? "text-green-600" : "text-red-500"}`}>
                              {f.inStock ? "✓ In Stock" : "Out of Stock"}
                            </span>
                            {f.isFeatured && (
                              <><span className="text-gray-200">·</span><span className="text-[9px] text-[#1a5c38] font-bold">Featured</span></>
                            )}
                            {(f.meatOptions?.length ?? 0) > 0 && (
                              <><span className="text-gray-200">·</span><span className="text-[9px] text-gray-400">{f.meatOptions.length} options</span></>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ROOMS ═════════════════════════════════════════════════════ */}
            {activeTab === "rooms" && (
              <div>
                <SectionHeader title="Rooms" count={filteredRooms.length}>
                  <div className="flex flex-wrap gap-2">
                    <SearchInput value={roomSearch} onChange={setRoomSearch} placeholder="Search rooms…" />
                    <button onClick={() => setActiveModal({ mode: "room" })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d253d] text-white text-xs font-bold hover:bg-[#163856] transition-colors">
                      <Plus size={13} /> Add Room
                    </button>
                  </div>
                </SectionHeader>

                {filteredRooms.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl">
                    No rooms found.{" "}
                    <button onClick={() => setActiveModal({ mode: "room" })} className="text-[#0d253d] font-medium hover:underline">Add your first room</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((r: any) => (
                      <div key={r.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-44 bg-blue-50 overflow-hidden">
                          {r.images?.[0] ? (
                            <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300"><BedDouble size={40} /></div>
                          )}
                          <div className="absolute top-2 right-2">
                            <StatusBadge status={r.status} />
                          </div>
                          {r.featured && (
                            <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold bg-[#0d253d] text-white px-2 py-0.5 rounded-full">
                              <BadgeCheck size={9} /> Featured
                            </span>
                          )}
                          {r.images?.length > 1 && (
                            <span className="absolute bottom-2 right-2 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded-md">
                              +{r.images.length - 1} photos
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-sm">{r.name}</h3>
                              {r.roomNumber && <p className="text-[10px] text-gray-400">Room #{r.roomNumber}</p>}
                            </div>
                            <ActionMenu items={[
                              { label: "Edit",   icon: <Pencil size={13}/>, onClick: () => setActiveModal({ mode: "room", item: r }) },
                              { label: "Delete", icon: <Trash2 size={13}/>, onClick: () => setDeletingItem({ type: "room", item: r }), variant: "danger" },
                            ]} />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-base font-extrabold text-[#0d253d]">{formatPrice(r.price)}<span className="text-xs font-normal text-gray-400">/night</span></p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              {r.bed && <span>🛏 {r.bed}</span>}
                              <span>👥 {r.capacity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ORDERS ════════════════════════════════════════════════════ */}
            {activeTab === "orders" && (
              <div>
                <SectionHeader title="All Orders" count={filteredOrders.length}>
                  <div className="flex flex-wrap gap-2">
                    <SearchInput value={orderSearch} onChange={setOrderSearch} placeholder="Search orders…" />
                    <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none cursor-pointer">
                      <option value="ALL">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="complete">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </SectionHeader>
                <Table head={["Reference", "Customer", "Items", "Amount", "Status", "Delivery", "Date"]} empty={filteredOrders.length === 0}>
                  {filteredOrders.map((o: any) => (
                    <TR key={o.id}>
                      <TD className="font-mono text-xs">{o.referenceId}</TD>
                      <TD>
                        <p className="font-medium text-gray-700 text-xs">{o.user?.name ?? "Guest"}</p>
                        <p className="text-[10px] text-gray-400">{o.user?.email}</p>
                      </TD>
                      <TD>
                        <p className="text-xs">{(o.orderItems ?? []).slice(0,2).map((i:any) => i.name).join(", ")}</p>
                        <p className="text-[10px] text-gray-400">{(o.orderItems ?? []).length} item(s)</p>
                      </TD>
                      <TD><span className="font-bold text-[#1a5c38]">{formatPrice(o.amount)}</span></TD>
                      <TD><StatusBadge status={o.status} /></TD>
                      <TD><StatusBadge status={o.deliveryStatus} /></TD>
                      <TD className="text-xs text-gray-400">{fmtDate(o.createDate)}</TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ USERS ═════════════════════════════════════════════════════ */}
            {activeTab === "users" && (
              <div>
                <SectionHeader title="Customers" count={filteredUsers.length}>
                  <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search customers…" />
                </SectionHeader>
                <Table head={["Customer", "Email", "Role", "Orders", "Reviews", "Joined"]} empty={filteredUsers.length === 0}>
                  {filteredUsers.map((u: any) => (
                    <TR key={u.id}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f0faf4] border border-[#1a5c38]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#1a5c38]">
                            {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <p className="text-xs font-bold text-gray-700">{u.name}</p>
                        </div>
                      </TD>
                      <TD className="text-xs text-gray-500">{u.email}</TD>
                      <TD><StatusBadge status={u.role} /></TD>
                      <TD><span className="text-xs font-bold">{(u.orders ?? []).length}</span></TD>
                      <TD><span className="text-xs font-bold">{(u.reviews ?? []).length}</span></TD>
                      <TD className="text-xs text-gray-400">{fmtDate(u.createdAt)}</TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ REVIEWS ═══════════════════════════════════════════════════ */}
            {activeTab === "reviews" && (
              <div>
                <SectionHeader title="All Reviews" count={filteredReviews.length}>
                  <SearchInput value={reviewSearch} onChange={setReviewSearch} placeholder="Search reviews…" />
                </SectionHeader>
                <Table head={["Customer", "Product", "Rating", "Comment", "Date", ""]} empty={filteredReviews.length === 0}>
                  {filteredReviews.map((r: any) => (
                    <TR key={r.id}>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f0faf4] flex items-center justify-center text-[10px] font-bold text-[#1a5c38] flex-shrink-0">
                            {(r.user?.name ?? "A").charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-medium text-gray-700">{r.user?.name ?? "Anonymous"}</p>
                        </div>
                      </TD>
                      <TD>
                        <Link href={`/product/${r.productId}`} target="_blank" className="text-xs text-[#1a5c38] hover:underline font-medium">
                          {r.productName}
                        </Link>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-[11px] ${s <= r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                          ))}
                        </div>
                      </TD>
                      <TD className="max-w-[200px]">
                        <p className="text-xs text-gray-500 line-clamp-2">{r.comment}</p>
                      </TD>
                      <TD className="text-xs text-gray-400">{fmtDate(r.createdDate)}</TD>
                      <TD>
                        <button onClick={() => setDeletingItem({ type: "review", item: r })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}