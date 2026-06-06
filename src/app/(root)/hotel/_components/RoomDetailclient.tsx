"use client"
// app/hotel/[id]/_components/RoomDetailClient.tsx

import { useState, useCallback, useMemo } from "react"
import Image from "next/image"
import Link  from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, BedDouble, Users, Wifi, Zap, Tv, Shield, Wind, Sofa,
  CalendarDays, ChevronLeft, ChevronRight, Phone, Mail, User,
  CheckCircle2, Loader2, AlertCircle, Check, LogIn, Star,
  ExternalLink, Sparkles, X,
} from "lucide-react"
import { useMutation }      from "@tanstack/react-query"
import { useCurrentUser }   from "@/hooks/use-current-user"
import { toast }            from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomData = {
  id:          string
  name:        string
  description: string
  price:       number
  roomNumber:  string
  capacity:    number
  available:   number
  status:      "AVAILABLE" | "OCCUPIED"
  bed:         string
  amenities:   string[]
  images:      string[]
  featured:    boolean
}

type BookingForm = {
  guestName:   string
  guestEmail:  string
  guestPhone:  string
  checkIn:     string
  checkOut:    string
  notes:       string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HOTEL_PRIMARY      = "#BA7517"
const HOTEL_HOVER        = "#9A6213"
const HOTEL_LIGHT        = "#FDF3E3"
const HOTEL_BORDER       = "#F0D5A0"
const HOTEL_TEXT         = "#8A5A0F"

const AMENITY_ICON: Record<string, React.ElementType> = {
  WiFi:               Wifi,
  "24/7 Power Supply": Zap,
  TV:                 Tv,
  Security:           Shield,
  AC:                 Wind,
  Cushion:            Sofa,
}

function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ─── Image gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setActive(i => (i - 1 + images.length) % images.length)
  const next = () => setActive(i => (i + 1) % images.length)

  if (images.length === 0) {
    return (
      <div
        className="w-full h-72 md:h-[420px] rounded-2xl flex items-center justify-center text-6xl"
        style={{ backgroundColor: HOTEL_LIGHT }}
      >
        🏨
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main image */}
        <div
          className="relative w-full h-72 md:h-[420px] rounded-2xl overflow-hidden cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[active]}
            alt={`${name} — image ${active + 1}`}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow transition-all hover:bg-white hover:scale-110"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow transition-all hover:bg-white hover:scale-110"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            {active + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="relative flex-shrink-0 w-16 h-14 md:w-20 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{ borderColor: i === active ? HOTEL_PRIMARY : "transparent" }}
              >
                <Image
                  src={img}
                  alt={`Thumb ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="80px"
                />
                {i !== active && (
                  <div className="absolute inset-0 bg-black/30" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(false)}
            >
              <X size={18} />
            </button>
            <div
              className="relative w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={images[active]}
                alt={`${name} full`}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); next() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RoomDetailClient({ room }: { room: RoomData }) {
  const user = useCurrentUser()

  const isAvailable = room.status === "AVAILABLE"

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<BookingForm>({
    guestName:  user?.name  ?? "",
    guestEmail: user?.email ?? "",
    guestPhone: "",
    checkIn:    todayStr(),
    checkOut:   tomorrowStr(),
    notes:      "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({})

  const set = (field: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const nights = useMemo(
    () => nightsBetween(form.checkIn, form.checkOut),
    [form.checkIn, form.checkOut]
  )
  const totalAmount = room.price * Math.max(nights, 1)

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errs: Partial<Record<keyof BookingForm, string>> = {}

    if (!form.guestName.trim())              errs.guestName  = "Name is required"
    if (!form.guestEmail.trim())             errs.guestEmail = "Email is required"
    else if (!isValidEmail(form.guestEmail)) errs.guestEmail = "Enter a valid email"
    if (!form.guestPhone.trim())             errs.guestPhone = "Phone number is required"
    if (!form.checkIn)                       errs.checkIn    = "Check-in date required"
    if (!form.checkOut)                      errs.checkOut   = "Check-out date required"
    if (nights <= 0)                         errs.checkOut   = "Check-out must be after check-in"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, nights])

  // ── Payment init ───────────────────────────────────────────────────────────
  const { mutate: initBooking, isPending } = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error("Validation failed")

      const res = await fetch("/api/paystack/initialize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:      totalAmount,
          email:       form.guestEmail.trim(),
          guestEmail:  user ? null : form.guestEmail.trim(),
          // No addressId needed for hotel — we pass booking details as metadata
          address:     "Dase Luxury Hotel, Nigeria",
          phoneNumber: form.guestPhone.trim(),
          notes:       form.notes,
          // Room booking metadata
          roomBooking: true,
          roomId:      room.id,
          roomName:    room.name,
          checkIn:     form.checkIn,
          checkOut:    form.checkOut,
          nights,
          guestName:   form.guestName.trim(),
          items: [
            {
              productId:      null,
              foodId:         null,
              roomId:         room.id,
              name:           `${room.name} — ${nights} night${nights !== 1 ? "s" : ""}`,
              description:    room.description,
              category:       "Hotel",
              brand:          "Dase Luxury Hotel",
              quantity:       nights,
              price:          room.price,
              imageColor:     "Default",
              imageColorCode: "#BA7517",
              imageUrl:       room.images[0] ?? "",
            },
          ],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to initialize payment")
      }

      return res.json()
    },
    onSuccess: (data) => {
      toast.success("Redirecting to payment…")
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        toast.error("No payment URL received")
      }
    },
    onError: (e: any) => {
      if (e?.message !== "Validation failed") {
        toast.error(e?.message ?? "Failed to initialize booking. Please try again.")
      }
    },
  })

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault()
    initBooking()
  }

  // ── Input style helper ─────────────────────────────────────────────────────
  const inputCls = (field: keyof BookingForm) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition-all duration-200`

  const inputStyle = (field: keyof BookingForm) => ({
    borderColor: errors[field] ? "#EF4444" : HOTEL_BORDER,
  })

  const focusStyle = {
    borderColor: HOTEL_PRIMARY,
    boxShadow:   `0 0 0 3px ${HOTEL_PRIMARY}20`,
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${HOTEL_LIGHT}60` }}>
      <div className="max-w-6xl mx-auto px-4 md:px-12 py-8">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: HOTEL_TEXT }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = HOTEL_PRIMARY }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = HOTEL_TEXT }}
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 text-xs">Hotel</span>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-semibold text-gray-600 truncate max-w-[160px]">{room.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Images + Info ──────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ImageGallery images={room.images} name={room.name} />
            </motion.div>

            {/* Room title & status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border shadow-sm p-5"
              style={{ borderColor: HOTEL_BORDER }}
            >
              {/* Hotel brand label */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: HOTEL_PRIMARY }}
                >
                  Dase Luxury Hotel
                </p>
                <div className="flex items-center gap-2">
                  {room.featured && (
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${HOTEL_PRIMARY}20`, color: HOTEL_PRIMARY }}
                    >
                      <Sparkles size={9} /> Featured
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isAvailable ? "Available" : "Occupied"}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight mb-1">
                {room.name}
              </h1>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-3 mt-3 mb-4">
                {room.bed && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: HOTEL_LIGHT, color: HOTEL_TEXT }}
                  >
                    <BedDouble size={12} style={{ color: HOTEL_PRIMARY }} />
                    {room.bed}
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: HOTEL_LIGHT, color: HOTEL_TEXT }}
                >
                  <Users size={12} style={{ color: HOTEL_PRIMARY }} />
                  {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                </div>
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: HOTEL_LIGHT, color: HOTEL_TEXT }}
                >
                  <Star size={12} style={{ color: HOTEL_PRIMARY }} className="fill-amber-400 text-amber-400" />
                  Luxury stay
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{room.description}</p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold" style={{ color: HOTEL_PRIMARY }}>
                  {formatPrice(room.price)}
                </span>
                <span className="text-sm text-gray-400 font-medium">/night</span>
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border shadow-sm p-5"
              style={{ borderColor: HOTEL_BORDER }}
            >
              <h2 className="font-extrabold text-gray-800 mb-4">Room Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map(amenity => {
                  const Icon = AMENITY_ICON[amenity] ?? Check
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 p-3 rounded-xl border"
                      style={{ backgroundColor: HOTEL_LIGHT, borderColor: HOTEL_BORDER }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${HOTEL_PRIMARY}20` }}
                      >
                        <Icon size={15} style={{ color: HOTEL_PRIMARY }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Hotel link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ backgroundColor: HOTEL_LIGHT, borderColor: HOTEL_BORDER }}
            >
              <span className="text-2xl">🏨</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Dase Luxury Hotel</p>
                <p className="text-xs text-gray-500">Full hotel experience, Bar, Restaurant & More</p>
              </div>
              <a
                href="https://daseluxuryhotel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg"
                style={{ color: HOTEL_PRIMARY, backgroundColor: `${HOTEL_PRIMARY}15` }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${HOTEL_PRIMARY}25` }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${HOTEL_PRIMARY}15` }}
              >
                <ExternalLink size={11} /> Visit site
              </a>
            </motion.div>
          </div>

          {/* ── Right: Booking panel ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-24"
            >
              <form onSubmit={handleBook}>
                <div
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                  style={{ borderColor: HOTEL_BORDER }}
                >
                  {/* Header */}
                  <div
                    className="px-5 pt-5 pb-4"
                    style={{ background: `linear-gradient(135deg, ${HOTEL_PRIMARY}15, ${HOTEL_LIGHT})`, borderBottom: `1px solid ${HOTEL_BORDER}` }}
                  >
                    <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
                      <CalendarDays size={16} style={{ color: HOTEL_PRIMARY }} />
                      Book this Room
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAvailable ? "Reserve your stay with secure Paystack checkout" : "This room is currently occupied"}
                    </p>
                  </div>

                  <div className="p-5 flex flex-col gap-4">

                    {/* Guest info — prefilled for logged-in users */}
                    {!user && (
                      <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: HOTEL_LIGHT, border: `1px solid ${HOTEL_BORDER}` }}
                      >
                        <div className="flex items-center gap-2">
                          <User size={13} style={{ color: HOTEL_PRIMARY }} />
                          <p className="text-xs font-bold text-gray-700">
                            Booking as <span style={{ color: HOTEL_PRIMARY }}>guest</span>
                          </p>
                        </div>
                        <Link
                          href="/auth/login?callbackUrl=/hospitality"
                          className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1.5 transition-all"
                          style={{ color: HOTEL_PRIMARY, background: `${HOTEL_PRIMARY}12` }}
                        >
                          <LogIn size={11} /> Sign in
                        </Link>
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <User size={12} style={{ color: HOTEL_PRIMARY }} /> Full Name
                      </label>
                      <input
                        type="text"
                        value={form.guestName}
                        onChange={set("guestName")}
                        placeholder="John Doe"
                        className={inputCls("guestName")}
                        style={inputStyle("guestName")}
                        onFocus={e => Object.assign(e.target.style, focusStyle)}
                        onBlur={e => { e.target.style.borderColor = errors.guestName ? "#EF4444" : HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                      />
                      {errors.guestName && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.guestName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} style={{ color: HOTEL_PRIMARY }} /> Email Address
                      </label>
                      <input
                        type="email"
                        value={form.guestEmail}
                        onChange={set("guestEmail")}
                        placeholder="your@email.com"
                        className={inputCls("guestEmail")}
                        style={inputStyle("guestEmail")}
                        onFocus={e => Object.assign(e.target.style, focusStyle)}
                        onBlur={e => { e.target.style.borderColor = errors.guestEmail ? "#EF4444" : HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                      />
                      {errors.guestEmail && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.guestEmail}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Phone size={12} style={{ color: HOTEL_PRIMARY }} /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.guestPhone}
                        onChange={set("guestPhone")}
                        placeholder="+234 800 000 0000"
                        className={inputCls("guestPhone")}
                        style={inputStyle("guestPhone")}
                        onFocus={e => Object.assign(e.target.style, focusStyle)}
                        onBlur={e => { e.target.style.borderColor = errors.guestPhone ? "#EF4444" : HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                      />
                      {errors.guestPhone && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.guestPhone}
                        </p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={form.checkIn}
                          min={todayStr()}
                          onChange={set("checkIn")}
                          className={inputCls("checkIn")}
                          style={inputStyle("checkIn")}
                          onFocus={e => Object.assign(e.target.style, focusStyle)}
                          onBlur={e => { e.target.style.borderColor = errors.checkIn ? "#EF4444" : HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                        />
                        {errors.checkIn && (
                          <p className="text-[10px] text-red-500 mt-1">{errors.checkIn}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={form.checkOut}
                          min={form.checkIn || todayStr()}
                          onChange={set("checkOut")}
                          className={inputCls("checkOut")}
                          style={inputStyle("checkOut")}
                          onFocus={e => Object.assign(e.target.style, focusStyle)}
                          onBlur={e => { e.target.style.borderColor = errors.checkOut ? "#EF4444" : HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                        />
                        {errors.checkOut && (
                          <p className="text-[10px] text-red-500 mt-1">{errors.checkOut}</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Special Requests <span className="font-normal text-gray-400">(optional)</span>
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={set("notes")}
                        rows={2}
                        placeholder="Early check-in, extra pillows, dietary preferences…"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none"
                        style={{ borderColor: HOTEL_BORDER }}
                        onFocus={e => Object.assign(e.target.style, focusStyle)}
                        onBlur={e => { e.target.style.borderColor = HOTEL_BORDER; e.target.style.boxShadow = "none" }}
                      />
                    </div>

                    {/* Price breakdown */}
                    {nights > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-xl border p-3 flex flex-col gap-2 text-sm"
                        style={{ backgroundColor: HOTEL_LIGHT, borderColor: HOTEL_BORDER }}
                      >
                        <div className="flex justify-between text-gray-600">
                          <span>{formatPrice(room.price)} × {nights} night{nights !== 1 ? "s" : ""}</span>
                          <span className="font-semibold">{formatPrice(totalAmount)}</span>
                        </div>
                        <div
                          className="flex justify-between font-extrabold text-base border-t pt-2"
                          style={{ borderColor: HOTEL_BORDER }}
                        >
                          <span>Total</span>
                          <span style={{ color: HOTEL_PRIMARY }}>{formatPrice(totalAmount)}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Book Now button */}
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      disabled={isPending || !isAvailable}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                      style={{
                        backgroundColor: isAvailable ? HOTEL_PRIMARY : "#9CA3AF",
                        boxShadow:       isAvailable ? `0 8px 20px ${HOTEL_PRIMARY}30` : "none",
                      }}
                      onMouseEnter={e => {
                        if (!isPending && isAvailable)
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = HOTEL_HOVER
                      }}
                      onMouseLeave={e => {
                        if (!isPending)
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isAvailable ? HOTEL_PRIMARY : "#9CA3AF"
                      }}
                    >
                      {isPending ? (
                        <><Loader2 size={16} className="animate-spin" /> Initializing Payment…</>
                      ) : !isAvailable ? (
                        "Room Currently Occupied"
                      ) : (
                        <><CheckCircle2 size={16} /> Book Now — {formatPrice(totalAmount)}</>
                      )}
                    </motion.button>

                  
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}