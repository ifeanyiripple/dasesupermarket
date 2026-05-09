"use client"
// components/sections/HeroSection.tsx

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"
import { motion } from "framer-motion"
import { ShoppingBag, ChevronRight } from "lucide-react"

const SLIDES = [
  {
    id: 1,
    image: "/market.jpg",
    cta: "Start Shopping",
    accent: "#7ec89a",
  },
  {
    id: 2,
    image: "/slide1.jpg",
    cta: "Grab Deals",
    accent: "#b5e48c",
  },
  {
    id: 3,
    image: "/hotel.png",
    cta: "Order Now",
    accent: "#52d68a",
  },
  {
    id: 4,
    image: "/slide3.jpg",
    cta: "Shop Fresh",
    accent: "#a8e063",
  },
]

export default function HeroSection() {
  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, ]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="hero-swiper"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[150px] sm:h-[200px] md:h-[220px]  w-full overflow-hidden">
  <Image
    src={slide.image}
    alt={`DASE Supermarket slide ${slide.id}`}
    fill
    priority={slide.id === 1}
    className="object-cover" // Cover is usually better for Hero sections
    sizes="100vw"
  />

              {/* Thin gradient at bottom only — lifts buttons & dots off image */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .hero-swiper .swiper-pagination {
          bottom: 8px;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255,255,255,0.45);
          width: 7px;
          height: 7px;
          transition: all 0.3s;
          opacity: 1;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: white;
          width: 13px;
          border-radius: 4px;
        }
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: rgba(255,255,255,0.85);
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.12);
          border-radius: 50%;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .hero-swiper .swiper-button-next:after,
        .hero-swiper .swiper-button-prev:after {
          font-size: 12px;
          font-weight: bold;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(255,255,255,0.22);
        }
        @media (max-width: 640px) {
          .hero-swiper .swiper-button-next,
          .hero-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}