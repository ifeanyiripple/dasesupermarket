"use client"
// lib/cart-context.tsx
// Global cart state — persisted to localStorage, accessible anywhere

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode
} from "react"

// ── Cart item type (matches our DB OrderItem shape) ───────────────────────────
export type CartItem = {
  id:             string   // product id
  name:           string
  description:    string
  category:       string
  brand:          string
  quantity:       number
  price:          number
  itemType:       "product" | "food"
  imageColor:     string
  imageColorCode: string
  imageUrl:       string
}

// ── Promo codes registry ──────────────────────────────────────────────────────
const PROMO_CODES: Record<string, number> = {
  DASE10: 0.1,  // 10% off — add more here as needed
}

type CartContextType = {
  cartItems:       CartItem[]
  cartCount:       number
  cartTotal:       number
  addToCart:       (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeFromCart:  (productId: string) => void
  updateQuantity:  (productId: string, quantity: number) => void
  clearCart:       () => void
  isInCart:        (productId: string) => boolean
  getItemQuantity: (productId: string) => number
  // ── Promo ──────────────────────────────────────────────────────────────────
  promoCode:       string
  setPromoCode:    (code: string) => void
  promoApplied:    boolean
  promoDiscount:   number          // flat ₦ amount saved
  promoRate:       number          // e.g. 0.1 for 10%
  applyPromo:      (code: string) => "ok" | "invalid"
  clearPromo:      () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY  = "dase_cart"
const PROMO_KEY = "dase_promo"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems,    setCartItems]    = useState<CartItem[]>([])
  const [hydrated,     setHydrated]     = useState(false)
  const [promoCode,    setPromoCode]    = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  // ── Hydrate cart + promo from localStorage ─────────────────────────────────
  useEffect(() => {
    try {
      const storedCart  = localStorage.getItem(CART_KEY)
      const storedPromo = localStorage.getItem(PROMO_KEY)
      if (storedCart)  setCartItems(JSON.parse(storedCart))
      if (storedPromo) {
        const { code, applied } = JSON.parse(storedPromo)
        setPromoCode(code    ?? "")
        setPromoApplied(applied ?? false)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // ── Persist cart to localStorage ───────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)) } catch {}
  }, [cartItems, hydrated])

  // ── Persist promo to localStorage ──────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(PROMO_KEY, JSON.stringify({ code: promoCode, applied: promoApplied }))
    } catch {}
  }, [promoCode, promoApplied, hydrated])

  // ── Derived values ─────────────────────────────────────────────────────────
  const cartCount    = cartItems.reduce((s, i) => s + i.quantity, 0)
  const cartTotal    = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const promoRate    = promoApplied ? (PROMO_CODES[promoCode] ?? 0) : 0
  const promoDiscount = Math.round(cartTotal * promoRate)

  // ── Cart actions ───────────────────────────────────────────────────────────
  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.imageColor === item.imageColor)
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.imageColor === item.imageColor
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return }
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    // Clear promo too — a fresh cart shouldn't carry a stale discount
    setPromoCode("")
    setPromoApplied(false)
  }, [])

  const isInCart = useCallback((productId: string) =>
    cartItems.some(i => i.id === productId), [cartItems])

  const getItemQuantity = useCallback((productId: string) =>
    cartItems.find(i => i.id === productId)?.quantity ?? 0, [cartItems])

  // ── Promo actions ──────────────────────────────────────────────────────────
  const applyPromo = useCallback((code: string): "ok" | "invalid" => {
    const normalised = code.trim().toUpperCase()
    if (PROMO_CODES[normalised] !== undefined) {
      setPromoCode(normalised)
      setPromoApplied(true)
      return "ok"
    }
    setPromoApplied(false)
    return "invalid"
  }, [])

  const clearPromo = useCallback(() => {
    setPromoCode("")
    setPromoApplied(false)
  }, [])

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity,
      clearCart, isInCart, getItemQuantity,
      promoCode, setPromoCode,
      promoApplied, promoDiscount, promoRate,
      applyPromo, clearPromo,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}

// "use client"
// // lib/cart-context.tsx
// // Global cart state — persisted to localStorage, accessible anywhere

// import {
//   createContext, useContext, useState,
//   useEffect, useCallback, type ReactNode
// } from "react"

// // ── Cart item type (matches our DB OrderItem shape) ───────────────────────────
// export type CartItem = {
//   id:            string   // product id
//   name:          string
//   description:   string
//   category:      string
//   brand:         string
//   quantity:      number
//   price:         number
//   itemType: "product" | "food"
//   imageColor:    string
//   imageColorCode: string
//   imageUrl:      string
// }

// type CartContextType = {
//   cartItems:        CartItem[]
//   cartCount:        number
//   cartTotal:        number
//   addToCart:        (item: Omit<CartItem, "quantity">, quantity?: number) => void
//   removeFromCart:   (productId: string) => void
//   updateQuantity:   (productId: string, quantity: number) => void
//   clearCart:        () => void
//   isInCart:         (productId: string) => boolean
//   getItemQuantity:  (productId: string) => number
// }

// const CartContext = createContext<CartContextType | null>(null)

// const CART_KEY = "dase_cart"

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cartItems, setCartItems] = useState<CartItem[]>([])
//   const [hydrated,  setHydrated]  = useState(false)

//   // Hydrate from localStorage on mount
//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem(CART_KEY)
//       if (stored) setCartItems(JSON.parse(stored))
//     } catch {}
//     setHydrated(true)
//   }, [])

//   // Persist to localStorage whenever cart changes
//   useEffect(() => {
//     if (!hydrated) return
//     try { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)) } catch {}
//   }, [cartItems, hydrated])

//   const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
//   const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

//   const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
//     setCartItems(prev => {
//       const existing = prev.find(i => i.id === item.id && i.imageColor === item.imageColor)
//       if (existing) {
//         return prev.map(i =>
//           i.id === item.id && i.imageColor === item.imageColor
//             ? { ...i, quantity: i.quantity + quantity }
//             : i
//         )
//       }
//       return [...prev, { ...item, quantity }]
//     })
//   }, [])

//   const removeFromCart = useCallback((productId: string) => {
//     setCartItems(prev => prev.filter(i => i.id !== productId))
//   }, [])

//   const updateQuantity = useCallback((productId: string, quantity: number) => {
//     if (quantity < 1) { removeFromCart(productId); return }
//     setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
//   }, [removeFromCart])

//   const clearCart = useCallback(() => setCartItems([]), [])

//   const isInCart = useCallback((productId: string) =>
//     cartItems.some(i => i.id === productId), [cartItems])

//   const getItemQuantity = useCallback((productId: string) =>
//     cartItems.find(i => i.id === productId)?.quantity ?? 0, [cartItems])

//   return (
//     <CartContext.Provider value={{
//       cartItems, cartCount, cartTotal,
//       addToCart, removeFromCart, updateQuantity,
//       clearCart, isInCart, getItemQuantity,
//     }}>
//       {children}
//     </CartContext.Provider>
//   )
// }

// export function useCart() {
//   const ctx = useContext(CartContext)
//   if (!ctx) throw new Error("useCart must be used inside CartProvider")
//   return ctx
// }