"use client"

import dynamic from "next/dynamic"

const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[150px] sm:min-h-[200px] md:h-[220px] bg-gradient-to-br from-[#0d3d25] to-[#1a5c38] animate-pulse" />
  ),
})

  
export default function HeroSectionClient() {
  return <HeroSection />
}