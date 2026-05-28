"use client";
// app/checkout/page.tsx

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/components/ProductCard"
import { useMutation } from "@tanstack/react-query"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTheme } from "@/providers/theme-provider"
import Navbar from "@/components/layout/Navbar"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, MapPin, Phone, User,
  CheckCircle2, Loader2, Plus, Edit2,
  Home, Briefcase, Check, AlertCircle, Mail, LogIn
} from "lucide-react"
import { toast } from "sonner"
import { AddressModal, type Address, type AddressForm } from "@/components/AddressModal"

// ─── Types ────────────────────────────────────────────────────────────────────

type Notes = string

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAddressLine(addr: Address) {
  return [addr.street, addr.town, addr.lga, addr.state].filter(Boolean).join(", ")
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ─── GuestEmailCard ───────────────────────────────────────────────────────────

function GuestEmailCard({
  email,
  emailError,
  emailAccountFound,
  onChange,
  theme,
}: {
  email: string
  emailError: string
  emailAccountFound: boolean
  onChange: (v: string) => void
  theme: any
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border shadow-sm p-5"
      style={{ borderColor: theme.primaryBorder }}
    >
      {/* Guest banner */}
      <div
        className="flex items-center justify-between p-3 rounded-xl mb-4"
        style={{ background: theme.primaryLight, border: `1px solid ${theme.primaryBorder}` }}
      >
        <div className="flex items-center gap-2">
          <User size={14} style={{ color: theme.primary }} />
          <p className="text-xs font-bold text-gray-700">
            Checking out as a <span style={{ color: theme.primary }}>guest</span>
          </p>
        </div>
        <Link
          href="/auth/login?callbackUrl=/checkout"
          className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1.5 transition-all"
          style={{ color: theme.primary, background: `${theme.primary}12` }}
        >
          <LogIn size={11} /> Sign in
        </Link>
      </div>

      {/* Email input */}
      <h2 className="font-extrabold text-gray-800 mb-1 flex items-center gap-2 text-sm">
        <Mail size={15} style={{ color: theme.primary }} /> Contact Email
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        We&apos;ll send your order confirmation to this address.
      </p>

      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200"
        style={{ borderColor: emailError ? "#EF4444" : theme.primaryBorder }}
        onFocus={e => (e.currentTarget.style.borderColor = emailError ? "#EF4444" : theme.primary)}
        onBlur={e => (e.currentTarget.style.borderColor = emailError ? "#EF4444" : theme.primaryBorder)}
      >
        <Mail
          size={14}
          className="flex-shrink-0"
          style={{ color: emailError ? "#EF4444" : theme.primary }}
        />
        <input
          type="email"
          value={email}
          onChange={e => onChange(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
        {isValidEmail(email) && (
          <Check size={14} className="text-emerald-500 flex-shrink-0" />
        )}
      </div>

      {/* Account found banner */}
      {emailAccountFound && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: theme.primaryLight,
            color:      theme.primary,
            border:     `1px solid ${theme.primaryBorder}`,
          }}
        >
          <CheckCircle2 size={13} className="shrink-0" />
          Account found — your saved addresses have been loaded.
        </motion.div>
      )}

      {emailError && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle size={11} /> {emailError}
        </p>
      )}
    </motion.div>
  )
}

// ─── AddressCard ──────────────────────────────────────────────────────────────

