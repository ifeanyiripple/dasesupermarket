"use client"
// components/ui/OptionSelector.tsx

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { cn }     from "@/lib/utils"

export type OptionEntry = {
  name:      string
  price:     number
  isDefault: boolean
}

type Props = {
  title:            string
  description?:     string
  icon?:            React.ReactNode
  options:          OptionEntry[]
  onAdd:            (name: string, price: number) => void
  onRemove:         (index: number) => void
  onSetDefault:     (index: number) => void
  onClear:          () => void
  disabled?:        boolean
  namePlaceholder?: string
  accent?:          "amber" | "green"
}

export function OptionSelector({
  title, description, icon, options,
  onAdd, onRemove, onSetDefault, onClear,
  disabled = false, namePlaceholder = "Option name", accent = "amber",
}: Props) {
  const [nameInput,  setNameInput]  = useState("")
  const [priceInput, setPriceInput] = useState("")

  const handleAdd = () => {
    const name  = nameInput.trim()
    const price = parseFloat(priceInput)
    if (!name || isNaN(price) || price < 0) return
    onAdd(name, price)
    setNameInput("")
    setPriceInput("")
  }

  const a = accent === "amber"
    ? {
        row:   "border-amber-300 bg-amber-50",
        dot:   "border-amber-400 bg-amber-400",
        hover: "hover:border-amber-300",
        badge: "text-amber-600",
        price: "text-amber-700",
      }
    : {
        row:   "border-[#1a5c38]/30 bg-[#f0faf4]",
        dot:   "border-[#1a5c38] bg-[#1a5c38]",
        hover: "hover:border-[#1a5c38]/50",
        badge: "text-[#1a5c38]",
        price: "text-[#1a5c38]",
      }

  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-muted/10">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold flex items-center gap-2">
          {icon}
          {title}
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </p>
        {options.length > 0 && (
          <button type="button" onClick={onClear} disabled={disabled}
            className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
            <Trash2 size={11} /> Clear all
          </button>
        )}
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      {description && (
        <p className="text-xs text-muted-foreground -mt-2">{description}</p>
      )}

      {/* ── Input row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <Input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
          placeholder={namePlaceholder}
          disabled={disabled}
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold pointer-events-none">
            ₦
          </span>
          <Input
            type="number" min="0"
            value={priceInput}
            onChange={e => setPriceInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
            placeholder="Price"
            disabled={disabled}
            className="pl-7"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleAdd}
          disabled={disabled || !nameInput.trim() || !priceInput}>
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {/* ── Options list ─────────────────────────────────────────────── */}
      {options.length > 0 && (
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <div key={i} className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all",
              opt.isDefault ? a.row : "border-border bg-background"
            )}>
              {/* Default radio */}
              <button type="button" title="Set as default" disabled={disabled}
                onClick={() => onSetDefault(i)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center",
                  opt.isDefault ? a.dot : cn("border-gray-300", a.hover)
                )}>
                {opt.isDefault && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
              </button>

              <span className="text-sm font-semibold flex-1">{opt.name}</span>

              {opt.isDefault && (
                <span className={cn("text-[10px] font-bold uppercase tracking-wide flex-shrink-0", a.badge)}>
                  default
                </span>
              )}

              {opt.price > 0 && (
                <span className={cn("text-xs font-bold flex-shrink-0", a.price)}>
                  ₦{opt.price.toLocaleString()}
                </span>
              )}

              <button type="button" onClick={() => onRemove(i)} disabled={disabled}
                className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 ml-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Click the circle next to any option to mark it as default.
          </p>
        </div>
      )}
    </div>
  )
}