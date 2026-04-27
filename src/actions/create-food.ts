"use server"

import { db } from "@/lib/db"           // your Prisma client instance
import { FOOD_VALIDATOR, FoodForm } from "@/lib/validators/food-validator"
import { revalidatePath } from "next/cache"

export async function createFoodAction(data: FoodForm) {
  const parsed = FOOD_VALIDATOR.safeParse(data)

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid food data",
    }
  }

  const {
    name, category, description, price, image,
    badge, spicy, rating, prepTime, serves, inStock, isFeatured,
  } = parsed.data

  try {
    const food = await db.food.create({
      data: {
        name,
        category,
        description,
        price,
        image,
        badge:      badge ?? null,
        spicy,
        rating,
        prepTime,
        serves,
        inStock,
        isFeatured,
        
         meatOptions: {
      create: data.meatOptions?.map(({ name, price, isDefault }) => ({
        name, price, isDefault,
      })) ?? [],
    },

      },
    })

    revalidatePath("/admin/foods")
    revalidatePath("/")

    return { success: true, food }
  } catch (err: any) {
    console.error("[CREATE_FOOD_ACTION]", err)
    return { error: "Failed to save food to database" }
  }
}