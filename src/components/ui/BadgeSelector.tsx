// components/ui/BadgeSelector.tsx
"use client"

import { PRODUCT_BADGE, type ProductBadge } from "@/lib/validators/product-validator"

const BADGE_CONFIG: Record<ProductBadge, {
  label: string
  emoji: string
  bg: string
  border: string
  text: string
  activeBg: string
}> = {
  new:     { label: "New Arrival",  emoji: "✨", bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700",  activeBg: "bg-blue-500"   },
  sale:    { label: "On Sale",      emoji: "🏷️", bg: "bg-red-50",    border: "border-red-200",   text: "text-red-600",   activeBg: "bg-red-500"    },
  hot:     { label: "Hot Item",     emoji: "🔥", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", activeBg: "bg-orange-500" },
  organic: { label: "Organic",      emoji: "🌿", bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", activeBg: "bg-[#1a5c38]"  },
}

type Props = {
  value:    ProductBadge | undefined
  onChange: (badge: ProductBadge | undefined) => void
  disabled?: boolean
}

export default function BadgeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        Product Badge{" "}
        <span className="text-xs font-normal text-gray-400">(optional)</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {PRODUCT_BADGE.map((badge) => {
          const cfg      = BADGE_CONFIG[badge]
          const isActive = value === badge

          return (
            <button
              key={badge}
              type="button"
              disabled={disabled}
              onClick={() => onChange(isActive ? undefined : badge)}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2
                text-sm font-semibold transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive
                  ? `${cfg.activeBg} border-transparent text-white shadow-md`
                  : `${cfg.bg} ${cfg.border} ${cfg.text} hover:shadow-sm`
                }
              `}
            >
              <span className="text-base leading-none">{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {isActive && (
                <span className="ml-auto text-white/80 text-xs">✓ selected</span>
              )}
            </button>
          )
        })}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-gray-400 hover:text-gray-600 text-left transition-colors"
          disabled={disabled}
        >
          × Clear badge
        </button>
      )}
    </div>
  )
}