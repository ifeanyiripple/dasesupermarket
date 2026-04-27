// lib/demo-data.ts
// Replace these with real DB queries later

export type ProductImage = {
  color: string
  colorCode: string
  image: string
}

export type DemoProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  brand: string
  inStock: boolean
  rating: number
  reviewCount: number
  badge?: "new" | "sale" | "hot" | "organic"
  images: ProductImage[] // ← matches our Prisma Image[] relation
}

export type DemoCategory = {
  id: string
  label: string
  icon: string
  color: string
  count: number
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: "fruits",     label: "Fruits",          icon: "🍎", color: "#e8f5e9", count: 48 },
  { id: "vegetables", label: "Vegetables",       icon: "🥦", color: "#f1f8e9", count: 63 },
  { id: "dairy",      label: "Dairy",            icon: "🥛", color: "#e3f2fd", count: 29 },
  { id: "bakery",     label: "Bakery",           icon: "🍞", color: "#fff3e0", count: 34 },
  { id: "beverages",  label: "Beverages",        icon: "🧃", color: "#fce4ec", count: 52 },
  { id: "snacks",     label: "Snacks",           icon: "🍪", color: "#f3e5f5", count: 41 },
  { id: "frozen",     label: "Frozen Foods",     icon: "🧊", color: "#e0f7fa", count: 27 },
  { id: "household",  label: "Household",        icon: "🧹", color: "#fafafa", count: 38 },
  { id: "meat",       label: "Meat & Fish",      icon: "🥩", color: "#fbe9e7", count: 22 },
  { id: "grains",     label: "Grains & Rice",    icon: "🌾", color: "#f9fbe7", count: 18 },
]

export const FEATURED_PRODUCTS: DemoProduct[] = [
  {
    id: "p1",
    name: "Fresh Red Apples",
    description: "Crisp, sweet apples sourced locally from Nigerian farms",
    price: 1200,
    originalPrice: 1500,
    category: "Fruits",
    brand: "Farm Fresh",
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
    badge: "organic",
    images: [
      {
        color: "Red",
        colorCode: "#c0392b",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80",
      },
      {
        color: "Green",
        colorCode: "#27ae60",
        image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&q=80",
      },
      {
        color: "Mixed",
        colorCode: "#f1c40f",
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80",
      },
    ],
  },
  {
    id: "p2",
    name: "Full Cream Milk 1L",
    description: "Premium pasteurised whole milk, rich in calcium",
    price: 650,
    category: "Dairy",
    brand: "Peak",
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    badge: "hot",
    images: [
      {
        color: "White",
        colorCode: "#f5f5f5",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
      },
      {
        color: "Blue Pack",
        colorCode: "#2980b9",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
      },
      {
        color: "Carton",
        colorCode: "#e8d5a3",
        image: "https://images.unsplash.com/photo-1572549009290-e04d24bf2cbb?w=500&q=80",
      },
    ],
  },
  {
    id: "p3",
    name: "Sliced Whole Wheat Bread",
    description: "Freshly baked, high-fibre loaf — soft and nutritious",
    price: 800,
    originalPrice: 950,
    category: "Bakery",
    brand: "Butterfield",
    inStock: true,
    rating: 4.5,
    reviewCount: 67,
    badge: "sale",
    images: [
      {
        color: "Brown",
        colorCode: "#8b5e3c",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
      },
      {
        color: "Sliced",
        colorCode: "#d4a96a",
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&q=80",
      },
      {
        color: "Packaged",
        colorCode: "#c8a882",
        image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&q=80",
      },
    ],
  },
  {
    id: "p4",
    name: "Premium Basmati Rice 5kg",
    description: "Long-grain aromatic basmati — fluffy, fragrant and delicious",
    price: 4500,
    category: "Grains & Rice",
    brand: "Mama's Pride",
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
    badge: "new",
    images: [
      {
        color: "White",
        colorCode: "#f0ece0",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80",
      },
      {
        color: "Bag",
        colorCode: "#b8a898",
        image: "https://images.unsplash.com/photo-1536304993881-ff86e0c9b915?w=500&q=80",
      },
      {
        color: "Cooked",
        colorCode: "#f5f0e8",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&q=80",
      },
    ],
  },
  {
    id: "p5",
    name: "Fresh Orange Juice 1L",
    description: "100% natural squeezed orange juice — no additives",
    price: 1100,
    originalPrice: 1300,
    category: "Beverages",
    brand: "Chi",
    inStock: true,
    rating: 4.7,
    reviewCount: 58,
    badge: "sale",
    images: [
      {
        color: "Orange",
        colorCode: "#e67e22",
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80",
      },
      {
        color: "Carton",
        colorCode: "#f39c12",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80",
      },
      {
        color: "Squeezed",
        colorCode: "#ffa500",
        image: "https://images.unsplash.com/photo-1534353473418-4cfa0c5d0e1b?w=500&q=80",
      },
    ],
  },
  {
    id: "p6",
    name: "Free Range Eggs ×12",
    description: "Farm-raised, antibiotic free — packed fresh daily",
    price: 1800,
    category: "Dairy",
    brand: "Farm Choice",
    inStock: true,
    rating: 4.8,
    reviewCount: 142,
    images: [
      {
        color: "Brown",
        colorCode: "#a0522d",
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80",
      },
      {
        color: "White",
        colorCode: "#faebd7",
        image: "https://images.unsplash.com/photo-1491524062933-cb0289261700?w=500&q=80",
      },
      {
        color: "Carton",
        colorCode: "#d2b48c",
        image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80",
      },
    ],
  },
  {
    id: "p7",
    name: "Ripe Plantains ×6",
    description: "Sweet, perfectly ripened plantains — ready to fry or bake",
    price: 900,
    category: "Fruits",
    brand: "Local Farm",
    inStock: true,
    rating: 4.4,
    reviewCount: 33,
    badge: "organic",
    images: [
      {
        color: "Yellow",
        colorCode: "#f1c40f",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80",
      },
      {
        color: "Ripe",
        colorCode: "#f39c12",
        image: "https://images.unsplash.com/photo-1604052702887-83de1e06ad04?w=500&q=80",
      },
      {
        color: "Bunch",
        colorCode: "#d4881c",
        image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=500&q=80",
      },
    ],
  },
  {
    id: "p8",
    name: "Plum Tomatoes 500g",
    description: "Rich, juicy plum tomatoes — perfect for stews and sauces",
    price: 550,
    originalPrice: 700,
    category: "Vegetables",
    brand: "Garden Fresh",
    inStock: true,
    rating: 4.3,
    reviewCount: 76,
    badge: "sale",
    images: [
      {
        color: "Red",
        colorCode: "#e74c3c",
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=500&q=80",
      },
      {
        color: "Cherry",
        colorCode: "#c0392b",
        image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=500&q=80",
      },
      {
        color: "Mixed",
        colorCode: "#e8574e",
        image: "https://images.unsplash.com/photo-1524593689594-aae2f26b75ab?w=500&q=80",
      },
    ],
  },
]