function AddressCard({
  addr,
  selected,
  onSelect,
  onEdit,
  theme,
}: {
  addr: Address
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  theme: any
}) {
  const Icon = addr.label === "Work" ? Briefcase : addr.label === "Other" ? MapPin : Home

  return (
    <motion.div
      layout
      onClick={onSelect}
      className="relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200"
      style={{
        borderColor:     selected ? theme.primary : theme.primaryBorder,
        backgroundColor: selected ? theme.primaryLight : "white",
        boxShadow:       selected ? `0 4px 12px ${theme.primary}20` : "none",
      }}
    >
      {selected && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Check size={11} className="text-white stroke-[3]" />
        </div>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
          style={{ backgroundColor: selected ? `${theme.primary}20` : theme.primaryLight }}
        >
          <Icon size={16} style={{ color: selected ? theme.primary : theme.primaryText }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-bold transition-colors duration-200"
              style={{ color: selected ? theme.primary : "#1f2937" }}
            >
              {addr.label ?? "Address"}
            </span>
            {addr.isDefault && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  color:           theme.primaryText,
                  backgroundColor: `${theme.primary}20`,
                  border:          `1px solid ${theme.primaryBorder}`,
                }}
              >
                Default
              </span>
            )}
          </div>

          {addr.fullName && (
            <p className="text-xs font-semibold text-gray-700 mt-0.5">{addr.fullName}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{formatAddressLine(addr)}</p>
          {addr.phoneNumber && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Phone size={10} /> {addr.phoneNumber}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors duration-200"
        style={{ backgroundColor: selected ? `${theme.primary}10` : "transparent" }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = selected ? `${theme.primary}20` : theme.primaryLight
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = selected ? `${theme.primary}10` : "transparent"
        }}
      >
        <Edit2 size={12} style={{ color: selected ? theme.primary : theme.primaryText }} />
      </button>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const user   = useCurrentUser()
  const { theme } = useTheme()
  const { cartItems, cartTotal, cartCount, clearCart, promoCode, promoDiscount, promoRate } = useCart()

  const total = cartTotal - promoDiscount

  // ── Guest email state ──────────────────────────────────────────────────────
  const [guestEmail, setGuestEmail]               = useState("")
  const [emailError, setEmailError]               = useState("")
  const [emailAccountFound, setEmailAccountFound] = useState(false)

  // The email passed to Paystack — account email for logged-in users, typed email for guests
  const effectiveEmail = user?.email ?? guestEmail.trim()

  // ── Address state ──────────────────────────────────────────────────────────
  const [addresses, setAddresses]           = useState<Address[]>([])
  const [addrLoading, setAddrLoading]       = useState(true)
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null)
  const [showModal, setShowModal]           = useState(false)
  const [editingAddr, setEditingAddr]       = useState<Address | null>(null)
  const [notes, setNotes]                   = useState<Notes>("")

  const selectedAddr = addresses.find(a => a.id === selectedAddrId) ?? null

  const displayName  = user?.name || (user?.email?.split("@")[0]) || "Guest"
  const userInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // ── Fetch addresses ────────────────────────────────────────────────────────
  useEffect(() => {
    // Logged-in user — fetch immediately
    if (user) {
      ;(async () => {
        setAddrLoading(true)
        try {
          const res = await fetch("/api/addresses")
          if (res.ok) {
            const data = await res.json()
            const list: Address[] = data.addresses ?? []
            setAddresses(list)
            const def = list.find(a => a.isDefault) ?? list[0]
            if (def) setSelectedAddrId(def.id)
          }
        } catch {
          toast.error("Could not load your addresses")
        } finally {
          setAddrLoading(false)
        }
      })()
      return
    }

    // Guest — only fetch once we have a valid email
    if (!isValidEmail(guestEmail)) {
      setAddresses([])
      setSelectedAddrId(null)
      setEmailAccountFound(false)
      setAddrLoading(false)
      return
    }

    ;(async () => {
      setAddrLoading(true)
      try {
        const res = await fetch(
          `/api/addresses?guestEmail=${encodeURIComponent(guestEmail.trim())}`
        )
        if (res.ok) {
          const data = await res.json()
          const list: Address[] = data.addresses ?? []
          setAddresses(list)
          setEmailAccountFound(Boolean(data.userFound))
          const def = list.find(a => a.isDefault) ?? list[0]
          if (def) setSelectedAddrId(def.id)
        }
      } catch {
        // Guest simply starts with no addresses — not an error worth surfacing
      } finally {
        setAddrLoading(false)
      }
    })()
  }, [user, guestEmail])

  // ── Address CRUD ───────────────────────────────────────────────────────────
  const handleSaveAddress = async (form: AddressForm) => {
    const method = editingAddr ? "PATCH" : "POST"
    const url    = editingAddr ? `/api/addresses/${editingAddr.id}` : "/api/addresses"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ...(!user && { guestEmail: guestEmail.trim() }),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (editingAddr) {
        setAddresses(prev => prev.map(a => (a.id === editingAddr.id ? data.address : a)))
      } else {
        setAddresses(prev => [...prev, data.address])
        setSelectedAddrId(data.address.id)
      }
      toast.success(editingAddr ? "Address updated ✓" : "Address saved ✓")
      setShowModal(false)
      setEditingAddr(null)
    } else {
      toast.error("Could not save address")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return

    const url = user
      ? `/api/addresses/${id}`
      : `/api/addresses/${id}?guestEmail=${encodeURIComponent(guestEmail.trim())}`

    const res = await fetch(url, { method: "DELETE" })

    if (res.ok) {
      setAddresses(prev => prev.filter(a => a.id !== id))
      if (selectedAddrId === id) {
        const remaining = addresses.filter(a => a.id !== id)
        const def = remaining.find(a => a.isDefault) ?? remaining[0]
        setSelectedAddrId(def?.id ?? null)
      }
      toast.success("Address removed")
    } else {
      toast.error("Could not delete address")
    }
  }

  // ── Guard states ───────────────────────────────────────────────────────────
  // Phone is required — it must be filled in on the selected address
  const hasPhone      = Boolean(selectedAddr?.phoneNumber)
  const hasAddress    = Boolean(selectedAddrId)
  const hasValidEmail = user ? true : isValidEmail(guestEmail)
  const canOrder      = hasValidEmail && hasPhone && hasAddress

  // ── Initialize payment ─────────────────────────────────────────────────────
  const { mutate: initializePayment, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedAddr) throw new Error("No address selected")

      if (!user && !isValidEmail(guestEmail)) {
        setEmailError("Please enter a valid email address")
        throw new Error("Invalid email")
      }

      const items = cartItems.map(item => {
        const isFood = item.itemType === "food"
        return {
          productId:      isFood ? null : item.id,
          foodId:         isFood ? item.id : null,
          name:           item.name,
          description:    item.description    ?? "",
          category:       item.category       ?? "",
          brand:          item.brand          ?? "",
          quantity:       item.quantity,
          price:          item.price,
          imageColor:     item.imageColor     ?? "default",
          imageColorCode: item.imageColorCode ?? "#000000",
          imageUrl:       item.imageUrl       ?? "",
        }
      })

      const res = await fetch("/api/paystack/initialize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:      total,
          email:       effectiveEmail,
          guestEmail:  user ? null : guestEmail.trim(),
          addressId:   selectedAddr.id,
          address:     formatAddressLine(selectedAddr),
          phoneNumber: selectedAddr.phoneNumber ?? "",
          notes,
          items,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to initialize payment")
      }

      return res.json()
    },
    onSuccess: (data) => {
      clearCart()
      toast.success("Redirecting to payment…")
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        toast.error("No payment URL received")
      }
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to initialize payment. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      if (!guestEmail.trim()) {
        setEmailError("Email is required to place an order")
        return
      }
      if (!isValidEmail(guestEmail)) {
        setEmailError("Please enter a valid email address")
        return
      }
    }

    if (!hasAddress || !selectedAddr) {
      toast.error("Please select a delivery address")
      return
    }
    if (!hasPhone) {
      toast.error("Please add a phone number to your delivery address")
      return
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    initializePayment()
  }

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <MapPin size={32} style={{ color: theme.primaryBorder }} />
            </div>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{ backgroundColor: theme.primary, color: "white" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.primary }}
            >
              Browse products
            </Link>
          </motion.div>
        </main>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
      <Navbar />

      {/* Address modal */}
      <AnimatePresence>
        {showModal && (
          <AddressModal
            address={editingAddr}
            onClose={() => { setShowModal(false); setEditingAddr(null) }}
            onSave={handleSaveAddress}
            onDelete={editingAddr ? () => handleDeleteAddress(editingAddr.id) : undefined}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-12 py-8 w-full">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-sm transition-colors mb-4 w-fit duration-200"
            style={{ color: theme.primaryText }}
            onMouseEnter={e => { e.currentTarget.style.color = theme.primary }}
            onMouseLeave={e => { e.currentTarget.style.color = theme.primaryText }}
          >
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Checkout</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {user
              ? "Review your order and confirm delivery details"
              : "You're checking out as a guest"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ───────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Step 1 — guest sees email card, user sees account card */}
              {!user ? (
                <GuestEmailCard
                  email={guestEmail}
                  emailError={emailError}
                  emailAccountFound={emailAccountFound}
                  onChange={v => {
                    setGuestEmail(v)
                    setEmailError("")
                    setAddresses([])
                    setEmailAccountFound(false)
                  }}
                  theme={theme}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border shadow-sm p-5"
                  style={{ borderColor: theme.primaryBorder }}
                >
                  <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={16} style={{ color: theme.primary }} /> Ordering As
                  </h2>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0"
                      style={{
                        backgroundColor: theme.primaryLight,
                        color:           theme.primary,
                        borderColor:     theme.primaryBorder,
                      }}
                    >
                      {userInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{displayName}</p>
                      <p className="text-xs" style={{ color: theme.primaryText }}>{user.email}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Delivery address selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border shadow-sm p-5"
                style={{ borderColor: theme.primaryBorder }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
                    <MapPin size={16} style={{ color: theme.primary }} /> Delivery Address
                  </h2>
                  {/* Only show Add New for guests once email is valid, always for logged-in */}
                  {(user || isValidEmail(guestEmail)) && (
                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center gap-1 text-xs font-bold transition-colors duration-200"
                      style={{ color: theme.primary }}
                      onMouseEnter={e => { e.currentTarget.style.color = theme.primaryHover }}
                      onMouseLeave={e => { e.currentTarget.style.color = theme.primary }}
                    >
                      <Plus size={13} /> Add New
                    </button>
                  )}
                </div>

                {/* Hint that address phone number is required */}
                {hasAddress && !hasPhone && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700"
                    style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    This address has no phone number — edit it to add one before placing your order.
                  </motion.div>
                )}

                {/* Guest with no valid email yet */}
                {!user && !isValidEmail(guestEmail) ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-10 gap-2 border-2 border-dashed rounded-2xl"
                    style={{ borderColor: theme.primaryBorder }}
                  >
                    <Mail size={20} style={{ color: theme.primaryBorder }} />
                    <p className="text-sm font-bold text-gray-500">Enter your email above first</p>
                    <p className="text-xs text-gray-400">Your saved addresses will appear here</p>
                  </motion.div>
                ) : addrLoading ? (
                  <div className="flex items-center justify-center py-10 gap-2">
                    <Loader2 size={18} className="animate-spin" style={{ color: theme.primary }} />
                    <span className="text-sm" style={{ color: theme.primaryText }}>Loading addresses…</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-10 gap-3 border-2 border-dashed rounded-2xl"
                    style={{ borderColor: theme.primaryBorder }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primaryLight }}
                    >
                      <MapPin size={20} style={{ color: theme.primary }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">No saved addresses</p>
                      <p className="text-xs text-gray-400 mt-0.5">Add a delivery address to continue</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center gap-1.5 px-5 py-2 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-sm"
                      style={{ backgroundColor: theme.primary, boxShadow: `0 2px 8px ${theme.primary}40` }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.primary }}
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {addresses.map(addr => (
                        <AddressCard
                          key={addr.id}
                          addr={addr}
                          selected={addr.id === selectedAddrId}
                          onSelect={() => setSelectedAddrId(addr.id)}
                          onEdit={() => { setEditingAddr(addr); setShowModal(true) }}
                          theme={theme}
                        />
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-all duration-200"
                      style={{ borderColor: theme.primaryBorder, color: theme.primary }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor     = theme.primary
                        e.currentTarget.style.backgroundColor = `${theme.primaryLight}80`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor     = theme.primaryBorder
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <Plus size={14} /> Add Another Address
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Delivery notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border shadow-sm p-5"
                style={{ borderColor: theme.primaryBorder }}
              >
                <h2 className="font-extrabold text-gray-800 mb-3 text-sm">
                  Order Notes <span className="font-normal text-gray-400">(optional)</span>
                </h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special delivery instructions… e.g. 'Call before arrival'"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none"
                  style={{ borderColor: theme.primaryBorder }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = theme.primary
                    e.currentTarget.style.boxShadow   = `0 0 0 3px ${theme.primary}20`
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = theme.primaryBorder
                    e.currentTarget.style.boxShadow   = "none"
                  }}
                />
              </motion.div>

              {/* Delivery area notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", color: theme.primaryText }}
              >
                <div className="text-xl shrink-0">🚚</div>
                <div>
                  <p className="font-bold mb-0.5" style={{ color: "#C2410C" }}>Delivery within Oyo State Only</p>
                  <p className="text-xs leading-relaxed opacity-80">
                    We currently deliver within Oyo State only. We&apos;re working hard to expand to more
                    locations soon — stay tuned!
                  </p>
                </div>
              </motion.div>

              {/* Secure payment notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-3 rounded-2xl p-4 text-sm"
                style={{
                  backgroundColor: `${theme.primary}10`,
                  border:          `1px solid ${theme.primary}30`,
                  color:           theme.primaryText,
                }}
              >
                <div className="text-xl shrink-0">🔒</div>
                <div>
                  <p className="font-bold mb-0.5" style={{ color: theme.primary }}>Secure Payment via Paystack</p>
                  <p className="text-xs leading-relaxed opacity-80">
                    After placing your order you&apos;ll be redirected to Paystack&apos;s secure checkout to
                    complete payment. Supports cards, bank transfer, USSD and more.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── Right column: order summary ──────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-4"
            >
              <div
                className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24"
                style={{ borderColor: theme.primaryBorder }}
              >
                <h2 className="font-extrabold text-gray-800 mb-4">Order Summary</h2>

                {/* Cart items */}
                <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {cartItems.map(item => (
                      <motion.div
                        key={`${item.id}-${item.imageColor}`}
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <div
                          className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border"
                          style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }}
                        >
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{item.imageColor} · ×{item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: theme.primary }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 text-sm border-t pt-4" style={{ borderColor: theme.primaryBorder }}>
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-gray-700">{formatPrice(cartTotal)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm" style={{ color: theme.primaryText }}>
                      <span>Promo ({promoCode} · {Math.round(promoRate * 100)}%)</span>
                      <span className="font-semibold">− {formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-extrabold text-base border-t pt-2 mt-1"
                    style={{ borderColor: theme.primaryBorder }}
                  >
                    <span>Total</span>
                    <span style={{ color: theme.primary }}>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Delivering-to preview */}
                {selectedAddr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-3 rounded-xl border"
                    style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                      style={{ color: theme.primary }}
                    >
                      <MapPin size={10} /> Delivering to
                    </p>
                    <p className="text-xs font-semibold text-gray-800">{selectedAddr.fullName || displayName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatAddressLine(selectedAddr)}</p>
                    {selectedAddr.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Phone size={10} /> {selectedAddr.phoneNumber}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Blocker hints */}
                <AnimatePresence>
                  {!canOrder && !addrLoading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-1.5"
                    >
                      {!hasValidEmail && (
                        <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          Valid email address required
                        </div>
                      )}
                      {!hasAddress && (
                        <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          Delivery address required
                        </div>
                      )}
                      {hasAddress && !hasPhone && (
                        <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
                          <AlertCircle size={12} className="shrink-0" />
                          Selected address is missing a phone number
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Place order button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={isPending || addrLoading}
                  className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                  style={{
                    backgroundColor: canOrder ? theme.primary : "#9CA3AF",
                    boxShadow:       canOrder ? `0 8px 20px ${theme.primary}30` : "none",
                  }}
                  onMouseEnter={e => {
                    if (!isPending && !addrLoading && canOrder)
                      e.currentTarget.style.backgroundColor = theme.primaryHover
                  }}
                  onMouseLeave={e => {
                    if (!isPending && !addrLoading)
                      e.currentTarget.style.backgroundColor = canOrder ? theme.primary : "#9CA3AF"
                  }}
                >
                  {isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Initializing Payment…</>
                  ) : (
                    <><CheckCircle2 size={16} /> Pay {formatPrice(total)}</>
                  )}
                </motion.button>

                {/* Contextual hint below the button */}
                {!canOrder && !addrLoading && (
                  <p className="text-[11px] text-center mt-2 text-gray-400">
                    {!hasValidEmail
                      ? "Enter a valid email address above to continue"
                      : !hasAddress
                        ? "Select a delivery address above to continue"
                        : "Edit your address to add a phone number"
                    }
                  </p>
                )}
              </div>
            </motion.div>

          </div>
        </form>
      </main>

      <p className="text-center text-xs mt-4 mb-2" style={{ color: theme.primaryText }}>
        Dase Supermarket v1.0.0
      </p>
    </div>
  )
}











// "use client";
// // app/checkout/page.tsx

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { motion, AnimatePresence } from "framer-motion"
// import { useCart } from "@/context/cart-context"
// import { formatPrice } from "@/components/ProductCard"
// import { useMutation } from "@tanstack/react-query"
// import { useCurrentUser } from "@/hooks/use-current-user"
// import { useTheme } from "@/providers/theme-provider"
// import Navbar from "@/components/layout/Navbar"
// import Image from "next/image"
// import Link from "next/link"
// import {
//   ArrowLeft, MapPin, Phone, User,
//   CheckCircle2, Loader2, Plus, Edit2,
//   Home, Briefcase, Check, AlertCircle, Mail, LogIn
// } from "lucide-react"
// import { toast } from "sonner"
// import { AddressModal, type Address, type AddressForm } from "@/components/AddressModal"
// import { PhoneModal } from "@/components/PhoneModal"

// // ─── Types ────────────────────────────────────────────────────────────────────

// type Notes = string

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function formatAddressLine(addr: Address) {
//   return [addr.street, addr.town, addr.lga, addr.state].filter(Boolean).join(", ")
// }

// // ✅ NEW: email validator
// function isValidEmail(email: string) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
// }

// // ─── GuestEmailCard ──────────────────────────────────────────────────────────
// // ✅ NEW COMPONENT: shown at top of left column when user is not logged in

// function GuestEmailCard({
//   email,
//   emailError,
//   onChange,
//   theme,
// }: {
//   email: string
//   emailError: string
//   onChange: (v: string) => void
//   theme: any
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-white rounded-2xl border shadow-sm p-5"
//       style={{ borderColor: theme.primaryBorder }}
//     >
//       {/* Guest banner */}
//       <div
//         className="flex items-center justify-between p-3 rounded-xl mb-4"
//         style={{ background: theme.primaryLight, border: `1px solid ${theme.primaryBorder}` }}
//       >
//         <div className="flex items-center gap-2">
//           <User size={14} style={{ color: theme.primary }} />
//           <p className="text-xs font-bold text-gray-700">
//             Checking out as a <span style={{ color: theme.primary }}>guest</span>
//           </p>
//         </div>
//         <Link
//           href="/auth/login?callbackUrl=/checkout"
//           className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1.5 transition-all"
//           style={{ color: theme.primary, background: `${theme.primary}12` }}
//         >
//           <LogIn size={11} /> Sign in
//         </Link>
//       </div>

//       {/* Email input */}
//       <h2 className="font-extrabold text-gray-800 mb-1 flex items-center gap-2 text-sm">
//         <Mail size={15} style={{ color: theme.primary }} /> Contact Email
//       </h2>
//       <p className="text-xs text-gray-400 mb-3">
//         We&apos;ll send your order confirmation to this address.
//       </p>

//       <div
//         className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200"
//         style={{ borderColor: emailError ? "#EF4444" : theme.primaryBorder }}
//         onFocus={e => (e.currentTarget.style.borderColor = emailError ? "#EF4444" : theme.primary)}
//         onBlur={e => (e.currentTarget.style.borderColor = emailError ? "#EF4444" : theme.primaryBorder)}
//       >
//         <Mail
//           size={14}
//           className="flex-shrink-0"
//           style={{ color: emailError ? "#EF4444" : theme.primary }}
//         />
//         <input
//           type="email"
//           value={email}
//           onChange={e => onChange(e.target.value)}
//           placeholder="your@email.com"
//           className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
//         />
//         {isValidEmail(email) && (
//           <Check size={14} className="text-emerald-500 flex-shrink-0" />
//         )}
//       </div>

//       {emailError && (
//         <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
//           <AlertCircle size={11} /> {emailError}
//         </p>
//       )}
//     </motion.div>
//   )
// }

// // ─── Address card used in the selector ───────────────────────────────────────

// function AddressCard({
//   addr,
//   selected,
//   onSelect,
//   onEdit,
//   theme,
// }: {
//   addr: Address
//   selected: boolean
//   onSelect: () => void
//   onEdit: () => void
//   theme: any
// }) {
//   const Icon = addr.label === "Work" ? Briefcase : addr.label === "Other" ? MapPin : Home

//   return (
//     <motion.div
//       layout
//       onClick={onSelect}
//       className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200`}
//       style={{
//         borderColor: selected ? theme.primary : theme.primaryBorder,
//         backgroundColor: selected ? theme.primaryLight : "white",
//         boxShadow: selected ? `0 4px 12px ${theme.primary}20` : "none",
//       }}
//     >
//       {selected && (
//         <div
//           className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
//           style={{ backgroundColor: theme.primary }}
//         >
//           <Check size={11} className="text-white stroke-[3]" />
//         </div>
//       )}

//       <div className="flex items-start gap-3 pr-6">
//         <div
//           className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
//           style={{ backgroundColor: selected ? `${theme.primary}20` : theme.primaryLight }}
//         >
//           <Icon size={16} style={{ color: selected ? theme.primary : theme.primaryText }} />
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 flex-wrap">
//             <span
//               className="text-sm font-bold transition-colors duration-200"
//               style={{ color: selected ? theme.primary : "#1f2937" }}
//             >
//               {addr.label ?? "Address"}
//             </span>
//             {addr.isDefault && (
//               <span
//                 className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
//                 style={{
//                   color: theme.primaryText,
//                   backgroundColor: `${theme.primary}20`,
//                   border: `1px solid ${theme.primaryBorder}`,
//                 }}
//               >
//                 Default
//               </span>
//             )}
//           </div>

//           {addr.fullName && (
//             <p className="text-xs font-semibold text-gray-700 mt-0.5">{addr.fullName}</p>
//           )}
//           <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{formatAddressLine(addr)}</p>
//           {addr.phoneNumber && (
//             <p className="text-xs text-gray-400 mt-0.5">{addr.phoneNumber}</p>
//           )}
//         </div>
//       </div>

//       <button
//         onClick={e => { e.stopPropagation(); onEdit() }}
//         className="absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors duration-200"
//         style={{ backgroundColor: selected ? `${theme.primary}10` : "transparent" }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.backgroundColor = selected ? `${theme.primary}20` : theme.primaryLight
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.backgroundColor = selected ? `${theme.primary}10` : "transparent"
//         }}
//       >
//         <Edit2 size={12} style={{ color: selected ? theme.primary : theme.primaryText }} />
//       </button>
//     </motion.div>
//   )
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export default function CheckoutPage() {
//   const router = useRouter()
//   const user = useCurrentUser()
//   const { theme } = useTheme()
//   const { cartItems, cartTotal, cartCount, clearCart, promoCode, promoDiscount, promoRate } = useCart()

//   const delivery = cartTotal >= 5000 ? 0 : 500
//   const total    = cartTotal - promoDiscount

//   // ✅ NEW: guest email state
//   const [guestEmail, setGuestEmail] = useState("")
//   const [emailError, setEmailError] = useState("")

//   // ✅ NEW: the email we pass to Paystack — user's account email or guest-supplied email
//   const effectiveEmail = user?.email ?? guestEmail.trim()

//   // ── Address state ──────────────────────────────────────────────────────────
//   const [addresses, setAddresses]           = useState<Address[]>([])
//   const [addrLoading, setAddrLoading]       = useState(true)
//   const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null)
//   const [showModal, setShowModal]           = useState(false)
//   const [editingAddr, setEditingAddr]       = useState<Address | null>(null)
//   const [notes, setNotes]                   = useState<Notes>("")

//   // ── Phone state ────────────────────────────────────────────────────────────
//   const [showPhoneModal, setShowPhoneModal] = useState(false)
//   const [localPhone, setLocalPhone]         = useState<string | null>(user?.phonenumber ?? null)

//   const selectedAddr = addresses.find(a => a.id === selectedAddrId) ?? null

//   const displayName  = user?.name || (user?.email?.split('@')[0]) || "Guest"
//   const userInitials = displayName
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase()

//   // Sync phone if user loads after mount
//   useEffect(() => {
//     if (user?.phonenumber && !localPhone) setLocalPhone(user.phonenumber)
//   }, [user?.phonenumber])

//   // ── Fetch addresses ────────────────────────────────────────────────────────
//  // ── replace the existing address-fetch useEffect ──────────────────────────
// useEffect(() => {
//   // Logged-in user: fetch immediately as before
//   if (user) {
//     ;(async () => {
//       setAddrLoading(true)
//       try {
//         const res  = await fetch("/api/addresses")
//         if (res.ok) {
//           const data = await res.json()
//           const list: Address[] = data.addresses ?? []
//           setAddresses(list)
//           const def = list.find(a => a.isDefault) ?? list[0]
//           if (def) setSelectedAddrId(def.id)
//         }
//       } catch {
//         toast.error("Could not load your addresses")
//       } finally {
//         setAddrLoading(false)
//       }
//     })()
//     return
//   }

//   // Guest: fetch only once we have a valid email
//   if (!isValidEmail(guestEmail)) {
//     setAddrLoading(false)
//     return
//   }

//   ;(async () => {
//     setAddrLoading(true)
//     try {
//       const res = await fetch(`/api/addresses?guestEmail=${encodeURIComponent(guestEmail.trim())}`)
//       if (res.ok) {
//         const data = await res.json()
//         const list: Address[] = data.addresses ?? []
//         setAddresses(list)
//         const def = list.find(a => a.isDefault) ?? list[0]
//         if (def) setSelectedAddrId(def.id)
//       }
//     } catch {
//       // silently ignore — guest simply starts with no addresses
//     } finally {
//       setAddrLoading(false)
//     }
//   })()
// }, [user, guestEmail]) // re-runs when guest types a valid email

//   // ✅ NEW: for guests addrLoading stays true forever unless we reset it
//   useEffect(() => {
//     if (!user) setAddrLoading(false)
//   }, [user])

//   // ── Address CRUD ───────────────────────────────────────────────────────────
//   const handleSaveAddress = async (form: AddressForm) => {
//     const method = editingAddr ? "PATCH" : "POST"
//     const url    = editingAddr ? `/api/addresses/${editingAddr.id}` : "/api/addresses"
//     const res    = await fetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//        body: JSON.stringify({
//       ...form,
//       // threads guestEmail so the API can identify the guest
//       ...(!user && { guestEmail: guestEmail.trim() }),
//     }),
//     })
//     if (res.ok) {
//       const data = await res.json()
//       if (editingAddr) {
//         setAddresses(prev => prev.map(a => (a.id === editingAddr.id ? data.address : a)))
//       } else {
//         setAddresses(prev => [...prev, data.address])
//         setSelectedAddrId(data.address.id)
//       }
//       toast.success(editingAddr ? "Address updated ✓" : "Address saved ✓")
//       setShowModal(false)
//       setEditingAddr(null)
//     } else {
//       toast.error("Could not save address")
//     }
//   }

//   const handleDeleteAddress = async (id: string) => {
//     if (!confirm("Delete this address?")) return
//     const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" })
//     if (res.ok) {
//       setAddresses(prev => prev.filter(a => a.id !== id))
//       if (selectedAddrId === id) {
//         const remaining = addresses.filter(a => a.id !== id)
//         const def = remaining.find(a => a.isDefault) ?? remaining[0]
//         setSelectedAddrId(def?.id || null)
//       }
//       toast.success("Address removed")
//     } else {
//       toast.error("Could not delete address")
//     }
//   }

//   // ── Phone save ─────────────────────────────────────────────────────────────
//   const handleSavePhone = async (phone: string) => {
//     const res = await fetch("/api/user/phone", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ phone }),
//     })
//     if (!res.ok) throw new Error("Failed to save phone number")
//     setLocalPhone(phone)
//     setShowPhoneModal(false)
//     toast.success("Phone number saved ✓")
//   }

//   // ── Derived guard states ───────────────────────────────────────────────────
//   const hasPhone      = Boolean(localPhone)
//   const hasAddress    = Boolean(selectedAddrId)
//   // ✅ NEW: guests must have a valid email; logged-in users always pass this check
//   const hasValidEmail = user ? true : isValidEmail(guestEmail)
//   const canOrder      = hasValidEmail && hasPhone && hasAddress

//   // ── Initialize payment ─────────────────────────────────────────────────────
//   const { mutate: initializePayment, isPending } = useMutation({
//     mutationFn: async () => {
//       if (!selectedAddr) throw new Error("No address selected")

//       // ✅ NEW: re-validate guest email inside mutationFn as a safety net
//       if (!user && !isValidEmail(guestEmail)) {
//         setEmailError("Please enter a valid email address")
//         throw new Error("Invalid email")
//       }

//       const items = cartItems.map(item => {
//         const isFood = item.itemType === "food"
//         return {
//           productId:      isFood ? null : item.id,
//           foodId:         isFood ? item.id : null,
//           name:           item.name,
//           description:    item.description  ?? "",
//           category:       item.category     ?? "",
//           brand:          item.brand        ?? "",
//           quantity:       item.quantity,
//           price:          item.price,
//           imageColor:     item.imageColor   ?? "default",
//           imageColorCode: item.imageColorCode ?? "#000000",
//           imageUrl:       item.imageUrl     ?? "",
//         }
//       })

//       const res = await fetch("/api/paystack/initialize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount:      total,
//           // ✅ NEW: always pass the effective email so Paystack always gets one
//           email:       effectiveEmail,
//           // ✅ NEW: stored on Order.guestEmail for guest order tracking
//           guestEmail:  user ? null : guestEmail.trim(),
//           addressId:   selectedAddr.id,
//           address:     formatAddressLine(selectedAddr),
//           phoneNumber: selectedAddr.phoneNumber ?? localPhone ?? "",
//           notes,       // ✅ NEW: pass delivery notes
//           items,
//         }),
//       })

//       if (!res.ok) {
//         const errorData = await res.json()
//         throw new Error(errorData.error || "Failed to initialize payment")
//       }

//       return res.json()
//     },
//     onSuccess: (data) => {
//       clearCart()
//       toast.success("Redirecting to payment…")
//       if (data.paymentUrl) {
//         window.location.href = data.paymentUrl
//       } else {
//         toast.error("No payment URL received")
//       }
//     },
//     onError: (e: any) => {
//       toast.error(e?.message || "Failed to initialize payment. Please try again.")
//     },
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // ✅ NEW: validate guest email first
//     if (!user) {
//       if (!guestEmail.trim()) {
//         setEmailError("Email is required to place an order")
//         return
//       }
//       if (!isValidEmail(guestEmail)) {
//         setEmailError("Please enter a valid email address")
//         return
//       }
//     }

//     if (!hasPhone) {
//       toast.error("Please add a phone number before placing an order")
//       setShowPhoneModal(true)
//       return
//     }
//     if (!hasAddress || !selectedAddr) {
//       toast.error("Please select a delivery address")
//       return
//     }
//     if (cartItems.length === 0) {
//       toast.error("Your cart is empty")
//       return
//     }
//     initializePayment()
//   }

//   // ── Guards ─────────────────────────────────────────────────────────────────
//   // ✅ REMOVED: the `if (!user)` redirect — guests are now allowed through

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
//         <Navbar />
//         <main className="flex-1 flex items-center justify-center px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center"
//           >
//             <div
//               className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
//               style={{ backgroundColor: theme.primaryLight }}
//             >
//               <MapPin size={32} style={{ color: theme.primaryBorder }} />
//             </div>
//             <p className="text-gray-500 mb-4">Your cart is empty</p>
//             <Link
//               href="/shop"
//               className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
//               style={{ backgroundColor: theme.primary, color: "white" }}
//               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
//               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
//             >
//               Browse products
//             </Link>
//           </motion.div>
//         </main>
//       </div>
//     )
//   }

//   // ─── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${theme.primaryLight}60` }}>
//       <Navbar />

//       {/* Modals */}
//       <AnimatePresence>
//         {showModal && (
//           <AddressModal
//             address={editingAddr}
//             onClose={() => { setShowModal(false); setEditingAddr(null) }}
//             onSave={handleSaveAddress}
//             onDelete={editingAddr ? () => handleDeleteAddress(editingAddr.id) : undefined}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showPhoneModal && (
//           <PhoneModal
//             currentPhone={localPhone}
//             theme={theme}
//             onClose={() => setShowPhoneModal(false)}
//             onSave={handleSavePhone}
//           />
//         )}
//       </AnimatePresence>

//       <main className="flex-1 max-w-6xl mx-auto px-4 md:px-12 py-8 w-full">

//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/cart"
//             className="flex items-center gap-1.5 text-sm transition-colors mb-4 w-fit duration-200"
//             style={{ color: theme.primaryText }}
//             onMouseEnter={(e) => { e.currentTarget.style.color = theme.primary }}
//             onMouseLeave={(e) => { e.currentTarget.style.color = theme.primaryText }}
//           >
//             <ArrowLeft size={14} /> Back to Cart
//           </Link>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Checkout</h1>
//           {/* ✅ UPDATED: subtitle changes based on auth state */}
//           <p className="text-gray-400 text-sm mt-0.5">
//             {user
//               ? "Review your order and confirm delivery details"
//               : "You're checking out as a guest"
//             }
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//             {/* ── Left column ───────────────────────────────────────── */}
//             <div className="lg:col-span-2 flex flex-col gap-5">

//               {/* ✅ UPDATED: step 1 — guest sees email card, user sees account card */}
//               {!user ? (
//                 <GuestEmailCard
//                   email={guestEmail}
//                   emailError={emailError}
//                   onChange={(v) => { setGuestEmail(v); setEmailError("") }}
//                   theme={theme}
//                 />
//               ) : (
//                 /* Who's ordering + phone — unchanged, only shown to logged-in users */
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="bg-white rounded-2xl border shadow-sm p-5"
//                   style={{ borderColor: theme.primaryBorder }}
//                 >
//                   <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
//                     <User size={16} style={{ color: theme.primary }} /> Ordering As
//                   </h2>

//                   <div className="flex items-center gap-3 mb-4">
//                     <div
//                       className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0"
//                       style={{
//                         backgroundColor: theme.primaryLight,
//                         color: theme.primary,
//                         borderColor: theme.primaryBorder,
//                       }}
//                     >
//                       {userInitials}
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold text-gray-800">{displayName}</p>
//                       <p className="text-xs" style={{ color: theme.primaryText }}>{user.email}</p>
//                     </div>
//                   </div>

//                   {/* Phone number row */}
//                   <div
//                     className="flex items-center justify-between rounded-xl px-3.5 py-3 border"
//                     style={{
//                       borderColor: hasPhone ? theme.primaryBorder : "#FCA5A5",
//                       backgroundColor: hasPhone ? theme.primaryLight : "#FEF2F2",
//                     }}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <div
//                         className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
//                         style={{ backgroundColor: hasPhone ? `${theme.primary}20` : "#FEE2E2" }}
//                       >
//                         <Phone size={13} style={{ color: hasPhone ? theme.primary : "#EF4444" }} />
//                       </div>
//                       <div>
//                         <p className="text-xs font-semibold text-gray-700">
//                           {hasPhone ? localPhone : "No phone number"}
//                         </p>
//                         <p className="text-[10px] text-gray-400">
//                           {hasPhone ? "Contact for delivery" : "Required to place an order"}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={() => setShowPhoneModal(true)}
//                       className="flex items-center gap-1 text-xs font-bold shrink-0 transition-colors duration-200 px-2.5 py-1.5 rounded-lg"
//                       style={{
//                         color: hasPhone ? theme.primary : "#EF4444",
//                         backgroundColor: hasPhone ? `${theme.primary}10` : "#FEE2E2",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.backgroundColor = hasPhone ? `${theme.primary}20` : "#FECACA"
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.backgroundColor = hasPhone ? `${theme.primary}10` : "#FEE2E2"
//                       }}
//                     >
//                       {hasPhone ? <><Edit2 size={11} /> Edit</> : <><Plus size={11} /> Add</>}
//                     </button>
//                   </div>

//                   <AnimatePresence>
//                     {!hasPhone && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0, marginTop: 0 }}
//                         animate={{ opacity: 1, height: "auto", marginTop: 8 }}
//                         exit={{ opacity: 0, height: 0, marginTop: 0 }}
//                         className="flex items-center gap-2 text-xs text-red-600 font-medium"
//                       >
//                         <AlertCircle size={13} className="shrink-0" />
//                         A phone number is required to place an order.
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </motion.div>
//               )}

//               {/* Delivery address selector — unchanged */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1 }}
//                 className="bg-white rounded-2xl border shadow-sm p-5"
//                 style={{ borderColor: theme.primaryBorder }}
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
//                     <MapPin size={16} style={{ color: theme.primary }} /> Delivery Address
//                   </h2>
//                   <button
//                     type="button"
//                     onClick={() => { setEditingAddr(null); setShowModal(true) }}
//                     className="flex items-center gap-1 text-xs font-bold transition-colors duration-200"
//                     style={{ color: theme.primary }}
//                     onMouseEnter={(e) => { e.currentTarget.style.color = theme.primaryHover }}
//                     onMouseLeave={(e) => { e.currentTarget.style.color = theme.primary }}
//                   >
//                     <Plus size={13} /> Add New
//                   </button>
//                 </div>

//                 {addrLoading ? (
//                   <div className="flex items-center justify-center py-10 gap-2">
//                     <Loader2 size={18} className="animate-spin" style={{ color: theme.primary }} />
//                     <span className="text-sm" style={{ color: theme.primaryText }}>Loading your addresses…</span>
//                   </div>
//                 ) : addresses.length === 0 ? (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="flex flex-col items-center py-10 gap-3 border-2 border-dashed rounded-2xl"
//                     style={{ borderColor: theme.primaryBorder }}
//                   >
//                     <div
//                       className="w-12 h-12 rounded-full flex items-center justify-center"
//                       style={{ backgroundColor: theme.primaryLight }}
//                     >
//                       <MapPin size={20} style={{ color: theme.primary }} />
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm font-bold text-gray-700">No saved addresses</p>
//                       <p className="text-xs text-gray-400 mt-0.5">Add a delivery address to continue</p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => { setEditingAddr(null); setShowModal(true) }}
//                       className="flex items-center gap-1.5 px-5 py-2 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-sm"
//                       style={{ backgroundColor: theme.primary, boxShadow: `0 2px 8px ${theme.primary}40` }}
//                       onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
//                       onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
//                     >
//                       <Plus size={14} /> Add Address
//                     </button>
//                   </motion.div>
//                 ) : (
//                   <div className="flex flex-col gap-3">
//                     <AnimatePresence>
//                       {addresses.map(addr => (
//                         <AddressCard
//                           key={addr.id}
//                           addr={addr}
//                           selected={addr.id === selectedAddrId}
//                           onSelect={() => setSelectedAddrId(addr.id)}
//                           onEdit={() => { setEditingAddr(addr); setShowModal(true) }}
//                           theme={theme}
//                         />
//                       ))}
//                     </AnimatePresence>

//                     <button
//                       type="button"
//                       onClick={() => { setEditingAddr(null); setShowModal(true) }}
//                       className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-all duration-200"
//                       style={{ borderColor: theme.primaryBorder, color: theme.primary }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.borderColor = theme.primary
//                         e.currentTarget.style.backgroundColor = `${theme.primaryLight}80`
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.borderColor = theme.primaryBorder
//                         e.currentTarget.style.backgroundColor = "transparent"
//                       }}
//                     >
//                       <Plus size={14} /> Add Another Address
//                     </button>
//                   </div>
//                 )}
//               </motion.div>

//               {/* ✅ NEW: guest phone card — only shown when not logged in */}
//               {!user && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.15 }}
//                   className="bg-white rounded-2xl border shadow-sm p-5"
//                   style={{ borderColor: theme.primaryBorder }}
//                 >
//                   <h2 className="font-extrabold text-gray-800 mb-3 text-sm flex items-center gap-2">
//                     <Phone size={15} style={{ color: theme.primary }} /> Phone Number
//                   </h2>
//                   <div
//                     className="flex items-center justify-between rounded-xl px-3.5 py-3 border"
//                     style={{
//                       borderColor:     hasPhone ? theme.primaryBorder : "#FCA5A5",
//                       backgroundColor: hasPhone ? theme.primaryLight : "#FEF2F2",
//                     }}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <div
//                         className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
//                         style={{ backgroundColor: hasPhone ? `${theme.primary}20` : "#FEE2E2" }}
//                       >
//                         <Phone size={13} style={{ color: hasPhone ? theme.primary : "#EF4444" }} />
//                       </div>
//                       <div>
//                         <p className="text-xs font-semibold text-gray-700">
//                           {hasPhone ? localPhone : "No phone number"}
//                         </p>
//                         <p className="text-[10px] text-gray-400">
//                           {hasPhone ? "Contact for delivery" : "Required to place an order"}
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowPhoneModal(true)}
//                       className="flex items-center gap-1 text-xs font-bold shrink-0 px-2.5 py-1.5 rounded-lg transition-colors duration-200"
//                       style={{
//                         color:           hasPhone ? theme.primary : "#EF4444",
//                         backgroundColor: hasPhone ? `${theme.primary}10` : "#FEE2E2",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.backgroundColor = hasPhone ? `${theme.primary}20` : "#FECACA"
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.backgroundColor = hasPhone ? `${theme.primary}10` : "#FEE2E2"
//                       }}
//                     >
//                       {hasPhone ? <><Edit2 size={11} /> Edit</> : <><Plus size={11} /> Add</>}
//                     </button>
//                   </div>
//                   {!hasPhone && (
//                     <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
//                       <AlertCircle size={11} /> Required for delivery confirmation
//                     </p>
//                   )}
//                 </motion.div>
//               )}

//               {/* Delivery notes — unchanged */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="bg-white rounded-2xl border shadow-sm p-5"
//                 style={{ borderColor: theme.primaryBorder }}
//               >
//                 <h2 className="font-extrabold text-gray-800 mb-3 text-sm">
//                   Order Notes{" "}
//                   <span className="font-normal text-gray-400">(optional)</span>
//                 </h2>
//                 <textarea
//                   value={notes}
//                   onChange={e => setNotes(e.target.value)}
//                   rows={2}
//                   placeholder="Any special delivery instructions… e.g. 'Call before arrival'"
//                   className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none"
//                   style={{ borderColor: theme.primaryBorder }}
//                   onFocus={(e) => {
//                     e.currentTarget.style.borderColor = theme.primary
//                     e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`
//                   }}
//                   onBlur={(e) => {
//                     e.currentTarget.style.borderColor = theme.primaryBorder
//                     e.currentTarget.style.boxShadow = "none"
//                   }}
//                 />
//               </motion.div>

//               {/* Delivery area notice — unchanged */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="flex items-start gap-3 rounded-2xl p-4 text-sm"
//                 style={{ backgroundColor: `#FFF7ED`, border: `1px solid #FED7AA`, color: theme.primaryText }}
//               >
//                 <div className="text-xl shrink-0">🚚</div>
//                 <div>
//                   <p className="font-bold mb-0.5" style={{ color: "#C2410C" }}>Delivery within Oyo State Only</p>
//                   <p className="text-xs leading-relaxed opacity-80">
//                     We currently deliver within Oyo State only. We're working hard to expand to more
//                     locations soon — stay tuned!
//                   </p>
//                 </div>
//               </motion.div>

//               {/* Secure payment notice — unchanged */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.25 }}
//                 className="flex items-start gap-3 rounded-2xl p-4 text-sm"
//                 style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}30`, color: theme.primaryText }}
//               >
//                 <div className="text-xl shrink-0">🔒</div>
//                 <div>
//                   <p className="font-bold mb-0.5" style={{ color: theme.primary }}>Secure Payment via Paystack</p>
//                   <p className="text-xs leading-relaxed opacity-80">
//                     After placing your order you'll be redirected to Paystack's secure checkout to
//                     complete payment. Supports cards, bank transfer, USSD and more.
//                   </p>
//                 </div>
//               </motion.div>
//             </div>

//             {/* ── Right column: order summary ──────────────────────── */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.15 }}
//               className="flex flex-col gap-4"
//             >
//               <div
//                 className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24"
//                 style={{ borderColor: theme.primaryBorder }}
//               >
//                 <h2 className="font-extrabold text-gray-800 mb-4">Order Summary</h2>

//                 {/* Items — unchanged */}
//                 <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto pr-1">
//                   <AnimatePresence>
//                     {cartItems.map(item => (
//                       <motion.div
//                         key={`${item.id}-${item.imageColor}`}
//                         className="flex gap-3"
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0 }}
//                       >
//                         <div
//                           className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border"
//                           style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }}
//                         >
//                           <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name}</p>
//                           <p className="text-[10px] text-gray-400">{item.imageColor} · ×{item.quantity}</p>
//                         </div>
//                         <span className="text-xs font-bold flex-shrink-0" style={{ color: theme.primary }}>
//                           {formatPrice(item.price * item.quantity)}
//                         </span>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                 </div>

//                 {/* Totals — unchanged */}
//                 <div className="flex flex-col gap-2 text-sm border-t pt-4" style={{ borderColor: theme.primaryBorder }}>
//                   <div className="flex justify-between text-gray-500">
//                     <span>Subtotal ({cartCount} items)</span>
//                     <span className="font-semibold text-gray-700">{formatPrice(cartTotal)}</span>
//                   </div>
//                   {promoDiscount > 0 && (
//                     <div className="flex justify-between text-sm" style={{ color: theme.primaryText }}>
//                       <span>Promo ({promoCode} · {Math.round(promoRate * 100)}%)</span>
//                       <span className="font-semibold">− {formatPrice(promoDiscount)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-1" style={{ borderColor: theme.primaryBorder }}>
//                     <span>Total</span>
//                     <span style={{ color: theme.primary }}>{formatPrice(total)}</span>
//                   </div>
//                 </div>

//                 {/* Delivery summary preview — unchanged */}
//                 {selectedAddr && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     className="mt-4 p-3 rounded-xl border"
//                     style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }}
//                   >
//                     <p
//                       className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"
//                       style={{ color: theme.primary }}
//                     >
//                       <MapPin size={10} /> Delivering to
//                     </p>
//                     <p className="text-xs font-semibold text-gray-800">{selectedAddr.fullName || displayName}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{formatAddressLine(selectedAddr)}</p>
//                     {(selectedAddr.phoneNumber || localPhone) && (
//                       <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
//                         <Phone size={10} /> {selectedAddr.phoneNumber ?? localPhone}
//                       </p>
//                     )}
//                   </motion.div>
//                 )}

//                 {/* ✅ UPDATED: blocker hints now include email check */}
//                 <AnimatePresence>
//                   {!canOrder && !addrLoading && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="mt-3 space-y-1.5"
//                     >
//                       {!hasValidEmail && (
//                         <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
//                           <AlertCircle size={12} className="shrink-0" />
//                           Valid email address required
//                         </div>
//                       )}
//                       {!hasPhone && (
//                         <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
//                           <AlertCircle size={12} className="shrink-0" />
//                           Phone number required
//                         </div>
//                       )}
//                       {!hasAddress && (
//                         <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium">
//                           <AlertCircle size={12} className="shrink-0" />
//                           Delivery address required
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Place order button — unchanged */}
//                 <motion.button
//                   type="submit"
//                   whileTap={{ scale: 0.98 }}
//                   disabled={isPending || addrLoading}
//                   className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
//                   style={{
//                     backgroundColor: canOrder ? theme.primary : "#9CA3AF",
//                     boxShadow: canOrder ? `0 8px 20px ${theme.primary}30` : "none",
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!isPending && !addrLoading && canOrder) {
//                       e.currentTarget.style.backgroundColor = theme.primaryHover
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!isPending && !addrLoading) {
//                       e.currentTarget.style.backgroundColor = canOrder ? theme.primary : "#9CA3AF"
//                     }
//                   }}
//                 >
//                   {isPending ? (
//                     <><Loader2 size={16} className="animate-spin" /> Initializing Payment…</>
//                   ) : (
//                     <><CheckCircle2 size={16} /> Pay {formatPrice(total)}</>
//                   )}
//                 </motion.button>

//                 {/* ✅ UPDATED: hint line covers all three missing conditions */}
//                 {!canOrder && !addrLoading && (
//                   <p className="text-[11px] text-center mt-2 text-gray-400">
//                     {!hasValidEmail
//                       ? "Enter a valid email address above to continue"
//                       : !hasPhone && !hasAddress
//                         ? "Add a phone number and delivery address above"
//                         : !hasPhone
//                           ? "Add a phone number above to continue"
//                           : "Select a delivery address above to continue"
//                     }
//                   </p>
//                 )}
//               </div>
//             </motion.div>

//           </div>
//         </form>
//       </main>

//       <p className="text-center text-xs mt-4 mb-2" style={{ color: theme.primaryText }}>
//         Dase Supermarket v1.0.0
//       </p>
//     </div>
//   )
// }