import { notFound }  from "next/navigation"
import type { Metadata } from "next"
import Navbar         from "@/components/layout/Navbar"
import { db }         from "@/lib/db"
import FoodDetailClient, { DBFood } from "../_components/FoodDetailClient"
import DaseAboutSection from "@/components/daseaboutsection"

const SITE_NAME = "DASE Supermarket"
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dasesupermarket.com"

function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}

type Props = { params: Promise<{ id: string }> }

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getFood(id: string): Promise<DBFood | null> {
  try {
    const food = await db.food.findUnique({
      where: { id },
      include: {
        meatOptions: {
          orderBy: [{ isDefault: "desc" }, { price: "asc" }],
        },
      },
    })
    return food as DBFood | null
  } catch {
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FoodPage({ params }: Props) {
  const { id } = await params
  const food   = await getFood(id)

  if (!food) notFound()

  const url = absoluteUrl(`/food/${food.id}`)

  const foodJsonLd = {
    "@context":  "https://schema.org",
    "@type":     "MenuItem",
    "@id":       `${url}#food`,
    name:        food.name,
    description: food.description,
    image:       food.image,
    url,
    offers: {
      "@type":        "Offer",
      priceCurrency:  "NGN",
      price:          food.price.toFixed(2),
      availability:   food.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(food.meatOptions.length > 0 && {
      menuAddOn: food.meatOptions.map((opt) => ({
        "@type": "MenuItem",
        name:    opt.name,
        offers: {
          "@type":       "Offer",
          priceCurrency: "NGN",
          price:         opt.price.toFixed(2),
        },
      })),
    }),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: absoluteUrl("/")       },
      { "@type": "ListItem", position: 2, name: "Kitchen", item: absoluteUrl("/food")   },
      { "@type": "ListItem", position: 3, name: food.name, item: url                    },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(foodJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <FoodDetailClient food={food} />
        <DaseAboutSection />
      </main>
    </div>
  )
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const food = await db.food.findUnique({
    where:  { id },
    select: {
      id:          true,
      name:        true,
      description: true,
      image:       true,
      price:       true,
      category:    true,
      badge:       true,
      spicy:       true,
      prepTime:    true,
      rating:      true,
      inStock:     true,
    },
  })

  if (!food) {
    return {
      title:  "Food not found",
      robots: { index: false, follow: false },
    }
  }

  const title       = `${food.name} — DASE Kitchen | ${SITE_NAME}`
  const description = `${food.description} | ${food.prepTime} prep time · ${food.category}${food.spicy ? " · Spicy" : ""} | Order from DASE Kitchen, Nigeria.`
  const canonical   = absoluteUrl(`/food/${food.id}`)
  const ogImage     = food.image ?? absoluteUrl("/og-food.png")

  return {
    title,
    description,
    keywords: [
      food.name,
      food.category,
      "DASE Kitchen",
      "food delivery Nigeria",
      "order food online",
      "restaurant Oyo",
      food.spicy ? "spicy food" : null,
      food.badge ?? null,
    ].filter(Boolean) as string[],
    alternates: { canonical },
    openGraph: {
      type:        "website",
      siteName:    SITE_NAME,
      title,
      description,
      url:         canonical,
      images: [{
        url:    ogImage,
        width:  1200,
        height: 630,
        alt:    food.name,
      }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
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
      "og:price:amount":   food.price.toFixed(2),
      "og:price:currency": "NGN",
      "og:availability":   food.inStock ? "in stock" : "out of stock",
      ...(food.rating > 0 && {
        "og:rating":       food.rating.toFixed(1),
        "og:rating:scale": "5",
      }),
    },
  }
}