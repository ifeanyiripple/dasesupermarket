"use client"

import { useState } from "react"
import { X, Phone, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhoneModalProps {
  /** Current phone number to pre-fill (if any) */
  currentPhone?: string | null
  /** Theme object from useTheme() */
  theme: {
    primary: string
    primaryHover: string
    primaryLight: string
    primaryBorder: string
    primaryText: string
  }
  onClose: () => void
  /** Called with the validated phone string on save */
  onSave: (phone: string) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises a Nigerian phone number to +234XXXXXXXXXX format.
 * Accepts: 08012345678 | 8012345678 | +2348012345678 | 2348012345678
 */
function normaliseNigerianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")

  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`
  if (digits.startsWith("0")   && digits.length === 11) return `+234${digits.slice(1)}`
  if (digits.length === 10)                              return `+234${digits}`
  return null
}

function isValidNigerianPhone(raw: string): boolean {
  return normaliseNigerianPhone(raw) !== null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PhoneModal({ currentPhone, theme, onClose, onSave }: PhoneModalProps) {
  const [value,   setValue]   = useState(currentPhone ?? "")
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validate = (v: string) => {
    if (!v.trim()) return "Phone number is required"
    if (!isValidNigerianPhone(v)) return "Enter a valid Nigerian number (e.g. 0801 234 5678)"
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (touched) setError(validate(e.target.value))
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validate(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const err = validate(value)
    if (err) { setError(err); return }

    setSaving(true)
    try {
      const normalised = normaliseNigerianPhone(value)!
      await onSave(normalised)
    } catch {
      setError("Could not save phone number. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const isValid = !validate(value)

  return (
    // Backdrop
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Sheet */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-4 pb-4 border-b"
          style={{ borderColor: theme.primaryBorder }}
        >
          <div className="flex items-center gap-3">
            {/* Icon pill */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Phone className="w-4 h-4" style={{ color: theme.primary }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {currentPhone ? "Update Phone Number" : "Add Phone Number"}
              </h2>
             
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Input */}
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: theme.primaryText }}
            >
              Phone Number <span style={{ color: theme.primary }}>*</span>
            </label>

            <div className="relative">
              {/* Flag + code prefix */}
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-3.5 gap-1.5 pointer-events-none select-none"
              >
                <span className="text-base leading-none">🇳🇬</span>
                <span className="text-sm font-semibold text-gray-400">+234</span>
                <div className="w-px h-4 bg-gray-200 ml-0.5" />
              </div>

              <input
                type="tel"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0801 234 5678"
                autoFocus
                className="w-full pl-24 pr-10 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                style={{
                  borderColor: error && touched
                    ? "#EF4444"
                    : isValid && touched
                      ? "#10B981"
                      : theme.primaryBorder,
                  boxShadow: error && touched
                    ? "0 0 0 3px rgba(239,68,68,0.12)"
                    : isValid && touched
                      ? "0 0 0 3px rgba(16,185,129,0.12)"
                      : "none",
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = theme.primary
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`
                  }
                }}
              />

              {/* Validation icon */}
              <AnimatePresence>
                {touched && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                  >
                    {isValid
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && touched && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Hint */}
            {!error && (
              <p className="text-xs text-gray-400 mt-1.5">
                Accepts formats like <span className="font-medium">08012345678</span> or <span className="font-medium">+2348012345678</span>
              </p>
            )}
          </div>

          {/* Info banner */}
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 text-xs"
            style={{
              backgroundColor: `${theme.primary}10`,
              border: `1px solid ${theme.primary}25`,
              color: theme.primaryText,
            }}
          >
            <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.primary }} />
            <p>
              Your phone number is used to contact you about deliveries. 
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors duration-200"
              style={{ borderColor: theme.primaryBorder }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 4px 12px ${theme.primary}30`,
              }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = theme.primaryHover
              }}
              onMouseLeave={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = theme.primary
              }}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><CheckCircle className="w-4 h-4" /> Save Number</>
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}