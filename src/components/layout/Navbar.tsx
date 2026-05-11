"use client"
// components/layout/Navbar.tsx

import { useState, useEffect, useRef, KeyboardEvent } from "react"  // ← added useRef, KeyboardEvent
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Search, User, Menu, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"                           // ← added
import CartDrawer from "../cart/CartDrawer"
import { useCart } from "@/context/cart-context"
import { DeliverToButton } from "../location/DeliverToButton"
import { useTheme } from "@/providers/theme-provider"

const NAV_LINKS = [
  { label: "Shop",       href: "/shop" },
  { label: "Categories", href: "/categories", hasDropdown: true },
  // { label: "Deals",   href: "/deals" },
  { label: "About",      href: "/about-us" },
  { label: "Contact",    href: "/contact-us" },
]

const LOGO_MAP = {
  red:   "/logored.svg",
  amber: "/logobrown.svg",
  green: "/logo.svg",
} as const

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [cartOpen,  setCartOpen]  = useState(false)
  const [query,     setQuery]     = useState("")                      // ← added
  const { cartCount } = useCart()
  const { colorKey }  = useTheme()
  const router        = useRouter()                                   // ← added
  const inputRef      = useRef<HTMLInputElement>(null)               // ← added

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const logoSrc = LOGO_MAP[colorKey] || "/logo.svg"

  // ── Search handlers ────────────────────────────────────────────────────────
  const handleSearch = () => {
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white"
        } border-b border-[var(--theme-primary-border)] transition-colors duration-300`}
      >
        {/* ── Themed accent line ─────────────────────────────────────────── */}
        <div className="h-[2.5px] w-full bg-[var(--theme-primary)] transition-colors duration-300" />

        {/* ── Row 1: Logo · Location · Nav · Account · Cart · Hamburger ─── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="items-center justify-center">
              <Image src={logoSrc} alt="DASE Supermarket logo" width={25} height={25} className="w-10 h-10 md:w-10 md:h-10" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[var(--theme-primary)] transition-colors duration-300">
              DASE
            </span>
          </Link>

          {/* Delivery location */}
          <div className="flex lg:hidden">
            <DeliverToButton mobile />
          </div>
          <DeliverToButton />

          {/* Nav links — desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-0.5 text-sm font-medium px-3 py-2 rounded-xl text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-all duration-200"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={12} />}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Account — desktop */}
          <Link
            href="/account"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 px-3 py-2 rounded-xl flex-shrink-0 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-all duration-200"
          >
            <User size={16} color="var(--theme-primary)" />
            <span className="text-[var(--theme-primary)]">Account</span>
          </Link>

          {/* Cart */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--theme-primary)] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-200"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          </div>

          {/* Hamburger — mobile */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen
              ? <X size={18} className="text-gray-700" />
              : <Menu size={18} className="text-gray-700" />
            }
          </button>
        </div>

        {/* ── Row 2: Search bar ─────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-white px-4 md:px-12 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-[var(--theme-primary)] focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
              <Search size={16} className="text-[var(--theme-primary)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, brands, categories..."
                className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
              {/* Clear button — only shows when there's text */}
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus() }}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <X size={10} className="text-gray-500" />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="flex-shrink-0 px-3 py-1 rounded-xl text-white text-xs font-bold bg-[var(--theme-primary)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 overflow-hidden"
            >
              <div className="pt-2">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between py-3 border-b border-gray-50 text-sm font-medium text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                    {link.hasDropdown
                      ? <ChevronDown size={14} className="text-gray-400" />
                      : <ChevronDown size={14} className="text-gray-200 -rotate-90" />
                    }
                  </Link>
                ))}

                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-[var(--theme-primary)] transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={15} color="var(--theme-primary)" />
                  <span className="text-[var(--theme-primary)]">My Account</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}



// "use client"
// // components/layout/Navbar.tsx

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { ShoppingCart, Search, User, Menu, X, ChevronDown } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"
// import CartDrawer from "../cart/CartDrawer"
// import { useCart } from "@/context/cart-context"
// import { DeliverToButton } from "../location/DeliverToButton"
// import { useTheme } from "@/providers/theme-provider"

// const NAV_LINKS = [
//   { label: "Shop",       href: "/shop" },
//   { label: "Categories", href: "/categories", hasDropdown: true },
//   // { label: "Deals",      href: "/deals" },
//   { label: "About",      href: "/about-us" },
//   { label: "Contact",    href: "/contact-us" },
// ]

// const LOGO_MAP = {
//   red: "/logored.svg",
//   amber: "/logobrown.svg",
//   green: "/logo.svg",
// } as const;

// export default function Navbar() {
//   const [scrolled,  setScrolled]  = useState(false)
//   const [menuOpen,  setMenuOpen]  = useState(false)
//   const [cartOpen,  setCartOpen]  = useState(false)
//   const { cartCount } = useCart()
//   const { colorKey } = useTheme();

//   useEffect(() => {
//     const handler = () => setScrolled(window.scrollY > 20)
//     window.addEventListener("scroll", handler)
//     return () => window.removeEventListener("scroll", handler)
//   }, [])

//   const logoSrc = LOGO_MAP[colorKey] || "/logo.svg";

//   return (
//     <>
//       {/* ── Sticky header ─────────────────────────────────────────────────── */}
//       <header
//         className={`sticky top-0 z-50 transition-all duration-300 ${
//           scrolled
//             ? "bg-white/95 backdrop-blur-md shadow-md"
//             : "bg-white"
//         } border-b border-[var(--theme-primary-border)] transition-colors duration-300`}
//       >
//         {/* ── Themed accent line ─────────────────────────────────────────── */}
//         <div className="h-[2.5px] w-full bg-[var(--theme-primary)] transition-colors duration-300" />

//         {/* ── Row 1: Logo · Location · Nav · Account · Cart · Hamburger ─── */}
//         <div className="max-w-7xl mx-auto px-4 md:px-12 h-14 flex items-center gap-3">

//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 flex-shrink-0">
//              <div className=" items-center justify-center">
//               <Image src={logoSrc} alt="DASE Supermarket logo" width={25} height={25} className="w-10 h-10 md:w-10 md:h-10" />
//             </div>
//             <span className="font-extrabold text-lg tracking-tight text-[var(--theme-primary)] transition-colors duration-300">
//               DASE
//             </span>
//           </Link>

//           {/* Delivery location */}
//           <div className="flex lg:hidden">
//             <DeliverToButton mobile />
//           </div>
//           <DeliverToButton />

//           {/* Nav links — desktop */}
//           <nav className="hidden lg:flex items-center gap-0.5 ml-2">
//             {NAV_LINKS.map(link => (
//               <Link
//                 key={link.label}
//                 href={link.href}
//                 className="
//                   flex items-center gap-0.5 text-sm font-medium
//                    px-3 py-2 rounded-xl
//                   text-[var(--theme-primary)]
//                   hover:bg-[var(--theme-primary-light)]
//                   transition-all duration-200
//                 "
//               >
//                 {link.label}
//                 {link.hasDropdown && <ChevronDown size={12} />}
//               </Link>
//             ))}
//           </nav>

//           <div className="flex-1" />

//           {/* Account — desktop */}
//           <Link
//             href="/account"
//             className="
//               hidden md:flex items-center gap-1.5 text-sm font-medium
//               text-gray-600 px-3 py-2 rounded-xl flex-shrink-0
//               hover:text-[var(--theme-primary)]
//               hover:bg-[var(--theme-primary-light)]
//               transition-all duration-200
//             "
//           >
//             <User size={16} color="var(--theme-primary)" />
//            <span className="text-[var(--theme-primary)]">Account</span> 
//           </Link>

//           {/* Cart */}
//           <div className="relative flex-shrink-0">
//             <button
//               onClick={() => setCartOpen(true)}
//               className="
//                 relative flex items-center gap-1.5 px-3 py-2 rounded-xl
//                 bg-[var(--theme-primary)] text-white text-sm font-semibold
//                 hover:opacity-90 active:scale-[0.97]
//                 transition-all duration-200
//               "
//             >
//               <ShoppingCart size={20} />
//               {cartCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//             <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
//           </div>

//           {/* Hamburger — mobile */}
//           <button
//             className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
//             onClick={() => setMenuOpen(v => !v)}
//           >
//             {menuOpen
//               ? <X size={18} className="text-gray-700" />
//               : <Menu size={18} className="text-gray-700" />
//             }
//           </button>
//         </div>

//         {/* ── Row 2: Search bar ─────────────────────────────────────────── */}
//         <div className="border-t border-gray-100 bg-white px-4 md:px-12 py-2">
//           <div className="max-w-7xl mx-auto">
//             <div className="
//               flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
//               bg-gray-50 border border-gray-200
//               focus-within:border-[var(--theme-primary)]
//               focus-within:bg-white focus-within:shadow-sm
//               transition-all duration-200
//             ">
//               <Search size={16} className="text-[var(--theme-primary)] flex-shrink-0" />
//               <input
//                 type="text"
//                 placeholder="Search for products, brands, categories..."
//                 className="flex-1 bg-transparent text-sm text-[var(--theme-primary)] placeholder:text-[var(--theme-primary)] focus:outline-none"
//               />
//               <button className="
//                 flex-shrink-0 px-3 py-1 rounded-xl text-white text-xs font-bold
//                 bg-[var(--theme-primary)]
//                 hover:opacity-90
//                 transition-all duration-200
//               ">
//                 Search
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── Mobile menu ───────────────────────────────────────────────── */}
//         <AnimatePresence>
//           {menuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 overflow-hidden"
//             >
//               <div className="pt-2">
//                 {NAV_LINKS.map(link => (
//                   <Link
//                     key={link.label}
//                     href={link.href}
//                     className="
//                       flex items-center justify-between py-3 border-b border-gray-50
//                       text-sm font-medium 
//                       text-[var(--theme-primary)]
//                       hover:bg-[var(--theme-primary-light)]
//                       transition-colors duration-200
//                     "
//                     onClick={() => setMenuOpen(false)}
//                   >
//                     {link.label}
//                     {link.hasDropdown
//                       ? <ChevronDown size={14} className="text-gray-400" />
//                       : <ChevronDown size={14} className="text-gray-200 -rotate-90" />
//                     }
//                   </Link>
//                 ))}

//                 <Link
//                   href="/profile"
//                   className="
//                     flex items-center gap-2 py-3
//                     text-sm font-medium text-gray-700
//                     hover:text-[var(--theme-primary)]
//                     transition-colors duration-200
//                   "
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   <User size={15} color="var(--theme-primary)"/>
//                   <span className="text-[var(--theme-primary)]">My Account</span>
//                 </Link>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </header>
//     </>
//   )
// }