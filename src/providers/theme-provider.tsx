"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export type TabId = "restaurant" | "supermarket" | "hospitality" | "farm"
export type ColorKey = "red" | "green" | "amber"

export const TAB_TO_COLOR: Record<TabId, ColorKey> = {
  restaurant:  "red",
  supermarket: "green",
  hospitality: "amber",
  farm:        "green",
}

export type TabTheme = {
  id:            TabId
  colorKey:      ColorKey
  label:         string
  primary:       string
  primaryHover:  string
  primaryLight:  string
  primaryBorder: string
  primaryText:   string
}

export const THEMES: Record<TabId, TabTheme> = {
  restaurant: {
    id:            "restaurant",
    colorKey:      "red",
    label:         "Restaurant",
    primary:       "#C0392B",
    primaryHover:  "#9B2B1F",
    primaryLight:  "#FDF0EF",
    primaryBorder: "#F5B7B1",
    primaryText:   "#922B21",
  },
  supermarket: {
    id:            "supermarket",
    colorKey:      "green",
    label:         "Market",
    primary:       "#1a5c38",
    primaryHover:  "#144d2e",
    primaryLight:  "#EAF3DE",
    primaryBorder: "#C0DD97",
    primaryText:   "#27500A",
  },
  hospitality: {
    id:            "hospitality",
    colorKey:      "amber",
    label:         "Hotel",
    primary:       "#BA7517",
    primaryHover:  "#9A6010",
    primaryLight:  "#FDF3E3",
    primaryBorder: "#FAC775",
    primaryText:   "#633806",
  },
  farm: {
    id:            "farm",
    colorKey:      "green",
    label:         "Farm",
    primary:       "#0F6E56",
    primaryHover:  "#0a5a45",
    primaryLight:  "#E1F5EE",
    primaryBorder: "#9FE1CB",
    primaryText:   "#085041",
  },
}

const STORAGE_KEY = "dase-active-tab"
const DEFAULT_TAB: TabId = "supermarket"

function injectCssVars(t: TabTheme) {
  const root = document.documentElement
  root.style.setProperty("--theme-primary",        t.primary)
  root.style.setProperty("--theme-primary-hover",  t.primaryHover)
  root.style.setProperty("--theme-primary-light",  t.primaryLight)
  root.style.setProperty("--theme-primary-border", t.primaryBorder)
  root.style.setProperty("--theme-primary-text",   t.primaryText)
  root.setAttribute("data-theme",      t.id)
  root.setAttribute("data-color-key",  t.colorKey)
}

function readStoredTab(): TabId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as TabId | null
    return stored && stored in THEMES ? stored : DEFAULT_TAB
  } catch {
    return DEFAULT_TAB
  }
}

type ThemeContextValue = {
  activeTab:    TabId
  theme:        TabTheme
  colorKey:     ColorKey
  setActiveTab: (id: TabId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with default to avoid SSR mismatch, hydrate from localStorage on mount
  const [activeTab, setActiveTabState] = useState<TabId>(DEFAULT_TAB)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const stored = readStoredTab()
    setActiveTabState(stored)
    injectCssVars(THEMES[stored])
  }, [])

  const setActiveTab = useCallback((id: TabId) => {
    setActiveTabState(id)
    injectCssVars(THEMES[id])
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage blocked (private mode, etc.) — silent fail
    }
  }, [])

  const theme = THEMES[activeTab]

  return (
    <NextThemesProvider attribute="class" enableSystem={false} defaultTheme="light">
      <ThemeContext.Provider
        value={{ activeTab, theme, colorKey: theme.colorKey, setActiveTab }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>")
  return ctx
}