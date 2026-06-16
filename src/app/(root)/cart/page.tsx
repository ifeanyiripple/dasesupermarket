"use client"
// app/cart/page.tsx

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart, Minus, Plus, Trash2,
  ArrowLeft, ArrowRight, ShoppingBag,
  Shield, Truck, RotateCcw, Tag,
} from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/components/ProductCard"
import Navbar from "@/components/layout/Navbar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTheme } from "@/providers/theme-provider"

// ── Trust items ───────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Truck,     label: "Free Delivery",  sub: "Orders above ₦5,000" },
  { icon: Shield,    label: "Secure Payment", sub: "Your data is safe"    },
  { icon: RotateCcw, label: "Easy Returns",   sub: "Within 24 hours"      },
]

// ── Cart item row ─────────────────────────────────────────────────────────────
function CartRow({ item }: { item: ReturnType<typeof useCart>["cartItems"][0] }) {
  const { updateQuantity, removeFromCart } = useCart()
  const { theme } = useTheme()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 py-5 border-b border-gray-100 last:border-0"
    >
      {/* Image */}
      <Link href={`/product/${item.id}`} className="flex-shrink-0">
        <div
          className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-gray-100"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="96px" />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link href={`/product/${item.id}`}>
            <h3
              className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 transition-colors leading-snug
                         hover:text-[var(--theme-primary)]"
            >
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: item.imageColorCode }} />
              <span className="text-xs text-gray-400">{item.imageColor}</span>
            </div>
            {item.brand && <span className="text-xs text-gray-400">· {item.brand}</span>}
            <span className="text-xs text-gray-300">· {item.category}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Qty stepper */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="w-10 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-base font-extrabold" style={{ color: theme.primary }}>
              {formatPrice(item.price * item.quantity)}
            </span>
            <button
              onClick={() => removeFromCart(item.id)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── CART PAGE ──────────────────────────────────────────════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════

export default function CartPage() {
  const { theme } = useTheme()
  const router    = useRouter()
  const user      = useCurrentUser()

  const {
    cartItems, cartCount, cartTotal, clearCart,
    promoCode, setPromoCode,
    promoApplied, promoDiscount,
    applyPromo, clearPromo,
  } = useCart()

  const [promoError, setPromoError] = useState("") // UI-only, stays local

  const delivery = cartTotal >= 5000 ? 0 : 500
  const total    = cartTotal - promoDiscount + delivery

  const handlePromo = () => {
    const result = applyPromo(promoCode)
    setPromoError(result === "ok" ? "" : "Invalid promo code")
  }

  const handleCheckout = () => {
   // if (!user) { router.push("/auth/login?callbackUrl=/checkout"); return }
    router.push("/checkout")
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen mt-10 mb-10 flex flex-col">
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
              <ShoppingCart size={40} style={{ color: theme.primaryBorder }} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">Your cart is empty</h1>
            <p className="text-gray-400 text-sm">
              Looks like you haven&apos;t added any products yet. Start shopping and fill it up!
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-bold text-sm transition-colors shadow-lg"
              style={{ backgroundColor: theme.primary, boxShadow: `0 8px 20px ${theme.primary}30` }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.primary)}
            >
              <ShoppingBag size={16} /> Browse Products
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors
                         hover:text-[var(--theme-primary)]"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-12 py-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Cart items ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
              <AnimatePresence>
                {cartItems.map(item => (
                  <CartRow key={`${item.id}-${item.imageColor}`} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <Link
              href="/shop"
              className="flex items-center gap-2 mt-4 text-sm text-gray-400 transition-colors w-fit
                         hover:text-[var(--theme-primary)]"
            >
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* ── Order summary ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
              <h2 className="font-extrabold text-gray-800">Order Summary</h2>

              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-semibold text-gray-700">{formatPrice(cartTotal)}</span>
                </div>

                {/* ── Promo discount line ── */}
                {promoDiscount > 0 && (
                  <div className="flex justify-between" style={{ color: theme.primaryText }}>
                    <span>Promo ({promoCode} · 10%)</span>
                    <span className="font-semibold">− {formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>Delivery fee</span>
                  <span
                    className="font-semibold"
                    style={{ color: delivery === 0 ? theme.primaryText : undefined }}
                  >
                    {delivery === 0 ? "Free 🎉" : formatPrice(delivery)}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-[10px] text-gray-400">
                    Add {formatPrice(5000 - cartTotal)} more for free delivery
                  </p>
                )}
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-extrabold text-base">
                  <span>Total</span>
                  <span className="text-lg" style={{ color: theme.primary }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Promo code input */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50
                               focus-within:border-[var(--theme-primary)]/40 transition-colors"
                  >
                    <Tag size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError("")
                        if (promoApplied) clearPromo()
                      }}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePromo}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.primary)}
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs font-semibold" style={{ color: theme.primaryText }}>
                    ✓ 10% discount applied!
                  </p>
                )}
                {promoError && <p className="text-xs text-red-500">{promoError}</p>}
                <p className="text-[10px] text-gray-400">Try: DASE10</p>
              </div>

              {/* Checkout button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 8px 20px ${theme.primary}30`,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.primary)}
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </motion.button>

              {!user ? (
  <div
    className="flex flex-col gap-2 mt-1 p-3 rounded-xl border text-center"
    style={{ background: theme.primaryLight }}
  >
    <p className="text-[11px] font-semibold text-gray-600">
      You&apos;re checking out as a <span className="font-black text-gray-800">guest</span>
    </p>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] text-gray-400">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    <Link
      href="/auth/login?callbackUrl=/checkout"
      className="text-[11px] font-bold hover:underline"
      style={{ color: theme.primary }}
    >
      Sign in for faster checkout →
    </Link>
  </div>
) : (
  <p className="text-[10px] text-gray-400 text-center">
    Signed in as <span className="font-semibold">{user.email}</span>
  </p>
)}
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-2">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Icon size={14} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery area notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 rounded-2xl p-4 text-sm"
            style={{
              backgroundColor: `#FFF7ED`,
              border: `1px solid #FED7AA`,
              color: theme.primaryText,
            }}
          >
            <div className="text-xl shrink-0">🚚</div>
            <div>
              <p className="font-bold mb-0.5" style={{ color: "#C2410C" }}>Delivery within Oyo State Only</p>
              <p className="text-xs leading-relaxed opacity-80">
                We currently deliver within Oyo State only. We're working hard to expand to more
                locations soon — stay tuned!
              </p>
            </div>
          </motion.div>

        </div>    
      </main>
      // <p className="text-center text-xs mt-4 mb-2" style={{ color: theme.primaryText }}>
      //     Dase Supermarket v1.0.0
      //   </p>
    </div>
  )
}