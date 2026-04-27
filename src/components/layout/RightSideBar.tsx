"use client"
// src/components/layout/RightSidebar.tsx
//
// Desktop-only right sidebar (hidden on mobile).
// Mirrors LeftSidebar width and structure.
// Houses customer ↔ admin conversations — empty state for now.

import { useTheme } from "@/providers/theme-provider"
import { MessageCircle } from "lucide-react"

export default function RightSidebar() {
  const { theme } = useTheme()

  return (
    <aside
      aria-label="Messages sidebar"
      className="
        hidden lg:flex
        flex-col
        fixed right-0 top-0 bottom-0
        w-[68px] xl:w-[220px]
        z-40
        bg-white
        transition-all duration-300
      "
    >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center xl:items-start pt-8 pb-6 px-3 xl:px-5">
        <div className="flex items-center gap-3">
          {/* Icon circle */}
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-400"
            style={{ background: `${theme.primary}15` }}
          >
            <MessageCircle
              size={16}
              style={{ color: theme.primary, transition: "color 0.4s ease" }}
            />
          </div>

          {/* Label — xl only */}
          <span className="hidden xl:block text-base font-extrabold tracking-tight text-gray-900">
            Messages
          </span>
        </div>

        {/* Hairline divider */}
        <div className="mt-5 xl:w-full w-8 h-px rounded-full bg-gray-200" />
      </div>

      {/* ── Conversation list (empty state) ─────────────────────────────── */}
      <div className="flex flex-col flex-1 items-center justify-center px-3 gap-3">

        {/* Collapsed (icon-only) view */}
        <div
          className="
            xl:hidden
            w-9 h-9 rounded-xl flex items-center justify-center
          "
          style={{ background: `${theme.primary}10` }}
        >
          <MessageCircle
            size={16}
            style={{ color: theme.primary }}
          />
        </div>

        {/* Expanded empty state — xl only */}
        <div className="hidden xl:flex flex-col items-center gap-3 text-center px-2">
          {/* Illustration bubble */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: `${theme.primary}10` }}
          >
            <MessageCircle
              size={24}
              style={{ color: theme.primary, transition: "color 0.4s ease" }}
            />
          </div>

          <p className="text-[13px] font-semibold text-gray-700 leading-snug">
            No conversations yet
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Messages between you and our team will appear here.
          </p>

          {/* CTA pill */}
          <button
            className="
              mt-1 px-4 py-2 rounded-xl text-[11px] font-bold
              text-white transition-all duration-200
              hover:opacity-90 active:scale-[0.97]
            "
            style={{ background: theme.primary, transition: "background 0.4s ease" }}
          >
            Start a chat
          </button>
        </div>
      </div>

      {/* ── Bottom strip ────────────────────────────────────────────────── */}
      <div className="px-2 xl:px-3 pb-6 flex flex-col gap-3 items-center xl:items-stretch">
        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Online indicator pill — xl only */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium truncate text-gray-500">
            Support online
          </span>
        </div>

        {/* Collapsed: just the dot */}
        <div className="xl:hidden w-2 h-2 rounded-full bg-emerald-400 animate-pulse mx-auto" />
      </div>
    </aside>
  )
}