// app/product/[id]/page.tsx

import { notFound }    from "next/navigation"
import type { Metadata } from "next"
import Navbar           from "@/components/layout/Navbar"
import { db }           from "@/lib/db"
import ProductDetailClient, { type DBProduct } from "../_components/Productdetailclient"

const SITE_NAME = "DASE Supermarket"
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dasesupermarket.com"

function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}

type Props = { params: Promise<{ id: string }> }

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
  return []
}

function buildTitle(product: { name: string; brand: string | null; category: string }): string {
  const parts = [product.name]
  if (product.brand) parts.push(`by ${product.brand}`)
  parts.push(`— ${SITE_NAME}`)
  return parts.join(" ")
}

function buildDescription(product: {
  name:            string
  description:     string
  brand:           string | null
  category:        string
  netContent:      string | null
  countryOfOrigin: string | null
  keyFeatures:     unknown
}): string {
  const features = parseKeyFeatures(product.keyFeatures).slice(0, 3).join(" · ")
  const meta = [
    product.brand    ? `Brand: ${product.brand}`                   : null,
    product.netContent      ? `Size: ${product.netContent}`        : null,
    product.countryOfOrigin ? `Origin: ${product.countryOfOrigin}` : null,
  ].filter(Boolean).join(", ")

  return [product.description, features, meta].filter(Boolean).join(" | ")
}

function buildKeywords(product: {
  name:            string
  brand:           string | null
  category:        string
  netContent:      string | null
  countryOfOrigin: string | null
  storageInfo:     string | null
  containerType:   string | null
  keyFeatures:     unknown
}): string[] {
  const featureTokens = parseKeyFeatures(product.keyFeatures).flatMap((f) =>
    f.split(",").map((k) => k.trim())
  )

  return Array.from(
    new Set(
      [
        product.name,
        product.brand,
        product.category,
        product.netContent,
        product.containerType,
        product.countryOfOrigin,
        "buy online Nigeria",
        "supermarket Oyo",
        "DASE Supermarket",
        "grocery delivery Nigeria",
        ...featureTokens,
      ]
        .filter(Boolean)
        .map(String)
    )
  )
}

// ─────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────

async function getProduct(id: string): Promise<DBProduct | null> {
  try {
    const product = await db.product.findUnique({
      where:   { id },
      include: {
        images: true,
        sizeOptions: {
          orderBy: [{ isDefault: "desc" }, { price: "asc" }],
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdDate: "desc" },
        },
      },
    })

    if (!product) return null

    const agg = await db.review.aggregate({
      where:  { productId: id },
      _avg:   { rating: true },
      _count: { rating: true },
    })

    return {
      ...product,
      avgRating:   agg._avg.rating   ?? 0,
      reviewCount: agg._count.rating ?? 0,
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function ProductPage({ params }: Props) {
  const { id }  = await params
  const product = await getProduct(id)

  if (!product) notFound()

  // JSON-LD structured data
  const url       = absoluteUrl(`/product/${product.id}`)
  const images    = product.images.map((img: any) => absoluteUrl(img.image)).filter(Boolean)
  const features  = parseKeyFeatures(product.keyFeatures)

  const structuredDescription = [
    product.description,
    features.length > 0 ? `Features: ${features.join(", ")}` : null,
  ].filter(Boolean).join(" | ")

  const productJsonLd: Record<string, unknown> = {
    "@context":   "https://schema.org",
    "@type":      "Product",
    "@id":        `${url}#product`,
    name:         product.name,
    description:  structuredDescription,
    image:        images.length > 0 ? images : [absoluteUrl("/og-product.png")],
    sku:          product.id,
    brand:        product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category:     product.category,
    url,
    offers: {
      "@type":         "Offer",
      url,
      priceCurrency:   "NGN",
      price:           product.price.toFixed(2),
      availability:    product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:   "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name:    SITE_NAME,
        url:     absoluteUrl("/"),
      },
    },
  }

  // additionalProperty — surfaces specs in Google's tech panel
  const specEntries: { label: string; value: string | null }[] = [
    { label: "Net Content",       value: product.netContent      },
    { label: "Container Type",    value: product.containerType   },
    { label: "Country of Origin", value: product.countryOfOrigin },
    { label: "Storage Info",      value: product.storageInfo     },
    { label: "Brand",             value: product.brand           },
  ]
  const validSpecs = specEntries.filter((e) => e.value)
  if (validSpecs.length > 0) {
    productJsonLd.additionalProperty = validSpecs.map(({ label, value }) => ({
      "@type": "PropertyValue",
      name:    label,
      value,
    }))
  }

  // if (product.reviewCount > 0 && product.avgRating > 0) {
  //   productJsonLd.aggregateRating = {
  //     "@type":       "AggregateRating",
  //     ratingValue:   product.avgRating.toFixed(1),
  //     reviewCount:   product.reviewCount,
  //     bestRating:    "5",
  //     worstRating:   "1",
  //   }
  // }

  // if (product.reviews.length > 0) {
  //   productJsonLd.review = product.reviews.slice(0, 5).map((r) => ({
  //     "@type":  "Review",
  //     author:   { "@type": "Person", name: r.user.name ?? "DASE customer" },
  //     datePublished: new Date(r.createdDate).toISOString(),
  //     reviewBody:    r.comment,
  //     reviewRating: {
  //       "@type":       "Rating",
  //       ratingValue:   r.rating,
  //       bestRating:    "5",
  //       worstRating:   "1",
  //     },
  //   }))
  // }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: absoluteUrl("/")         },
      { "@type": "ListItem", position: 2, name: "Shop",     item: absoluteUrl("/shop")     },
      { "@type": "ListItem", position: 3, name: product.category, item: absoluteUrl(`/categories/${product.category.toLowerCase()}`) },
      { "@type": "ListItem", position: 4, name: product.name,     item: url                },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const product = await db.product.findUnique({
    where:  { id },
    select: {
      id:              true,
      name:            true,
      description:     true,
      price:           true,
      originalPrice:   true,
      brand:           true,
      category:        true,
      inStock:         true,
      netContent:      true,
      containerType:   true,
      countryOfOrigin: true,
      storageInfo:     true,
      keyFeatures:     true,
      images: {
        select: { image: true },
        orderBy: { id: "asc" },
        take: 3,
      },
      reviews: { select: { rating: true } },
    },
  })

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    }
  }

  const title       = buildTitle(product)
  const description = buildDescription(product)
  const keywords    = buildKeywords(product)
  const canonical   = absoluteUrl(`/product/${product.id}`)
  const ogImages    = product.images.length > 0
    ? product.images.map((img, i) => ({
        url:    absoluteUrl(img.image),
        width:  1200,
        height: 630,
        alt:    i === 0 ? product.name : `${product.name} image ${i + 1}`,
      }))
    : [{ url: absoluteUrl("/og-product.png"), width: 1200, height: 630, alt: product.name }]

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0

  return {
    title,
    description,
    keywords,
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
        index:                true,
        follow:               true,
        "max-image-preview":  "large",
        "max-snippet":        -1,
        "max-video-preview":  -1,
      },
    },
    other: {
      "product:price:amount":   product.price.toFixed(2),
      "product:price:currency": "NGN",
      "product:availability":   product.inStock ? "in stock" : "out of stock",
      "og:price:amount":        product.price.toFixed(2),
      "og:price:currency":      "NGN",
      ...(avgRating > 0 && {
        "og:rating":            avgRating.toFixed(1),
        "og:rating:scale":      "5",
        "og:review_count":      String(product.reviews.length),
      }),
    },
  }
}