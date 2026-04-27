import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import FeaturedProducts from "@/components/sections/FeaturedProducts"
import WhyUsSection from "@/components/sections/WhyUsSection"
import PopularDeals from "@/components/sections/PopularDeals"
import NewsletterSection from "@/components/sections/NewsletterSection"
import CategoriesSection from "@/components/sections/CategoriesSection"
import HomeTabs from "@/components/sections/HomeTabs"
import HeroSectionClient from "@/components/sections/HeroSectionClient"
import { db } from "@/lib/db"

export default async function HomePage() {
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
      // ✅ deliberately omitting createdAt / updatedAt (Date objects)
    },
    orderBy: { createdAt: "desc" },
  })

   // Fetch rooms - ADD THIS
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSectionClient />

        <HomeTabs
          foods={foods}
          rooms={rooms}
          supermarketContent={
            <>
              <FeaturedProducts />
              <CategoriesSection />
              
              <WhyUsSection />
              <PopularDeals />
              <NewsletterSection />
            </>
          }
        />
      </main>

      {/* <Footer /> */}
    </div>
  )
}