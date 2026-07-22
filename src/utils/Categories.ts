// utils/Categories.ts
//
// NOTE: `label` is also the exact value stored on Product.category
// (see admin/Itemformmodal.tsx and product/create). Don't rename a label
// here without also migrating existing product rows in the DB.

export type Category = {
  label: string
  icon: string  // emoji fallback — SVGs now live in components/categories/CategoryIcon.tsx
  color: string
}

export const categories: Category[] = [
  { label: "All",           icon: "🛒", color: "#f0faf4" },
  { label: "Fruits",        icon: "🍎", color: "#e8f5e9" },
  { label: "Vegetables",    icon: "🥦", color: "#f1f8e9" },
  { label: "Body Care",     icon: "🍞", color: "#fff3e0" },
  { label: "Grocery",       icon: "🛍️", color: "#fffde7" },
  { label: "Dairy",         icon: "🥛", color: "#e3f2fd" },
  { label: "Bakery",        icon: "🍞", color: "#fff3e0" },
  { label: "Beverages",     icon: "🧃", color: "#fce4ec" },
  { label: "Snacks",        icon: "🍪", color: "#f3e5f5" },
  { label: "Swallow Foods", icon: "🍲", color: "#e0f2f7" },
  { label: "Electronics",   icon: "🔌", color: "#e0f7fa" },
  { label: "Drinks",        icon: "🍹", color: "#e3f2fd" },
  { label: "Frozen Foods",  icon: "🧊", color: "#e1f0fb" },
  { label: "Household",     icon: "🧹", color: "#fafafa" },
  { label: "Meat & Fish",   icon: "🥩", color: "#fbe9e7" },
  { label: "Grains & Rice", icon: "🌾", color: "#f9fbe7" },
]