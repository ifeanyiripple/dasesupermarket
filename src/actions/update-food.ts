"use server"

import { db } from "@/lib/db"
import { FOOD_VALIDATOR, FoodForm } from "@/lib/validators/food-validator"
import { revalidatePath } from "next/cache"

export async function updateFoodAction(id: string, data: FoodForm) {
  const parsed = FOOD_VALIDATOR.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid food data" }
  }

  const {
    name, category, description, price, image,
    badge, spicy, rating, prepTime, serves, inStock, isFeatured, meatOptions,
  } = parsed.data

  try {
    // Update food and replace all meat options in a transaction
    const food = await db.$transaction(async (tx) => {
      // Delete existing meat options for this food
      await tx.meatOption.deleteMany({ where: { foodId: id } })

      // Update the food record and recreate meat options
      return tx.food.update({
        where: { id },
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
            create: meatOptions?.map(({ name, price, isDefault }) => ({
              name, price, isDefault,
            })) ?? [],
          },
        },
        include: { meatOptions: true },
      })
    })

    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, food }
  } catch (err: any) {
    console.error("[UPDATE_FOOD_ACTION]", err)
    return { error: "Failed to update food in database" }
  }
}