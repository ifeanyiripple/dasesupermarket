// src/lib/validators/product-validator.ts
import { z } from "zod"

export const PRODUCT_BADGE = ["new", "sale", "hot", "organic"] as const
export type ProductBadge = typeof PRODUCT_BADGE[number]

export const IMAGE_VALIDATOR = z.object({
  color:     z.string().min(1, "Color is required"),
  colorCode: z.string().min(1, "Color code is required"),
  image:     z.string().min(1, "Image URL is required"),
})

export const PRODUCT_VALIDATOR = z.object({
  name:            z.string().min(1, "Name is required").max(100),
  description:     z.string().min(1, "Description is required").max(5000),
  price:           z.number().positive("Price must be greater than 0"),
  originalPrice:   z.number().positive().optional(),
  brand:           z.string().optional(),
  category:        z.string().min(1, "Category is required"),
  inStock:         z.boolean(),
  badge:           z.enum(PRODUCT_BADGE).optional(),
  isFeatured:      z.boolean(),
   sizeOptions: z.array(z.object({
  name:      z.string().min(1),
  price:     z.number().min(0),
  isDefault: z.boolean(),
})),

  // ── New rich fields ──────────────────────────────────────────────
  netContent:      z.string().optional(),
  containerType:   z.string().optional(),
  keyFeatures:     z.array(z.string()).optional(),
  ingredients:     z.string().optional(),
  storageInfo:     z.string().optional(),
  countryOfOrigin: z.string().optional(),

  images: z.array(IMAGE_VALIDATOR).min(1, "At least one image is required"),
})

export type ProductFormData = z.infer<typeof PRODUCT_VALIDATOR>
export type ImageFormData   = z.infer<typeof IMAGE_VALIDATOR>