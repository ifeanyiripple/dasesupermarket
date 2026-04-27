"use client"
// components/sections/NewsletterSection.tsx

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, SendHorizonal, CheckCircle } from "lucide-react"

export default function NewsletterSection() {
  const [email,     setEmail]     = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1200)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a5c38] to-[#0d3d25] p-10 md:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i}
                className="absolute rounded-full opacity-5"
                style={{
                  width: `${60 + i * 30}px`,
                  height: `${60 + i * 30}px`,
                  background: "white",
                  top: `${10 + (i % 3) * 30}%`,
                  left: `${5 + i * 12}%`,
                  transform: "translate(-50%,-50%)"
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Mail size={26} className="text-[#7ec89a]" />
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              Stay in the Loop
            </h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and weekly grocery specials.
            </p>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2 text-[#7ec89a]"
              >
                <CheckCircle size={36} />
                <p className="font-bold text-lg">You're subscribed! 🎉</p>
                <p className="text-white/50 text-sm">We'll send you the best deals to {email}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#7ec89a] transition-colors backdrop-blur-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#7ec89a] text-[#0d3d25] font-bold text-sm whitespace-nowrap hover:bg-[#93d4aa] transition-colors disabled:opacity-70"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#0d3d25]/30 border-t-[#0d3d25] rounded-full animate-spin" />
                  ) : (
                    <><SendHorizonal size={15} /> Subscribe</>
                  )}
                </motion.button>
              </form>
            )}

            <p className="text-white/30 text-xs mt-4">No spam, unsubscribe any time.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}