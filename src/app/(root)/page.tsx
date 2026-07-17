// app/page.tsx

import Navbar             from "@/components/layout/Navbar"
import Footer             from "@/components/layout/Footer"
import FeaturedProducts   from "@/components/sections/FeaturedProducts"
import WhyUsSection       from "@/components/sections/WhyUsSection"
import PopularDeals       from "@/components/sections/PopularDeals"
import HomeTabs           from "@/components/sections/HomeTabs"
import HeroSectionClient  from "@/components/sections/HeroSectionClient"
import { db }             from "@/lib/db"
import DaseAboutSection from "@/components/daseaboutsection"
             

export default async function HomePage() {
  // ── Foods ─────────────────────────────────────────────────────────────────
  const foods = await db.food.findMany({
    select: {
      id:          true,
      name:        true,
      description: true,
      price:       true,
      category:    true,
      inStock:     true,
      badge:       true,
      image:       true,
      spicy:       true,
      rating:      true,
      prepTime:    true,
      serves:      true,
      isFeatured:  true,
      meatOptions: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const rooms = await db.room.findMany({
    select: {
      id:          true,
      name:        true,
      description: true,
      price:       true,
      roomNumber:  true,
      capacity:    true,
      status:      true,
      bed:         true,
      amenities:   true,
      images:      true,
      featured:    true,
    },
    orderBy: { createdAt: "desc" },
  })

  // ── Products (for the supermarket grid + category filter) ─────────────────
  const products = await db.product.findMany({
    select: {
      id:            true,
      name:          true,
      description:   true,
      price:         true,
      originalPrice: true,
      category:      true,
      brand:         true,
      inStock:       true,
      badge:         true,
      isFeatured:    true,
      images: {
        select: { id: true, color: true, colorCode: true, image: true },
        take: 3,   // only need a few images for the card thumbnail
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSectionClient />

        <HomeTabs
          foods={foods}
          rooms={rooms}
          products={products}
          supermarketContent={
            <>
              {/* <FeaturedProducts /> */}
              <WhyUsSection />
              <PopularDeals />
             
            </>
          }
        />
      </main>

      
    </div>
  )
}

