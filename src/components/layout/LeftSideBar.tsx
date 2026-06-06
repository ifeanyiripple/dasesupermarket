"use client"
// src/components/layout/LeftSidebar.tsx
//
// Desktop-only sidebar (hidden on mobile — BottomNavbar takes over there).
// Reuses the same NavIcon components from the bottom bar.
// Color theme follows the active HomeTabs section via useTheme().

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/providers/theme-provider"
import { NAV_ICON_MAP } from "./Navicons"
import Image from "next/image"

// ── Nav items — mirrors BottomNavbar exactly ──────────────────────────────────
const NAV_ITEMS = [
  { label: "Shop",     href: "/",        iconId: "shop"     },
  { label: "Wishlist", href: "/wishlist", iconId: "wishlist" },
  { label: "Orders",   href: "/orders",  iconId: "orders"   },
  { label: "Profile",  href: "/profile", iconId: "profile"  },
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function LeftSidebar() {
  const { theme } = useTheme()
  const pathname  = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <aside
      aria-label="Main sidebar"
      className="
        hidden lg:flex
        flex-col
        fixed left-0 top-0 bottom-0
        w-[68px] xl:w-[220px]
        z-60
        transition-all duration-300
        bg-white
      "
    >

      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center xl:items-start pt-8 pb-6 px-3 xl:px-5">
        <div className="flex items-center gap-3">
          {/* Emblem circle — plain theme color */}
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{
              background: theme.primary,
              transition: "background 0.4s ease",
            }}
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </div>

          {/* Wordmark — only visible on xl */}
          <span
            className="hidden xl:block text-base font-extrabold tracking-tight text-gray-900"
          >
            DASE
          </span>
        </div>

        {/* Hairline divider */}
        <div
          className="mt-5 xl:w-full w-8 h-px rounded-full bg-gray-200"
        />
      </div>

      {/* ── Nav links ───────────────────────────────────────────────────── */}
      <nav className="flex flex-col flex-1 gap-1 px-2 xl:px-3" aria-label="Page navigation">
        {NAV_ITEMS.map((item) => {
          const active       = isActive(item.href)
          const IconComponent = NAV_ICON_MAP[item.iconId]

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="
                group relative flex items-center gap-3
                xl:px-3 px-0 py-2.5
                rounded-xl xl:rounded-2xl
                justify-center xl:justify-start
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-gray-300
                transition-all duration-200
              "
              style={{
                background: active ? `${theme.primary}10` : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = `${theme.primary}08`
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = "transparent"
                }
              }}
            >
              {/* Active left accent bar */}
              {active && (
                <motion.div
                  layoutId="sidebar-accent-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  style={{
                    height: "55%",
                    background: theme.primary,
                    transition: "background 0.4s ease",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon wrapper */}
              <div
                className="
                  relative z-10 flex-shrink-0
                  w-9 h-9 rounded-xl
                  flex items-center justify-center
                  transition-all duration-200
                "
                style={{
                  background: active ? `${theme.primary}10` : "transparent",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`sidebar-${item.iconId}-${theme.colorKey}-${active}`}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: active ? 1.08 : 1 }}
                    exit={{ opacity: 0, scale: 0.72 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <IconComponent
                      color={active ? theme.primary : "#9ca3af"}
                      active={active}
                      size={20}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Label — hidden on collapsed (non-xl) width */}
              <span
                className="hidden xl:block text-[13px] font-medium tracking-wide transition-all duration-200 truncate"
                style={{
                  color: active ? theme.primary : "#6b7280",
                }}
              >
                {item.label}
              </span>

              {/* Tooltip on collapsed width (non-xl only) */}
              <div
                className="
                  xl:hidden
                  pointer-events-none absolute left-full ml-3
                  px-2.5 py-1.5 rounded-lg
                  text-xs font-semibold text-white whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  translate-x-1 group-hover:translate-x-0
                  transition-all duration-150
                  z-50
                "
                style={{
                  background: theme.primary,
                  transition: "background 0.4s ease",
                }}
              >
                {item.label}
                {/* Arrow */}
                <span
                  className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                  style={{ borderRightColor: theme.primary }}
                />
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom: theme indicator strip ───────────────────────────────── */}
      <div className="px-2 xl:px-3 pb-6 flex flex-col gap-3 items-center xl:items-stretch">
        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Current theme label pill — xl only */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
          {/* Colored dot */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-400"
            style={{
              background: theme.primary,
            }}
          />
          <span className="text-[11px] font-medium truncate text-gray-500">
            {theme.label}
          </span>
        </div>

        {/* Collapsed: just the dot */}
        <div
          className="xl:hidden w-2 h-2 rounded-full transition-all duration-400 mx-auto"
          style={{
            background: theme.primary,
          }}
        />
      </div>
    </aside>
  )
}