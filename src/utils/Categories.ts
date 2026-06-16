// utils/Categories.ts

export type Category = {
  label: string
  icon: string  // emoji — no more React Icons dependency
  color: string
}

export const categories: Category[] = [
  { label: "All",           icon: "🛒", color: "#f0faf4" },
  { label: "Fruits",        icon: "🍎", color: "#e8f5e9" },
  { label: "Vegetables",    icon: "🥦", color: "#f1f8e9" },
  { label: "Grocery",       icon: "🛍️", color: "#fffde7" },
  { label: "Dairy",         icon: "🥛", color: "#e3f2fd" },
  { label: "Bakery",        icon: "🍞", color: "#fff3e0" },
  { label: "Beverages",     icon: "🧃", color: "#fce4ec" },
  { label: "Snacks",        icon: "🍪", color: "#f3e5f5" },
  {label: "Swallow Foods",icon: "🥩", color: "#e3f2fd"},
  {label: "Electronics", icon: "🥩", color: "#e0f7fa"},
  {label: "Drinks", icon: "🥩", color: "#e0f7fa"},
  { label: "Frozen Foods",  icon: "🧊", color: "#e0f7fa" },
  { label: "Household",     icon: "🧹", color: "#fafafa" },
  { label: "Meat & Fish",   icon: "🥩", color: "#fbe9e7" },
  { label: "Grains & Rice", icon: "🌾", color: "#f9fbe7" },
  
]