export const DEAL_PRODUCTS: DemoProduct[] = [
  {
    id: "d1",
    name: "Frozen Chicken Breast 1kg",
    description: "Boneless, skinless, farm-raised — great for grilling or stews",
    price: 3200,
    originalPrice: 4500,
    category: "Meat & Fish",
    brand: "Zartech",
    inStock: true,
    rating: 4.6,
    reviewCount: 88,
    badge: "sale",
    images: [
      {
        color: "Fresh",
        colorCode: "#f5cba7",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&q=80",
      },
      {
        color: "Packaged",
        colorCode: "#e8c49e",
        image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&q=80",
      },
      {
        color: "Grilled",
        colorCode: "#c9924b",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
      },
    ],
  },
  {
    id: "d2",
    name: "Assorted Biscuits Pack",
    description: "Family selection of cookies & crackers — great for snacking",
    price: 1400,
    originalPrice: 2000,
    category: "Snacks",
    brand: "LU",
    inStock: true,
    rating: 4.5,
    reviewCount: 61,
    badge: "hot",
    images: [
      {
        color: "Classic",
        colorCode: "#d4a96a",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80",
      },
      {
        color: "Chocolate",
        colorCode: "#7b4f2e",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
      },
      {
        color: "Cream",
        colorCode: "#f5e6d0",
        image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&q=80",
      },
    ],
  },
  {
    id: "d3",
    name: "Sunflower Cooking Oil 5L",
    description: "Light, heart-healthy sunflower oil — ideal for all cooking",
    price: 5500,
    originalPrice: 7000,
    category: "Household",
    brand: "Kings",
    inStock: true,
    rating: 4.7,
    reviewCount: 190,
    badge: "sale",
    images: [
      {
        color: "Golden",
        colorCode: "#f0c040",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
      },
      {
        color: "Bottle",
        colorCode: "#d4a017",
        image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80",
      },
      {
        color: "Pour",
        colorCode: "#e8c84a",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&q=80",
      },
    ],
  },
  {
    id: "d4",
    name: "Laundry Detergent 2.5kg",
    description: "Heavy duty stain removal powder — fresh scent, powerful clean",
    price: 2200,
    originalPrice: 3000,
    category: "Household",
    brand: "Ariel",
    inStock: true,
    rating: 4.8,
    reviewCount: 112,
    badge: "sale",
    images: [
      {
        color: "Blue",
        colorCode: "#2980b9",
        image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80",
      },
      {
        color: "Original",
        colorCode: "#1a6b9a",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80",
      },
      {
        color: "Fresh",
        colorCode: "#5dade2",
        image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=500&q=80",
      },
    ],
  },
]

export const formatPrice = (price: number) =>
  `₦${price.toLocaleString("en-NG")}`