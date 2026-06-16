"use client";
// app/profile/page.tsx  — uses shared AddressModal + PhoneModal

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Mail, Phone, MapPin, ShoppingBag, Star, Heart,
  Clock, Bell, Moon, Globe, Lock, Shield, HelpCircle,
  FileText, ShieldCheck, LogOut, ChevronRight, Camera,
  Plus, Trash2, CheckCircle, Edit2, X, Loader2, Home, Briefcase,
} from "lucide-react"
import { AddressModal, type Address, type AddressForm } from "@/components/AddressModal"
import { PhoneModal } from "@/components/PhoneModal"
import { useTheme } from "@/providers/theme-provider"
import { useCurrentUser } from "@/hooks/use-current-user"

// ─── Stat badge ───────────────────────────────────────────────────────────────

function StatItem({ label, value, themeColor }: { label: string; value: string; themeColor: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-black" style={{ color: themeColor }}>{value}</span>
      <span className="text-[11px] text-white/80">{label}</span>
    </div>
  )
}

// ─── Row item ─────────────────────────────────────────────────────────────────

function RowItem({
  icon: Icon, iconBg, iconColor, label, value, onClick, danger, rightNode, disabled, theme,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor?: string
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
  rightNode?: React.ReactNode
  disabled?: boolean
  theme: any
}) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-3.5 border-b last:border-0 text-left transition-all duration-200 ${
        onClick ? "hover:bg-opacity-50 active:bg-opacity-100 cursor-pointer" : ""
      } ${disabled ? "opacity-50" : ""}`}
      style={{ borderColor: theme.primaryBorder }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = `${theme.primaryLight}80`
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = "transparent"
        }
      }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon
          className={`w-[17px] h-[17px] ${iconColor ?? (danger ? "text-red-500" : "")}`}
          style={{ color: danger ? undefined : iconColor ? undefined : theme.primary }}
        />
      </div>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>{label}</span>
      <div className="flex items-center gap-1.5 max-w-[160px]">
        {value && (
          <span
            className={`text-xs truncate ${
              value === "Tap to add" ? "font-semibold" : "text-gray-400"
            }`}
            style={{ color: value === "Tap to add" ? theme.primary : undefined }}
          >
            {value}
          </span>
        )}
        {rightNode}
        {onClick && !rightNode && <ChevronRight className="w-4 h-4 text-gray-300" style={{ color: theme.primaryBorder }} />}
      </div>
    </Wrapper>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, loading, theme }: { checked: boolean; onChange: () => void; loading?: boolean; theme: any }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${loading ? "opacity-50" : ""}`}
      style={{ backgroundColor: checked ? theme.primary : "#E5E7EB" }}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      {loading && <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin" />}
    </button>
  )
}

// ─── Section head ─────────────────────────────────────────────────────────────

function SectionHead({ title, theme }: { title: string; theme: any }) {
  if (!title) return <div className="mt-1" />
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest mt-5 mb-2 px-1" style={{ color: theme.primaryText }}>
      {title}
    </p>
  )
}

