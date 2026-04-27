// src/components/icons/NavIcons.tsx
//
// Inline SVG icon components for the bottom navbar.
// No separate image files needed — colors are driven by props.
//
// Usage:
//   <ShopIcon    color={theme.primary} active={isActive} />
//   <WishlistIcon color={theme.primary} active={isActive} />
//   <OrdersIcon  color={theme.primary} active={isActive} />
//   <ProfileIcon color={theme.primary} active={isActive} />

export type NavIconProps = {
  color:  string   // pass theme.primary from useTheme()
  active: boolean  // true = filled, false = outline
  size?:  number   // defaults to 24
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOP — storefront (awning + door + window)
// ─────────────────────────────────────────────────────────────────────────────
export function ShopIcon({ color, active, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        // ── FILLED ──────────────────────────────────────────────────────────
        <>
          {/* Building base */}
          <path
            d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z"
            fill={color}
          />

          {/* Awning */}
          <path
            d="M3 10h18l-1.5-4H4.5L3 10z"
            fill={color}
          />

          {/* Door cutout */}
          <rect x="13" y="13" width="4" height="7" rx="1" fill="white" fillOpacity="0.85" />

          {/* Window cutout */}
          <rect x="6" y="13" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.85" />

          {/* Awning scallops */}
          <path
            d="M3 10c0 1 1 2 2 2s2-1 2-2 1 2 2 2 2-1 2-2 1 2 2 2 2-1 2-2 1 2 2 2 2-1 2-2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </>
      ) : (
        // ── OUTLINE ─────────────────────────────────────────────────────────
        <>
          {/* Base */}
          <path
            d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Awning top */}
          <path
            d="M3 10h18l-1.5-4H4.5L3 10z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Awning scallops */}
          <path
            d="M3 10c0 1 1 2 2 2s2-1 2-2 1 2 2 2 2-1 2-2 1 2 2 2 2-1 2-2 1 2 2 2 2-1 2-2"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Door */}
          <rect
            x="13"
            y="13"
            width="4"
            height="7"
            rx="1"
            stroke={color}
            strokeWidth="1.6"
          />

          {/* Window */}
          <rect
            x="6"
            y="13"
            width="4"
            height="4"
            rx="0.5"
            stroke={color}
            strokeWidth="1.6"
          />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CART — shopping trolley with handle, basket, and wheels
// ─────────────────────────────────────────────────────────────────────────────
export function CartIcon({ color, active, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        // ── FILLED ────────────────────────────────────────────────────────
        <>
          {/* Basket body */}
          <path
            d="M6 5h14l-1.68 7.39A2 2 0 0 1 16.37 14H8.64a2 2 0 0 1-1.96-1.61L5.12 5H3a1 1 0 1 1 0-2h3a1 1 0 0 1 .98.8L7.16 5H6z"
            fill={color}
          />
          {/* Basket fill (the cargo area) */}
          <path
            d="M6.5 7h12.6l-1.3 5.74A1 1 0 0 1 16.82 13H8.18a1 1 0 0 1-.98-.8L6.5 7z"
            fill={color}
          />
          {/* Inner highlight lines */}
          <line x1="10" y1="8.5" x2="10" y2="12" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="13" y1="8.5" x2="13" y2="12" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
          {/* Left wheel */}
          <circle cx="9" cy="18" r="1.5" fill={color} />
          {/* Right wheel */}
          <circle cx="17" cy="18" r="1.5" fill={color} />
          {/* Wheel inner dots */}
          <circle cx="9"  cy="18" r="0.5" fill="white" fillOpacity="0.7" />
          <circle cx="17" cy="18" r="0.5" fill="white" fillOpacity="0.7" />
        </>
      ) : (
        // ── OUTLINE ───────────────────────────────────────────────────────
        <>
          {/* Handle + basket body */}
          <path
            d="M2 3h2.2l.42 2M7 13h10l1.68-7.39A1 1 0 0 0 17.72 4H5.62"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Basket bottom */}
          <path
            d="M7 13a2 2 0 0 0 1.96 1.6h7.74A2 2 0 0 0 18.68 13"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Left wheel */}
          <circle
            cx="9"
            cy="18.5"
            r="1.5"
            stroke={color}
            strokeWidth="1.6"
          />
          {/* Right wheel */}
          <circle
            cx="17"
            cy="18.5"
            r="1.5"
            stroke={color}
            strokeWidth="1.6"
          />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS — receipt with torn bottom + content lines
// ─────────────────────────────────────────────────────────────────────────────
export function OrdersIcon({ color, active, size = 24 }: NavIconProps) {
  // Torn/wavy bottom edge path shared between outline and filled
  const bodyPath =
    "M6.5 3h11a1 1 0 0 1 1 1v13.5" +
    "l-1.75-1-1.75 1-1.75-1-1.75 1-1.75-1-1.75 1" +
    "L5.5 17.5V4a1 1 0 0 1 1-1z"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        // ── FILLED ──────────────────────────────────────────────────────────
        <>
          <path d={bodyPath} fill={color} />
          {/* Content lines — white */}
          <line x1="9" y1="8"    x2="15" y2="8"    stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="11"   x2="15" y2="11"   stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="14"   x2="13" y2="14"   stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        // ── OUTLINE ─────────────────────────────────────────────────────────
        <>
          <path d={bodyPath} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          {/* Content lines */}
          <line x1="9" y1="8"    x2="15" y2="8"    stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="11"   x2="15" y2="11"   stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="14"   x2="13" y2="14"   stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE — head circle + shoulder arc
// ─────────────────────────────────────────────────────────────────────────────
export function ProfileIcon({ color, active, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {active ? (
        // ── FILLED ──────────────────────────────────────────────────────────
        <>
          {/* Head */}
          <circle cx="12" cy="8" r="3.75" fill={color} />
          {/* Shoulder / body fill */}
          <path
            d="M4.25 21.5a7.75 7.75 0 0 1 15.5 0H4.25z"
            fill={color}
          />
          {/* Inner highlight on head */}
          <circle cx="10.5" cy="7" r="1" fill="white" fillOpacity="0.35" />
        </>
      ) : (
        // ── OUTLINE ─────────────────────────────────────────────────────────
        <>
          {/* Head */}
          <circle
            cx="12"
            cy="8"
            r="3.75"
            stroke={color}
            strokeWidth="1.8"
          />
          {/* Shoulders arc */}
          <path
            d="M4.25 21.5a7.75 7.75 0 0 1 15.5 0"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP: iconId string → component (for use in BottomNavbar)
// ─────────────────────────────────────────────────────────────────────────────
export const NAV_ICON_MAP: Record<
  string,
  React.ComponentType<NavIconProps>
> = {
  shop:     ShopIcon,
  wishlist: CartIcon,
  orders:   OrdersIcon,
  profile:  ProfileIcon,
}