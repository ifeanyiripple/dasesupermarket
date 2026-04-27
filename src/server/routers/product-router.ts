// src/server/routers/product.ts
import { db } from "@/lib/db"
import { router } from "../__internals/router"
import { privateProcedure, publicProcedure } from "../procedures"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { PRODUCT_VALIDATOR } from "@/lib/validators/product-validator"

export const productsRouter = router({

  // ── Create product (admin only) ──────────────────────────────────────────
  createProduct: privateProcedure
    .input(PRODUCT_VALIDATOR)
    .mutation(async ({ ctx, input, c }) => {
      try {
        const user = await db.user.findUnique({
          where: { id: ctx.user.id },
          select: { role: true },
        })

        if (!user || user.role !== "ADMIN") {
          throw new HTTPException(403, { message: "Forbidden: Admin access required" })
        }

        const newProduct = await db.product.create({
          data: {
            name:            input.name,
            description:     input.description,
            price:           input.price,
            originalPrice:   input.originalPrice   ?? null,
            brand:           input.brand           ?? "",
            category:        input.category,
            inStock:         input.inStock,
            badge:           input.badge           ?? null,
            isFeatured:      input.isFeatured,
            netContent:      input.netContent      ?? null,
            containerType:   input.containerType   ?? null,
            keyFeatures:     input.keyFeatures     ?? [],
            ingredients:     input.ingredients     ?? null,
            storageInfo:     input.storageInfo     ?? null,
            countryOfOrigin: input.countryOfOrigin ?? null,
            images: {
              create: input.images.map(img => ({
                color:     img.color,
                colorCode: img.colorCode,
                image:     img.image,
              })),
            },
          },
          include: {
            images: true,
            reviews: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        })

        console.log("New product created:", newProduct.id)

        return c.superjson({
          success: true,
          message: "Product created successfully",
          product: newProduct,
        })
      } catch (error) {
        console.error("Error creating product:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while creating the product" })
      }
    }),

  // ── Get featured products (homepage) ────────────────────────────────────
  getFeaturedProducts: publicProcedure
    .query(async ({ c }) => {
      try {
        const products = await db.product.findMany({
          where:   { isFeatured: true, inStock: true },
          orderBy: { createdAt: "desc" },
          take:    12,
          include: { images: true },
        })
        return c.superjson({ success: true, products })
      } catch (error) {
        console.error("Error fetching featured products:", error)
        throw new HTTPException(500, { message: "Failed to fetch featured products" })
      }
    }),

  // ── Get all products with filtering & pagination ─────────────────────────
  getProducts: publicProcedure
    .input(
      z.object({
        page:      z.number().min(1).default(1),
        limit:     z.number().min(1).max(100).default(10),
        category:  z.string().optional(),
        brand:     z.string().optional(),
        minPrice:  z.number().optional(),
        maxPrice:  z.number().optional(),
        inStock:   z.boolean().optional(),
        search:    z.string().optional(),
        badge:     z.string().optional(),
        sortBy:    z.enum(["price", "name", "createdAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, c }) => {
      try {
        const { page, limit, sortBy, sortOrder, category, brand, minPrice, maxPrice, inStock, search, badge } = input
        const skip = (page - 1) * limit

        // Build where clause with correct Prisma types
        const where: {
          category?:  string
          brand?:     string
          badge?:     string
          inStock?:   boolean
          price?:     { gte?: number; lte?: number }
          OR?: Array<{
            name?:        { contains: string; mode: "insensitive" }
            description?: { contains: string; mode: "insensitive" }
            brand?:       { contains: string; mode: "insensitive" }
            category?:    { contains: string; mode: "insensitive" }
          }>
        } = {}

        if (category)              where.category = category
        if (brand)                 where.brand    = brand
        if (badge)                 where.badge    = badge
        if (inStock !== undefined) where.inStock  = inStock

        if (minPrice !== undefined || maxPrice !== undefined) {
          where.price = {}
          if (minPrice !== undefined) where.price.gte = minPrice
          if (maxPrice !== undefined) where.price.lte = maxPrice
        }

        if (search) {
          where.OR = [
            { name:        { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brand:       { contains: search, mode: "insensitive" } },
            { category:    { contains: search, mode: "insensitive" } },
          ]
        }

        const [total, products] = await Promise.all([
          db.product.count({ where }),
          db.product.findMany({
            where,
            include: {
              images: true,
              _count: { select: { reviews: true, orderItems: true } },
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit,
          }),
        ])

        // Attach avg rating via aggregate
        const productsWithRating = await Promise.all(
          products.map(async (product) => {
            const agg = await db.review.aggregate({
              where:   { productId: product.id },
              _avg:    { rating: true },
              _count:  { rating: true },
            })
            return {
              ...product,
              avgRating:   agg._avg.rating   ?? 0,
              reviewCount: agg._count.rating ?? 0,
            }
          })
        )

        return c.superjson({
          success: true,
          products: productsWithRating,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        console.error("Error fetching products:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while fetching products" })
      }
    }),

  // ── Get single product ────────────────────────────────────────────────────
  getProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input, c }) => {
      try {
        const userId = (ctx as any).user?.id as string | null ?? null

        const product = await db.product.findUnique({
          where: { id: input.id },
          include: {
            images: true,
            reviews: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
              orderBy: { createdDate: "desc" },
            },
            _count: { select: { reviews: true, orderItems: true } },
          },
        })

        if (!product) {
          throw new HTTPException(404, { message: "Product not found" })
        }

        const agg = await db.review.aggregate({
          where:  { productId: product.id },
          _avg:   { rating: true },
          _count: { rating: true },
        })

        const userReview = userId
          ? product.reviews.find(r => r.user.id === userId) ?? null
          : null

        return c.superjson({
          success: true,
          product: {
            ...product,
            avgRating:   agg._avg.rating   ?? 0,
            reviewCount: agg._count.rating ?? 0,
            userReview,
          },
        })
      } catch (error) {
        console.error("Error fetching product:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while fetching the product" })
      }
    }),

  // ── Get related products ──────────────────────────────────────────────────
  getRelatedProducts: publicProcedure
    .input(z.object({
      productId: z.string(),
      category:  z.string(),
      limit:     z.number().min(1).max(20).default(6),
    }))
    .query(async ({ input, c }) => {
      try {
        // Same category first
        const sameCategory = await db.product.findMany({
          where:   { category: input.category, id: { not: input.productId } },
          take:    input.limit,
          include: { images: true },
          orderBy: { createdAt: "desc" },
        })

        // Pad with other categories if needed
        let related = sameCategory
        if (related.length < input.limit) {
          const others = await db.product.findMany({
            where: {
              category: { not: input.category },
              id:       { not: input.productId },
            },
            take:    input.limit - related.length,
            include: { images: true },
            orderBy: { createdAt: "desc" },
          })
          related = [...related, ...others]
        }

        // Attach avg ratings efficiently
        const productsWithRating = await Promise.all(
          related.map(async (product) => {
            const agg = await db.review.aggregate({
              where:  { productId: product.id },
              _avg:   { rating: true },
              _count: { rating: true },
            })
            return {
              ...product,
              avgRating:   agg._avg.rating   ?? 0,
              reviewCount: agg._count.rating ?? 0,
            }
          })
        )

        return c.superjson({ success: true, products: productsWithRating })
      } catch (error) {
        console.error("Error fetching related products:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while fetching related products" })
      }
    }),

  // ── Update product (admin only) ───────────────────────────────────────────
  updateProduct: privateProcedure
    .input(z.object({
      id:   z.string(),
      data: PRODUCT_VALIDATOR.partial(),
    }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const user = await db.user.findUnique({
          where:  { id: ctx.user.id },
          select: { role: true },
        })

        if (!user || user.role !== "ADMIN") {
          throw new HTTPException(403, { message: "Forbidden: Admin access required" })
        }

        const existing = await db.product.findUnique({ where: { id: input.id } })
        if (!existing) {
          throw new HTTPException(404, { message: "Product not found" })
        }

        const updatedProduct = await db.product.update({
          where: { id: input.id },
          data: {
            ...(input.data.name          !== undefined && { name:          input.data.name          }),
            ...(input.data.description   !== undefined && { description:   input.data.description   }),
            ...(input.data.price         !== undefined && { price:         input.data.price         }),
            ...(input.data.originalPrice !== undefined && { originalPrice: input.data.originalPrice ?? null }),
            ...(input.data.brand        !== undefined && { brand:          input.data.brand         }),
            ...(input.data.category      !== undefined && { category:      input.data.category      }),
            ...(input.data.inStock       !== undefined && { inStock:       input.data.inStock       }),
            ...(input.data.badge         !== undefined && { badge:         input.data.badge ?? null }),
            ...(input.data.isFeatured    !== undefined && { isFeatured:    input.data.isFeatured    }),
            ...(input.data.netContent    !== undefined && { netContent:    input.data.netContent    }),
            ...(input.data.containerType !== undefined && { containerType: input.data.containerType }),
            ...(input.data.keyFeatures   !== undefined && { keyFeatures:   input.data.keyFeatures   }),
            ...(input.data.ingredients   !== undefined && { ingredients:   input.data.ingredients   }),
            ...(input.data.storageInfo   !== undefined && { storageInfo:   input.data.storageInfo   }),
            ...(input.data.countryOfOrigin !== undefined && { countryOfOrigin: input.data.countryOfOrigin }),
            ...(input.data.images && {
              images: {
                deleteMany: {},
                create: input.data.images.map(img => ({
                  color:     img.color,
                  colorCode: img.colorCode,
                  image:     img.image,
                })),
              },
            }),
          },
          include: { images: true, reviews: true },
        })

        return c.superjson({ success: true, message: "Product updated successfully", product: updatedProduct })
      } catch (error) {
        console.error("Error updating product:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while updating the product" })
      }
    }),

  // ── Delete product (admin only) ───────────────────────────────────────────
  deleteProduct: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const user = await db.user.findUnique({
          where:  { id: ctx.user.id },
          select: { role: true },
        })

        if (!user || user.role !== "ADMIN") {
          throw new HTTPException(403, { message: "Forbidden: Admin access required" })
        }

        const product = await db.product.findUnique({ where: { id: input.id } })
        if (!product) {
          throw new HTTPException(404, { message: "Product not found" })
        }

        await db.product.delete({ where: { id: input.id } })

        return c.superjson({ success: true, message: "Product deleted successfully" })
      } catch (error) {
        console.error("Error deleting product:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while deleting the product" })
      }
    }),

  // ── Add / update review ───────────────────────────────────────────────────
  addReview: privateProcedure
    .input(z.object({
      productId: z.string(),
      rating:    z.number().min(1).max(5),
      comment:   z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const product = await db.product.findUnique({ where: { id: input.productId } })
        if (!product) {
          throw new HTTPException(404, { message: "Product not found" })
        }

        const existing = await db.review.findFirst({
          where: { userId: ctx.user.id, productId: input.productId },
        })

        const reviewData = { rating: input.rating, comment: input.comment }
        const include    = { user: { select: { id: true, name: true, image: true } } }

        if (existing) {
          const updated = await db.review.update({
            where: { id: existing.id },
            data:    reviewData,
            include,
          })
          return c.superjson({ success: true, message: "Review updated successfully", review: updated })
        }

        const created = await db.review.create({
          data:    { ...reviewData, userId: ctx.user.id, productId: input.productId },
          include,
        })
        return c.superjson({ success: true, message: "Review added successfully", review: created })
      } catch (error) {
        console.error("Error adding review:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while adding the review" })
      }
    }),

  // ── Delete review ─────────────────────────────────────────────────────────
  deleteReview: privateProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input, c }) => {
      try {
        const review = await db.review.findFirst({
          where: { id: input.reviewId, userId: ctx.user.id },
        })

        if (!review) {
          const user = await db.user.findUnique({
            where:  { id: ctx.user.id },
            select: { role: true },
          })
          if (!user || user.role !== "ADMIN") {
            throw new HTTPException(403, { message: "Not authorised to delete this review" })
          }
        }

        await db.review.delete({ where: { id: input.reviewId } })
        return c.superjson({ success: true, message: "Review deleted successfully" })
      } catch (error) {
        console.error("Error deleting review:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Something went wrong while deleting the review" })
      }
    }),

  // ── Get unique categories ─────────────────────────────────────────────────
  getCategories: publicProcedure
    .query(async ({ c }) => {
      try {
        const rows = await db.product.findMany({
          select:   { category: true },
          distinct: ["category"],
          orderBy:  { category: "asc" },
        })
        return c.superjson({ success: true, categories: rows.map(r => r.category) })
      } catch (error) {
        console.error("Error fetching categories:", error)
        throw new HTTPException(500, { message: "Failed to fetch categories" })
      }
    }),

  // ── Get unique brands ─────────────────────────────────────────────────────
  getBrands: publicProcedure
    .query(async ({ c }) => {
      try {
        const rows = await db.product.findMany({
          select:   { brand: true },
          where:    { brand: { not: null } },
          distinct: ["brand"],
          orderBy:  { brand: "asc" },
        })
        return c.superjson({
          success: true,
          brands: rows.map(r => r.brand).filter((b): b is string => !!b),
        })
      } catch (error) {
        console.error("Error fetching brands:", error)
        throw new HTTPException(500, { message: "Failed to fetch brands" })
      }
    }),
})