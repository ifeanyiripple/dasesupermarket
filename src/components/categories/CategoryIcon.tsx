// src/components/categories/CategoryIcon.tsx
//
// Bold, duotone line icons for the DASE Supermarket category set.
// Each icon is drawn on a 24x24 grid, uses a heavier 2px stroke, a subtle
// tinted body fill and solid accents so it reads as bold & premium while
// staying fully theme-able (color defaults to `currentColor`).
//
// Usage: <CategoryIcon label="Household" size={30} color="#1a5c38" />

type Props = {
  label: string
  size?: number
  color?: string
  className?: string
}

function normalize(label: string) {
  return label.toLowerCase().replace(/[^a-z]/g, "")
}

export default function CategoryIcon({
  label,
  size = 28,
  color = "currentColor",
  className,
}: Props) {
  const key = normalize(label)

  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  }

  // duotone body fill (soft tint of the icon color)
  const tint = { fill: color, fillOpacity: 0.16 }
  // solid accent (dots, seeds, etc.)
  const solid = { fill: color, stroke: "none" }

  switch (key) {
    // ── All (category grid) ──────────────────────────────────────────────
    case "all":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2.4" {...tint} />
          <rect x="13" y="3" width="8" height="8" rx="2.4" />
          <rect x="3" y="13" width="8" height="8" rx="2.4" />
          <rect x="13" y="13" width="8" height="8" rx="2.4" {...tint} />
        </svg>
      )

    // ── Fruits (apple + leaf) ────────────────────────────────────────────
    case "fruits":
      return (
        <svg {...common}>
          <path
            d="M12 8.4C10.6 6.7 8.2 6.2 6.4 7.1 4.1 8.3 3.4 11.3 4.2 14.2c.8 3.3 3.2 6.6 5.3 6.6.9 0 1.4-.4 2.5-.4s1.6.4 2.5.4c2.1 0 4.5-3.3 5.3-6.6.8-2.9.1-5.9-2.2-7.1-1.8-.9-4.2-.4-5.6 1.3Z"
            {...tint}
          />
          <path d="M12 8.4V4.6" />
          <path d="M12 4.8c0-1.7 1.4-3 3.4-3 0 1.7-1.5 3-3.4 3Z" {...tint} />
        </svg>
      )

    // ── Vegetables (carrot) ──────────────────────────────────────────────
    case "vegetables":
      return (
        <svg {...common}>
          <path
            d="M14.8 9.2 6.5 17.5c-.9.9-2.3.9-3.1 0-.9-.9-.9-2.3 0-3.1l8.3-8.3c2.1-1.3 4.5.9 3.1 3.1Z"
            {...tint}
          />
          <path d="M14 6.6c.1-1.9 1.5-3.3 3.6-3.4-.1 2-1.4 3.4-3.4 3.6" />
          <path d="M15.6 8.2c1.8-.7 3.6-.2 4.8 1.2-1.6 1-3.5.8-4.9-.4" />
          <path d="M9.5 12.5l1.4 1.4M12 10l1.4 1.4" />
        </svg>
      )

    // ── Grocery (shopping basket) ────────────────────────────────────────
    case "grocery":
      return (
        <svg {...common}>
          <path
            d="M4.5 8.5h15l-1.2 9.9a2.3 2.3 0 0 1-2.3 2H8a2.3 2.3 0 0 1-2.3-2L4.5 8.5Z"
            {...tint}
          />
          <path d="M8 8.5a4 4 0 0 1 8 0" />
          <path d="M9.5 12v4.5M14.5 12v4.5" />
        </svg>
      )

    // ── Dairy (milk carton) ──────────────────────────────────────────────
    case "dairy":
      return (
        <svg {...common}>
          <path
            d="M7 9 12 3.6 17 9v9.6a1.8 1.8 0 0 1-1.8 1.8H8.8A1.8 1.8 0 0 1 7 18.6V9Z"
            {...tint}
          />
          <path d="M7 9h10" />
          <path d="M12 3.6V9" />
          <path d="M9.5 13h5v3.5h-5z" />
        </svg>
      )

    // ── Bakery (bread loaf) ──────────────────────────────────────────────
    case "bakery":
      return (
        <svg {...common}>
          <path
            d="M3.8 11.4h16.4a1 1 0 0 1 1 1.1l-.6 4.4a2.4 2.4 0 0 1-2.4 2.1H5.8a2.4 2.4 0 0 1-2.4-2.1l-.6-4.4a1 1 0 0 1 1-1.1Z"
            {...tint}
          />
          <path d="M4.8 11.4c0-3.7 3.2-6.3 7.2-6.3s7.2 2.6 7.2 6.3" />
          <path d="M9 8.4 10.1 6.7M13 8.2 14.1 6.5" />
        </svg>
      )

    // ── Beverages (soda cup + straw) ─────────────────────────────────────
    case "beverages":
      return (
        <svg {...common}>
          <path
            d="M6.4 8.5h11.2l-1 11.1a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6L6.4 8.5Z"
            {...tint}
          />
          <path d="M5.2 8.5h13.6" />
          <path d="M13.6 8.5 15.4 4l2 .6" />
          <path d="M8.2 12.5h7.6" />
        </svg>
      )

    // ── Snacks (choc-chip cookie) ────────────────────────────────────────
    case "snacks":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.6" {...tint} />
          <circle cx="9.2" cy="9.6" r="1.05" {...solid} />
          <circle cx="13.8" cy="8.8" r="1.05" {...solid} />
          <circle cx="15.4" cy="13.4" r="1.05" {...solid} />
          <circle cx="9.6" cy="14.8" r="1.05" {...solid} />
          <circle cx="12.4" cy="12.2" r="0.9" {...solid} />
        </svg>
      )

    // ── Swallow Foods (mound in bowl + steam) ────────────────────────────
    case "swallowfoods":
      return (
        <svg {...common}>
          <path d="M5 12.5C5.6 6.3 18.4 6.3 19 12.5Z" {...tint} />
          <path
            d="M2.8 12.5h18.4l-1.4 3.6A4 4 0 0 1 16.1 18.4H7.9A4 4 0 0 1 4.2 16.1L2.8 12.5Z"
            {...tint}
          />
          <path d="M9.6 5.6c-1-.9-1-2 0-2.9M14.4 5.4c-1-.9-1-2 0-2.9" />
        </svg>
      )

    // ── Electronics (lightning bolt) ─────────────────────────────────────
    case "electronics":
      return (
        <svg {...common}>
          <path
            d="M13.6 2.4 5.1 13.1c-.5.6-.1 1.5.7 1.5H10l-1 6.7c-.1.9 1 1.4 1.5.7L18.9 11c.5-.6.1-1.5-.7-1.5H14l.8-6.7c.1-.9-.9-1.3-1.2-.4Z"
            {...tint}
          />
        </svg>
      )

    // ── Drinks (bottle) ──────────────────────────────────────────────────
    case "drinks":
      return (
        <svg {...common}>
          <path d="M10.2 1.5h3.6v1.6h-3.6z" {...tint} />
          <path
            d="M10.2 3.1h3.6v1.5l1.5 2.4c.4.7.7 1.5.7 2.3v9.4a1.8 1.8 0 0 1-1.8 1.8H9.8A1.8 1.8 0 0 1 8 20.7v-9.4c0-.8.3-1.6.7-2.3l1.5-2.4V3.1Z"
            {...tint}
          />
          <path d="M8.2 12h7.6" />
          <path d="M8.2 16h7.6" />
        </svg>
      )

    // ── Frozen Foods (snowflake) ─────────────────────────────────────────
    case "frozenfoods":
      return (
        <svg {...common}>
          <path d="M12 2.5v19" />
          <path d="M3.8 7.25 20.2 16.75" />
          <path d="M20.2 7.25 3.8 16.75" />
          <path d="M9.5 4.5 12 6.6 14.5 4.5" />
          <path d="M9.5 19.5 12 17.4 14.5 19.5" />
          <path d="M3 10.4 3.6 13.2 6.4 12.9" />
          <path d="M21 13.6 20.4 10.8 17.6 11.1" />
          <path d="M3 13.6 3.6 10.8 6.4 11.1" />
          <path d="M21 10.4 20.4 13.2 17.6 12.9" />
        </svg>
      )

    // ── Household (spray bottle + mist) ──────────────────────────────────
    case "household":
      return (
        <svg {...common}>
          <path
            d="M9 8.5h5a2.5 2.5 0 0 1 2.5 2.5v8a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2v-7.5A3 3 0 0 1 9 8.5Z"
            {...tint}
          />
          <path d="M9.5 8.5v-2h4v2" />
          <path d="M13.5 4.5h-6a2 2 0 0 0-2 2v.5" />
          <path d="M5.5 6 3.5 4.7" />
          <path d="M9.5 13.5h5v3.5h-5z" />
          <circle cx="3" cy="7.5" r="0.75" {...solid} />
          <circle cx="2.4" cy="10" r="0.75" {...solid} />
          <circle cx="4.6" cy="9.4" r="0.75" {...solid} />
        </svg>
      )

    // ── Meat & Fish (drumstick) ──────────────────────────────────────────
    case "meatfish":
      return (
        <svg {...common}>
          <path
            d="M11.7 5.4c2.5-2.5 6.6-1.7 8 1.3 1.2 2.6-.1 5.6-2.7 6.4-1.4.4-2.4.1-3.4-.6l-.8-.6-1.4 1.4"
            {...tint}
          />
          <path d="M13.4 12.6 6.9 19.1" />
          <circle cx="5.2" cy="18.1" r="2" {...tint} />
          <circle cx="6.9" cy="19.8" r="2" {...tint} />
        </svg>
      )

    // ── Grains & Rice (wheat sheaf) ──────────────────────────────────────
    case "grainsrice":
      return (
        <svg {...common}>
          <path d="M12 21.5V8" />
          <path d="M12 8c-2.4 0-4.3-2-4.3-4.4C10.1 3.6 12 5.6 12 8Z" {...tint} />
          <path d="M12 8c2.4 0 4.3-2 4.3-4.4C13.9 3.6 12 5.6 12 8Z" {...tint} />
          <path d="M12 13c-2.4 0-4.3-2-4.3-4.4C10.1 8.6 12 10.6 12 13Z" {...tint} />
          <path d="M12 13c2.4 0 4.3-2 4.3-4.4C13.9 8.6 12 10.6 12 13Z" {...tint} />
          <path d="M12 18c-2.4 0-4.3-2-4.3-4.4C10.1 13.6 12 15.6 12 18Z" {...tint} />
          <path d="M12 18c2.4 0 4.3-2 4.3-4.4C13.9 13.6 12 15.6 12 18Z" {...tint} />
        </svg>
      )

    // ── Fallback: shopping bag ───────────────────────────────────────────
    default:
      return (
        <svg {...common}>
          <path
            d="M5.8 8h12.4l-1 11.6a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L5.8 8Z"
            {...tint}
          />
          <path d="M9 8V6.3a3 3 0 0 1 6 0V8" />
        </svg>
      )
  }
}
