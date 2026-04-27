"use client";
// components/cart/CartDrawer.tsx
// Slide-in cart drawer triggered from the Navbar cart button

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { useCart, type CartItem } from "@/context/cart-context"
import { formatPrice as fp } from "@/components/ProductCard"
import { useTheme } from "@/providers/theme-provider"
import { Modal } from "@/components/ui/modal"

type Props = {
  open:    boolean
  onClose: () => void
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart()
  const { theme } = useTheme()

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-4 border-b last:border-0"
      style={{ borderColor: theme.primaryBorder }}
    >
      {/* Image */}
      <div 
        className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border"
        style={{ 
          backgroundColor: theme.primaryLight,
          borderColor: theme.primaryBorder 
        }}
      >
        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/product/${item.id}`} 
          className="text-xs font-bold text-gray-800 line-clamp-2 transition-colors leading-snug hover:text-[var(--theme-primary)]"
        >
          {item.name}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: item.imageColorCode }} />
          <span className="text-[10px] text-gray-400">{item.imageColor}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: theme.primaryBorder }}>
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Minus size={10} />
            </button>
            <span className="w-7 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus size={10} />
            </button>
          </div>
          <span className="text-sm font-extrabold" style={{ color: theme.primary }}>
            {fp(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors mt-0.5"
      >
        <X size={10} />
      </button>
    </motion.div>
  )
}

export default function CartDrawer({ open, onClose }: Props) {
  const { cartItems, cartCount, cartTotal, clearCart } = useCart()
  const { theme } = useTheme()

  return (
    <Modal 
      showModal={open} 
      setShowModal={(v) => !v && onClose()} 
      onClose={onClose}
      className="p-0 overflow-hidden bg-white shadow-2xl max-w-sm w-full mx-auto"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: theme.primaryBorder }}
      >
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={18} style={{ color: theme.primary }} />
          <h2 className="font-extrabold text-gray-800">Your Cart</h2>
          {cartCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              {cartCount}
            </motion.span>
          )}
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Empty state */}
      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12"
        >
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <ShoppingCart size={32} style={{ color: theme.primaryBorder }} />
          </div>
          <p className="font-bold text-gray-600">Your cart is empty</p>
          <p className="text-sm text-gray-400 text-center">Add some fresh products to get started</p>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: theme.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary
            }}
          >
            <ShoppingBag size={14} /> Continue Shopping
          </button>
        </motion.div>
      ) : (
        <>
          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-2 max-h-[60vh]">
            <AnimatePresence>
              {cartItems.map(item => (
                <CartItemRow key={`${item.id}-${item.imageColor}`} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-shrink-0 border-t px-5 py-4 flex flex-col gap-3"
            style={{ borderColor: theme.primaryBorder }}
          >
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})
              </span>
              <span className="text-lg font-extrabold" style={{ color: theme.primary }}>
                {fp(cartTotal)}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: theme.primaryText }}>
              Shipping and delivery fee calculated at checkout
            </p>

            {/* Checkout CTA */}
            <Link 
              href="/cart" 
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-bold text-sm transition-all duration-200"
              style={{ 
                backgroundColor: theme.primary,
                boxShadow: `0 8px 20px ${theme.primary}30`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primaryHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary
              }}
            >
              View Cart & Checkout <ArrowRight size={15} />
            </Link>

            {/* Clear cart */}
            <button 
              onClick={clearCart}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs transition-colors"
              style={{ color: theme.primaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#EF4444"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.primaryText
              }}
            >
              <Trash2 size={11} /> Clear cart
            </button>
          </motion.div>
        </>
      )}
    </Modal>
  )
}