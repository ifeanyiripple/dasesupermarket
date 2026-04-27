"use client"
// src/components/layout/BottomNavbar.tsx

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/providers/theme-provider"
import { NAV_ICON_MAP } from "./Navicons"

const NAV_ITEMS = [
  { label: "Shop",     href: "/",        iconId: "shop"     },
  { label: "Cart", href: "/cart", iconId: "wishlist" },
  { label: "Orders",   href: "/orders",  iconId: "orders"   },
  { label: "Profile",  href: "/profile", iconId: "profile"  },
]

export default function BottomNavbar() {
  const { theme } = useTheme()
  const pathname = usePathname()

  const isActivePage = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t"
      style={{ borderColor: theme.primaryBorder, transition: "border-color 0.4s ease" }}
    >
      {/* Themed accent line */}
      <div
        className="h-[2.5px] w-full transition-all duration-400"
        style={{ background: theme.primary }}
      />

      <div className="flex items-stretch h-[58px] max-w-screen-sm mx-auto px-1 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = isActivePage(item.href)
          const IconComponent = NAV_ICON_MAP[item.iconId]

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center flex-1 gap-[3px] pt-2 pb-1 focus-visible:outline-none"
            >
              {/* Sliding pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-x-1 top-1 h-[42px] rounded-2xl"
                  style={{ background: `${theme.primary}12` }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}

              {/* Icon with fade transition on color/state change */}
              <div className="relative z-10 w-6 h-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${item.iconId}-${theme.colorKey}-${isActive}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <IconComponent
                      color={theme.primary}
                      active={isActive}
                      size={24}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Label */}
              <span
                className="relative z-10 text-[10px] leading-none transition-all duration-300"
                style={{
                  color:      isActive ? theme.primary : "#9CA3AF",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </span>

            
            </Link>
          )
        })}
      </div>
    </nav>
  )
}