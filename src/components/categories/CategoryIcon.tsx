// src/components/categories/CategoryIcon.tsx
//
// Hand-drawn line icons for the DASE Supermarket category set — replaces the
// old emoji icons with crisp, theme-able SVGs (24x24, stroke-based, matching
// the lucide-react icon language already used across the app).
//
// Usage: <CategoryIcon label="Fruits" size={22} color="#2e7d32" />
// `color` defaults to "currentColor" so it inherits from surrounding CSS.

type Props = {
  label: string
  size?: number
  color?: string
  className?: string
}

function normalize(label: string) {
  return label.toLowerCase().replace(/[^a-z]/g, "")
}

export default function CategoryIcon({ label, size = 24, color = "currentColor", className }: Props) {
  const key = normalize(label)
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  }

  switch (key) {
    // ── All ──────────────────────────────────────────────────────────────
    case "all":
      return (
        <svg {...common}>
          <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill={color} stroke="none" />
          <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill={color} stroke="none" />
          <path d="M1.5 2h3l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6.5H6.2" />
        </svg>
      )

    // ── Fruits ───────────────────────────────────────────────────────────
    case "fruits":
      return (
        <svg {...common}>
          <path d="M12.5 8.2c-1-1.3-2.7-1.7-4.1-1" />
          <path d="M13.4 6.1c.5-.9 1.6-1.5 2.8-1.4-.1 1.2-.9 2.2-2.1 2.5" />
          <path d="M12 8.5c-3-1.9-6.5.1-6.5 4.3 0 4 2.9 8.2 5.4 8.2.9 0 1.1-.4 1.1-.4s.2.4 1.1.4c2.5 0 5.4-4.2 5.4-8.2 0-4.2-3.5-6.2-6.5-4.3Z" />
        </svg>
      )

    // ── Vegetables ───────────────────────────────────────────────────────
    case "vegetables":
      return (
        <svg {...common}>
          <path d="M12 10V21" />
          <path d="M9 21h6" />
          <circle cx="10" cy="7" r="3.2" />
          <circle cx="14.2" cy="6" r="2.6" />
          <circle cx="12" cy="4" r="2.2" />
        </svg>
      )

    // ── Grocery (shopping basket) ────────────────────────────────────────
    case "grocery":
      return (
        <svg {...common}>
          <path d="M6 8.5c0-1.9 2.7-3.5 6-3.5s6 1.6 6 3.5c0 .7-.4 1.3-1 1.8l1 9.7a1.2 1.2 0 0 1-1.2 1.3H7.2A1.2 1.2 0 0 1 6 20l1-9.7c-.6-.5-1-1.1-1-1.8Z" />
          <path d="M6.6 9.6h10.8" />
        </svg>
      )

    // ── Dairy ────────────────────────────────────────────────────────────
    case "dairy":
      return (
        <svg {...common}>
          <path d="M9.5 2.5h5v4l1.7 2.6c.5.8.8 1.7.8 2.7v7.7a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5v-7.7c0-1 .3-1.9.8-2.7l1.7-2.6v-4Z" />
          <path d="M9.5 4.5h5" />
          <path d="M8 14.5h8" />
        </svg>
      )

    // ── Bakery ───────────────────────────────────────────────────────────
    case "bakery":
      return (
        <svg {...common}>
          <path d="M5.5 12.5c0-4.4 2.9-8 6.5-8s6.5 3.6 6.5 8" />
          <path d="M4.2 12.5h15.6c.7 0 1.2.6 1.1 1.3l-.6 3.4a2 2 0 0 1-2 1.6H5.7a2 2 0 0 1-2-1.6l-.6-3.4c-.1-.7.4-1.3 1.1-1.3Z" />
        </svg>
      )

    // ── Beverages (cup with straw) ───────────────────────────────────────
    case "beverages":
      return (
        <svg {...common}>
          <path d="M6 8h9l-.9 11.2a1.5 1.5 0 0 1-1.5 1.3H8.4a1.5 1.5 0 0 1-1.5-1.3L6 8Z" />
          <path d="M9.5 8V5.5a2.5 2.5 0 0 1 5 0" />
          <path d="M17 11l1.6 1.4c.6.5.6 1.4 0 1.9L17 15.7" />
        </svg>
      )

    // ── Snacks (cookie) ──────────────────────────────────────────────────
    case "snacks":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.2" />
          <circle cx="9.3" cy="10" r="0.9" fill={color} stroke="none" />
          <circle cx="13.5" cy="8.8" r="0.9" fill={color} stroke="none" />
          <circle cx="15.2" cy="13.2" r="0.9" fill={color} stroke="none" />
          <circle cx="10.5" cy="14.8" r="0.9" fill={color} stroke="none" />
        </svg>
      )

    // ── Swallow Foods (bowl + steam) ─────────────────────────────────────
    case "swallowfoods":
      return (
        <svg {...common}>
          <path d="M5 16.5c0-4 2.5-9.5 7-11.5 4.5 2 7 7.5 7 11.5a7 5.5 0 0 1-14 0Z" />
          <path d="M5 16.5a7 5.5 0 0 0 14 0" />
          <path d="M9 17.5c.8.6 1.9.9 3 .9M15 17.5c-.8.6-1.9.9-3 .9" />
        </svg>
      )

    // ── Electronics (lightning bolt) ─────────────────────────────────────
    case "electronics":
      return (
        <svg {...common}>
          <path d="M13 2 5 13.5h5.5L10 22l8-11.5h-5.5L13 2Z" strokeLinejoin="round" />
        </svg>
      )

    // ── Drinks (bottle) ──────────────────────────────────────────────────
    case "drinks":
      return (
        <svg {...common}>
          <path d="M10 2h4v3.3l1.7 1.9c.5.6.8 1.3.8 2.1v10.2a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5V9.3c0-.8.3-1.5.8-2.1L10 5.3V2Z" />
          <path d="M8 13.5h8" />
        </svg>
      )

    // ── Frozen Foods (snowflake) ─────────────────────────────────────────
    case "frozenfoods":
      return (
        <svg {...common}>
          <path d="M12 4.2v15.6M4.2 12h15.6" />
          <path d="M12 2v2.2M9.2 3.5l1.1 1.9M14.8 3.5l-1.1 1.9" />
          <path d="M12 22v-2.2M9.2 20.5l1.1-1.9M14.8 20.5l-1.1-1.9" />
          <path d="M2 12h2.2M3.5 9.2l1.9 1.1M3.5 14.8l1.9-1.1" />
          <path d="M22 12h-2.2M20.5 9.2l-1.9 1.1M20.5 14.8l-1.9-1.1" />
        </svg>
      )

    // ── Household (spray + sparkle) ──────────────────────────────────────
    case "household":
      return (
        <svg {...common}>
          <path d="M14.5 3.5 6 12l1.8 1.8L16 6.2" />
          <path d="M12.7 5.3 15 3l2 2-2.3 2.7" />
          <path d="M6 12 3.5 19.5 11 17l-3.2-3.2" />
        </svg>
      )

    // ── Meat & Fish ──────────────────────────────────────────────────────
    case "meatfish":
      return (
        <svg {...common}>
          <path d="M14 3c3 0 5.5 3 5.5 6.5S17.5 15 15 15c-1 0-1.6-.3-2.2-.8" />
          <path d="M12.8 14.2 5 22l-2-2 7.8-7.8" />
          <path d="M9.5 11 12.8 14.2" />
        </svg>
      )

    // ── Grains & Rice (sheaf of wheat) ───────────────────────────────────
    case "grainsrice":
      return (
        <svg {...common}>
          <path d="M12 21V9" />
          <path d="M12 9c0-3.5-2-6-5-6.5C6.5 5.5 8.5 8.5 12 9Z" />
          <path d="M12 9c0-3.5 2-6 5-6.5C17.5 5.5 15.5 8.5 12 9Z" />
          <path d="M12 14c0-2.5-1.6-4.3-3.8-4.7C8 11.8 9.5 13.8 12 14Z" />
          <path d="M12 14c0-2.5 1.6-4.3 3.8-4.7C16 11.8 14.5 13.8 12 14Z" />
        </svg>
      )

    // ── Fallback: shopping bag ───────────────────────────────────────────
    default:
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12.2a1.5 1.5 0 0 1-1.5 1.3H8.5A1.5 1.5 0 0 1 7 20.2L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      )
  }
}