// app/hotel/[id]/page.tsx

import { notFound }     from "next/navigation"
import type { Metadata } from "next"
import Navbar            from "@/components/layout/Navbar"
import { db }            from "@/lib/db"
import RoomDetailClient from "../_components/RoomDetailclient"
import DaseAboutSection from "@/components/daseaboutsection"
const SITE_NAME = "DASE Supermarket"
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dasesupermarket.com"
const HOTEL_URL = "https://daseluxuryhotel.com"

function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}

type Props = { params: Promise<{ id: string }> }

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getRoom(id: string) {
  try {
    return await db.room.findUnique({ where: { id } })
  } catch {
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HotelRoomPage({ params }: Props) {
  const { id } = await params
  const room   = await getRoom(id)

  if (!room) notFound()

  const images: string[] = Array.isArray(room.images) ? room.images as string[] : []

  const roomForClient = {
    id:          room.id,
    name:        room.name,
    description: room.description,
    price:       room.price,
    roomNumber:  room.roomNumber ?? "",
    capacity:    room.capacity,
    available:   room.available ?? 1,
    status:      room.status as "AVAILABLE" | "OCCUPIED",
    bed:         room.bed ?? "",
    amenities:   Array.isArray(room.amenities) ? room.amenities as string[] : [],
    images,
    featured:    room.featured ?? false,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: absoluteUrl("/")           },
      { "@type": "ListItem", position: 2, name: "Hospitality",   item: absoluteUrl("/hospitality") },
      { "@type": "ListItem", position: 3, name: room.name,       item: absoluteUrl(`/hotel/${room.id}`) },
    ],
  }

  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type":    "LodgingBusiness",
    name:       "Dase Luxury Hotel",
    url:        HOTEL_URL,
    containsPlace: {
      "@type":       "HotelRoom",
      name:          room.name,
      description:   room.description,
      url:           absoluteUrl(`/hotel/${room.id}`),
      image:         images,
      numberOfBeds:  1,
      bed:           room.bed ?? undefined,
      occupancy: {
        "@type":         "QuantitativeValue",
        maxValue:        room.capacity,
      },
      amenityFeature: (Array.isArray(room.amenities) ? room.amenities as string[] : []).map((a) => ({
        "@type":    "LocationFeatureSpecification",
        name:       a,
        value:      true,
      })),
      offers: {
        "@type":         "Offer",
        priceCurrency:   "NGN",
        price:           room.price.toFixed(2),
        availability:    room.status === "AVAILABLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <RoomDetailClient room={roomForClient} />
        <DaseAboutSection />
      </main>
    </div>
  )
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const room   = await getRoom(id)

  if (!room) {
    return {
      title:  "Room not found",
      robots: { index: false, follow: false },
    }
  }

  const images: string[] = Array.isArray(room.images) ? room.images as string[] : []
  const amenities: string[] = Array.isArray(room.amenities) ? room.amenities as string[] : []

  const title       = `${room.name} — Dase Luxury Hotel | ${SITE_NAME}`
  const description = `${room.description} | ${room.bed ?? ""} bed · Capacity: ${room.capacity} · Amenities: ${amenities.slice(0, 4).join(", ")} | Book at Dase Luxury Hotel, Nigeria.`
  const canonical   = absoluteUrl(`/hotel/${room.id}`)
  const ogImages    = images.length > 0
    ? images.slice(0, 3).map((img, i) => ({
        url:    img,
        width:  1200,
        height: 630,
        alt:    i === 0 ? room.name : `${room.name} image ${i + 1}`,
      }))
    : [{ url: absoluteUrl("/og-hotel.png"), width: 1200, height: 630, alt: room.name }]

  return {
    title,
    description,
    keywords: [
      room.name,
      "Dase Luxury Hotel",
      "hotel Nigeria",
      "book hotel Nigeria",
      room.bed ?? "",
      "luxury accommodation",
      "hotel booking",
      ...amenities,
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type:        "website",
      siteName:    SITE_NAME,
      title,
      description,
      url:         canonical,
      images:      ogImages,
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImages[0].url],
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
    other: {
      "og:price:amount":   room.price.toFixed(2),
      "og:price:currency": "NGN",
    },
  }
}