function Card({ children, theme }: { children: React.ReactNode; theme: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border shadow-sm overflow-hidden"
      style={{ borderColor: theme.primaryBorder }}
    >
      {children}
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = "account" | "activity" | "settings"

export default function ProfilePage() {
  const { theme } = useTheme()
  const user = useCurrentUser()

  const [activeTab, setActiveTab]       = useState<Tab>("account")
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(user?.image ?? null)
  const [addresses, setAddresses]       = useState<Address[]>([])
  const [addrLoading, setAddrLoading]   = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [editingAddr, setEditingAddr]   = useState<Address | null>(null)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [toast, setToast]               = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const fileRef                         = useRef<HTMLInputElement>(null)

  // ── Phone modal state ──────────────────────────────────────────────────────
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  // Local optimistic phone state so the row updates immediately after save
  const [localPhone, setLocalPhone] = useState<string | null>(user?.phonenumber ?? null)

  useEffect(() => { if (user?.image) setAvatarUrl(user.image) }, [user?.image])
  useEffect(() => { if (user?.phonenumber) setLocalPhone(user.phonenumber) }, [user?.phonenumber])

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifEnabled(Notification.permission === "granted")
    }
  }, [])

  useEffect(() => {
    if (activeTab === "account") fetchAddresses()
  }, [activeTab])

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Address helpers ────────────────────────────────────────────────────────

  const fetchAddresses = async () => {
    setAddrLoading(true)
    try {
      const res = await fetch("/api/addresses")
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses ?? [])
      }
    } catch { /* silent */ }
    finally { setAddrLoading(false) }
  }

  const handleSaveAddress = async (form: AddressForm) => {
    const method = editingAddr ? "PATCH" : "POST"
    const url    = editingAddr ? `/api/addresses/${editingAddr.id}` : "/api/addresses"
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      showToast(editingAddr ? "Address updated ✓" : "Address saved ✓")
      setShowModal(false)
      setEditingAddr(null)
      fetchAddresses()
    } else {
      showToast("Could not save address", "err")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" })
    if (res.ok) {
      showToast("Address removed")
      setAddresses(a => a.filter(x => x.id !== id))
    } else {
      showToast("Could not delete address", "err")
    }
  }

  // ── Phone save ─────────────────────────────────────────────────────────────

  const handleSavePhone = async (phone: string) => {
    const res = await fetch("/api/user/phone", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
    if (!res.ok) throw new Error("Failed to save phone number")
    setLocalPhone(phone)
    setShowPhoneModal(false)
    showToast("Phone number saved ✓")
  }

  // ── Push notifications ─────────────────────────────────────────────────────

  const handleToggleNotif = async () => {
    if (notifLoading) return
    setNotifLoading(true)
    try {
      if (notifEnabled) {
        await fetch("/api/fcm-token", { method: "DELETE" })
        setNotifEnabled(false)
        showToast("Notifications disabled")
      } else {
        if (!("Notification" in window)) { showToast("Browser does not support notifications", "err"); return }
        const permission = await Notification.requestPermission()
        if (permission !== "granted") { showToast("Notification permission denied", "err"); return }
        const fcmToken = null
        if (fcmToken) {
          await fetch("/api/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: fcmToken }),
          })
        }
        setNotifEnabled(true)
        showToast("🔔 Notifications enabled")
      }
    } catch {
      showToast("Could not update notification settings", "err")
    } finally {
      setNotifLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUrl(URL.createObjectURL(file))
    // TODO: upload to Cloudinary / S3 then PATCH /api/user/avatar
  }

  const displayName = user?.name || (user?.email?.split('@')[0]) || "Dase User"
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const tabs: { key: Tab; label: string }[] = [
    { key: "account",  label: "Account"  },
    { key: "activity", label: "Activity" },
    { key: "settings", label: "Settings" },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `${theme.primaryLight}60` }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <User className="w-10 h-10" style={{ color: theme.primaryBorder }} />
          </div>
          <p className="text-lg font-bold text-gray-700">Not signed in</p>
          <a
            href="/auth/login"
            className="inline-block px-8 py-3 text-white font-bold rounded-full transition-all duration-200"
            style={{ backgroundColor: theme.primary, boxShadow: `0 4px 12px ${theme.primary}40` }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
          >
            Sign In
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${theme.primaryLight}60` }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
              toast.type === "ok" ? "bg-emerald-600" : "bg-red-500"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address modal */}
      <AnimatePresence>
        {showModal && (
          <AddressModal
            address={editingAddr}
            onClose={() => { setShowModal(false); setEditingAddr(null) }}
            onSave={handleSaveAddress}
          />
        )}
      </AnimatePresence>

      {/* Phone modal */}
      <AnimatePresence>
        {showPhoneModal && (
          <PhoneModal
            currentPhone={localPhone}
            theme={theme}
            onClose={() => setShowPhoneModal(false)}
            onSave={handleSavePhone}
          />
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto pb-16">

        {/* Hero header */}
       <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="relative px-5 pt-8 pb-6 bg-white border-b"
  style={{
    borderColor: theme.primaryBorder,
  }}
>
  <div className="flex flex-col items-center gap-2">
    <div className="relative">
      <div
        className="w-20 h-20 rounded-full border-[3px] overflow-hidden"
        style={{
          borderColor: theme.primaryBorder,
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: theme.primary,
            }}
          >
            <span className="text-2xl font-black text-white">
              {initials}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          border: `2px solid ${theme.primary}`,
        }}
      >
        <Camera
          className="w-3.5 h-3.5"
          style={{ color: theme.primary }}
        />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>

    <h1
      className="text-xl font-black mt-1"
      style={{ color: theme.primaryText }}
    >
      {displayName}
    </h1>

    {user?.email && (
      <p className="text-sm text-gray-500 flex items-center gap-1">
        <Mail size={12} />
        {user.email}
      </p>
    )}
  </div>

  <div
    className="flex justify-around rounded-2xl py-3.5 mt-5 px-4 border"
    style={{
      backgroundColor: theme.primaryLight,
      borderColor: theme.primaryBorder,
    }}
  >
    <StatItem
      label="Orders"
      value="–"
      themeColor={theme.primary}
    />

    <div
      className="w-px"
      style={{ backgroundColor: theme.primaryBorder }}
    />

    <StatItem
      label="Reviews"
      value="–"
      themeColor={theme.primary}
    />

    <div
      className="w-px"
      style={{ backgroundColor: theme.primaryBorder }}
    />

    <StatItem
      label="Points"
      value="0"
      themeColor={theme.primary}
    />
  </div>
</motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 mx-4 mt-4 mb-1 p-1 rounded-2xl border" style={{ borderColor: theme.primaryBorder }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key ? "text-white font-bold shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              style={{ backgroundColor: activeTab === tab.key ? theme.primary : "transparent" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Account Tab ── */}
        {activeTab === "account" && (
          <div className="px-4 mt-1">
            <SectionHead title="Personal Information" theme={theme} />
            <Card theme={theme}>
              <RowItem
                icon={User}
                iconBg="bg-amber-50"
                label="Full Name"
                value={displayName}
                theme={theme}
              />
              <RowItem
                icon={Mail}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                label="Email"
                value={user?.email ?? "—"}
                theme={theme}
              />
              {/* Phone row — opens PhoneModal */}
              <RowItem
                icon={Phone}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                label="Phone"
                value={localPhone || "Tap to add"}
                onClick={() => setShowPhoneModal(true)}
                theme={theme}
              />
            </Card>

            {/* Addresses */}
            <div className="flex items-center justify-between mt-5 mb-2 px-1">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.primaryText }}>
                Saved Addresses
              </p>
              <button
                onClick={() => { setEditingAddr(null); setShowModal(true) }}
                className="flex items-center gap-1 text-xs font-bold transition-colors duration-200"
                style={{ color: theme.primary }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.primaryHover }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.primary }}
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {addrLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.primary }} />
              </div>
            ) : addresses.length === 0 ? (
              <Card theme={theme}>
                <div className="flex flex-col items-center py-8 gap-2">
                  <MapPin className="w-8 h-8" style={{ color: theme.primaryBorder }} />
                  <p className="text-sm font-semibold text-gray-500">No addresses yet</p>
                  <p className="text-xs text-gray-400 text-center">Add your home or office for faster checkout</p>
                  <button
                    onClick={() => { setEditingAddr(null); setShowModal(true) }}
                    className="mt-2 px-5 py-2 text-white text-sm font-bold rounded-full transition-all duration-200"
                    style={{ backgroundColor: theme.primary }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
                  >
                    Add Address
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence>
                  {addresses.map(addr => (
                    <motion.div
                      key={addr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-2xl border shadow-sm p-4"
                      style={{ borderColor: theme.primaryBorder }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: theme.primaryLight }}
                          >
                            {addr.label === "Work" ? (
                              <Briefcase className="w-4 h-4" style={{ color: theme.primary }} />
                            ) : (
                              <Home className="w-4 h-4" style={{ color: theme.primary }} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{addr.label ?? "Address"}</span>
                              {addr.isDefault && (
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    color: theme.primaryText,
                                    backgroundColor: `${theme.primary}20`,
                                    border: `1px solid ${theme.primaryBorder}`,
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {[addr.street, addr.town, addr.lga, addr.state].filter(Boolean).join(", ")}
                            </p>
                            {addr.phoneNumber && (
                              <p className="text-xs text-gray-400">{addr.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => { setEditingAddr(addr); setShowModal(true) }}
                            className="p-1.5 rounded-lg transition-colors duration-200"
                            style={{ backgroundColor: `${theme.primary}10` }}
                          >
                            <Edit2 className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => { setEditingAddr(null); setShowModal(true) }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-all duration-200"
                  style={{ borderColor: theme.primaryBorder, color: theme.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.primary
                    e.currentTarget.style.backgroundColor = `${theme.primaryLight}80`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.primaryBorder
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <Plus className="w-4 h-4" /> Add Another Address
                </button>
              </div>
            )}

            <SectionHead title="Dase Account" theme={theme} />
            <Card theme={theme}>
              <RowItem icon={ShoppingBag} iconBg="bg-amber-50"   label="My Orders"  onClick={() => {}} theme={theme} />
              <RowItem icon={Star}        iconBg="bg-yellow-50"  iconColor="text-yellow-500" label="My Reviews" onClick={() => {}} theme={theme} />
              <RowItem icon={Heart}       iconBg="bg-red-50"     iconColor="text-red-500"    label="Wishlist"   onClick={() => {}} theme={theme} />
            </Card>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === "activity" && (
          <div className="px-4 mt-1">
            <SectionHead title="Recent Activity" theme={theme} />
            <Card theme={theme}>
              <div className="flex flex-col items-center py-12 gap-3">
                <Clock className="w-10 h-10" style={{ color: theme.primaryBorder }} />
                <p className="text-sm font-semibold text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 text-center px-6">
                  Your order and review history will appear here
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <div className="px-4 mt-1">
            <SectionHead title="Preferences" theme={theme} />
            <Card theme={theme}>
              <RowItem
                icon={Bell}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                label="Push Notifications"
                rightNode={<Toggle checked={notifEnabled} onChange={handleToggleNotif} loading={notifLoading} theme={theme} />}
                theme={theme}
              />
              <RowItem
                icon={Moon}
                iconBg="bg-violet-50"
                iconColor="text-violet-500"
                label="Dark Mode"
                rightNode={<Toggle checked={false} onChange={() => {}} theme={theme} />}
                disabled
                theme={theme}
              />
              <RowItem
                icon={Globe}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                label="Language"
                value="English"
                onClick={() => {}}
                theme={theme}
              />
            </Card>

            <SectionHead title="Security" theme={theme} />
            <Card theme={theme}>
              <RowItem icon={Lock}   iconBg="bg-amber-50"   label="Change Password" onClick={() => {}} theme={theme} />
              <RowItem icon={Shield} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Two-Factor Auth" onClick={() => {}} theme={theme} />
            </Card>

            <SectionHead title="Support" theme={theme} />
            <Card theme={theme}>
              <RowItem icon={HelpCircle}  iconBg="bg-blue-50"   iconColor="text-blue-600"   label="Help & FAQ"       onClick={() => window.open("https://dasesupermarket.vercel.app", "_blank")} theme={theme} />
              <RowItem icon={FileText}    iconBg="bg-violet-50" iconColor="text-violet-600" label="Terms of Service" onClick={() => {}} theme={theme} />
              <RowItem icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Privacy Policy" onClick={() => {}} theme={theme} />
            </Card>

            <SectionHead title="" theme={theme} />
            <Card theme={theme}>
              <RowItem
                icon={LogOut}
                iconBg="bg-red-50"
                label="Sign Out"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                danger
                theme={theme}
              />
            </Card>

            {/* <p className="text-center text-xs mt-4 mb-2" style={{ color: theme.primaryText }}>
              Dase Supermarket v1.0.0
            </p> */}
          </div>
        )}
      </div>
    </div>
  )
}