import { z } from "zod"

export const FOOD_CATEGORIES = [
  "Local Favourites",
  "Grills",
  "Breakfast",
  "Sides",
  "pastery",
  "Soups & Stews",
  "Snacks & Small Chops",
  "Desserts & Drinks",
  "Rice & Pasta",
  "Proteins",
  "Continental",
] as const

export type FoodCategory = (typeof FOOD_CATEGORIES)[number]

export const FOOD_BADGE_OPTIONS = ["Popular", "Chef's Pick", "New", "Spicy Special"] as const
export type FoodBadge = (typeof FOOD_BADGE_OPTIONS)[number]

const MeatOptionSchema = z.object({
  name:      z.string().min(1),
  price:     z.number().min(0),
  isDefault: z.boolean(),
})
// AFTER — all fields explicitly required, no .default()
export const FOOD_VALIDATOR = z.object({
  name:        z.string().min(2, "Name is required"),
  category:    z.string().min(1, "Please select a category"),
  description: z.string().min(5, "Description is required"),
  price:       z.number().min(1, "Price must be greater than 0"),
  image:       z.string().min(1, "Please upload a food image"),
  badge:       z.string().optional(),
  spicy:       z.boolean(),
  rating:      z.number().min(0).max(5),
  prepTime:    z.string().min(1, "Prep time is required"),
  serves:      z.number().int().min(1),
  inStock:     z.boolean(),
  isFeatured:  z.boolean(),
  meatOptions: z.array(MeatOptionSchema),
})



export type FoodForm = z.infer<typeof FOOD_VALIDATOR>