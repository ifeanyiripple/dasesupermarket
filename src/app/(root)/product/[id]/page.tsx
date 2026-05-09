// app/product/[id]/page.tsx

import { notFound }             from "next/navigation"
import Navbar                   from "@/components/layout/Navbar"
import Footer                   from "@/components/layout/Footer"
import { db }                   from "@/lib/db"
import ProductDetailClient, { DBProduct } from "../_components/Productdetailclient"

type Props = { params: Promise<{ id: string }> }

async function getProduct(id: string): Promise<DBProduct | null> {
  try {
    const product = await db.product.findUnique({
      where:   { id },
      include: {
        images: true,
        sizeOptions: {
          orderBy: [
            { isDefault: "desc" }, // default first
            { price: "asc" },
          ],
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

export default async function ProductPage({ params }: Props) {
  const { id }  = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { id }  = await params
  const product = await db.product.findUnique({
    where:  { id },
    select: { name: true, description: true, sizeOptions: true },
  })

  if (!product) return {}

  return {
    title:       `${product.name} — DASE Supermarket`,
    description: product.description,
  }
}
