// app/food/[id]/page.tsx

import { notFound }    from "next/navigation"
import Navbar          from "@/components/layout/Navbar"
import { db }          from "@/lib/db"
import FoodDetailClient, { DBFood } from "../_components/FoodDetailClient"

type Props = { params: Promise<{ id: string }> }

async function getFood(id: string): Promise<DBFood | null> {
  try {
      const food = await db.food.findUnique({
      where: { id },
      include: {
        meatOptions: {
          orderBy: [
            { isDefault: "desc" }, // default first
            { price: "asc" },
          ],
        },
      },
    })
    return food as DBFood | null
  } catch {
    return null
  }
}

export default async function FoodPage({ params }: Props) {
  const { id } = await params
  const food   = await getFood(id)

  if (!food) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <FoodDetailClient food={food} />
      </main>
     
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { id }  = await params
  const food    = await db.food.findUnique({
    where:  { id },
    select: { name: true, description: true, meatOptions: true },
  })
  if (!food) return {}
  return {
    title:       `${food.name} — DASE Kitchen`,
    description: food.description,
  }
}