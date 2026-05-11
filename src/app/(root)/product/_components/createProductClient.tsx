"use client"
// components/forms/AddProductForm.tsx

import BadgeSelector from "@/components/ui/BadgeSelector"
import { OptionSelector } from "@/components/ui/OptionSelector"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useCallback, useRef, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { client } from "@/lib/client"
import { PRODUCT_VALIDATOR } from "@/lib/validators/product-validator"
import { FOOD_VALIDATOR, FOOD_CATEGORIES, FOOD_BADGE_OPTIONS, type FoodForm } from "@/lib/validators/food-validator"
import { ROOM_VALIDATOR, ROOM_BED_OPTIONS, STANDARD_ROOM_AMENITIES, type RoomForm } from "@/lib/validators/room-validator"
import { createFoodAction } from "@/actions/create-food"
import { createRoomAction } from "@/actions/create-room"
import handleImageSaveToFireBase from "@/lib/upload"
import { categories } from "@/utils/Categories"
import { colors }     from "@/utils/Colors"
import {
  X, Upload, Package, CheckCircle,
  AlertCircle, Loader2, Plus, UtensilsCrossed, ShoppingBasket, Flame,
  ChefHat, Hotel, BedDouble, Users,
} from "lucide-react"
import { FormError }   from "@/components/forms/form-error"
import { FormSuccess } from "@/components/forms/form-success"
import { Card }        from "@/components/ui/card"
import { Button }      from "@/components/ui/button"
import { Input }       from "@/components/ui/input"
import { Textarea }    from "@/components/ui/textarea"
import { Label }       from "@/components/ui/label"
import { Badge }       from "@/components/ui/badge"
import { toast }       from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────
type FormMode = "product" | "food" | "room"
type ProductForm = z.infer<typeof PRODUCT_VALIDATOR>

type UploadingImage = {
  id:          string
  color:       string
  colorCode:   string
  file:        File
  previewUrl:  string
  firebaseUrl: string | null
  progress:    number
  error?:      string
}

type RoomImageDraft = {
  id:          string
  previewUrl:  string
  firebaseUrl: string | null
  progress:    number
  error?:      string
}

// ─────────────────────────────────────────────────────────────────────────────
export const AddProductForm = () => {
  const queryClient  = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Mode selector ──────────────────────────────────────────────────────────
  const [formMode, setFormMode] = useState<FormMode>("product")

  // ── Shared state ───────────────────────────────────────────────────────────
  const [uploadingImages,   setUploadingImages]   = useState<UploadingImage[]>([])
  const [pendingColor,      setPendingColor]       = useState<{ color: string; colorCode: string } | null>(null)
  const [isAnyUploading,    setIsAnyUploading]     = useState(false)
  const [featureInput,      setFeatureInput]       = useState("")
  const [success,           setSuccess]            = useState<string | undefined>()
  const [error,             setError]              = useState<string | undefined>()

  // ── Food single-image state ────────────────────────────────────────────────
  const [foodImagePreview,   setFoodImagePreview]   = useState<string | null>(null)
  const [foodImageUrl,       setFoodImageUrl]       = useState<string | null>(null)
  const [foodImageProgress,  setFoodImageProgress]  = useState(0)
  const [foodImageUploading, setFoodImageUploading] = useState(false)
  const foodFileInputRef = useRef<HTMLInputElement>(null)

  // ── Room multi-image state ─────────────────────────────────────────────────
  const [roomImageDrafts, setRoomImageDrafts] = useState<RoomImageDraft[]>([])
  const roomFileInputRef = useRef<HTMLInputElement>(null)

  const [isPendingFood, startFoodTransition] = useTransition()
  const [isPendingRoom, startRoomTransition] = useTransition()

  // ── Product mutation ───────────────────────────────────────────────────────
  const { mutate: createProduct, isPending: isProductPending } = useMutation({
    mutationFn: async (data: ProductForm) => client.products.createProduct.$post(data),
    onSuccess: () => {
      productForm.reset()
      uploadingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      setUploadingImages([])
      setPendingColor(null)
      setFeatureInput("")
      setSuccess("Product created successfully!")
      setError(undefined)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully ✅")
      setTimeout(() => setSuccess(undefined), 3000)
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to create product"
      setError(msg)
      toast.error(msg)
    },
  })

  // ── Product form ───────────────────────────────────────────────────────────
  const productForm = useForm<ProductForm>({
    resolver: zodResolver(PRODUCT_VALIDATOR),
    defaultValues: {
      name: "", description: "", badge: undefined, isFeatured: false,
      originalPrice: undefined, price: 0, brand: "", category: "",
      inStock: false, netContent: "", containerType: "", keyFeatures: [],
      ingredients: "", storageInfo: "", countryOfOrigin: "", images: [],
      sizeOptions: [],
    },
  })

  const {
    register: regProduct,
    handleSubmit: handleProductSubmit,
    setValue: setProductValue,
    watch: watchProduct,
    formState: { errors: productErrors },
  } = productForm

  const category    = watchProduct("category")
  const inStock     = watchProduct("inStock")
  const isFeatured  = watchProduct("isFeatured")
  const badge       = watchProduct("badge")
  const keyFeatures = watchProduct("keyFeatures") ?? []
  const sizeOptions = watchProduct("sizeOptions") ?? []

  // ── Food form ──────────────────────────────────────────────────────────────
  const {
    register: regFood,
    handleSubmit: handleFoodSubmit,
    setValue: setFoodValue,
    watch: watchFood,
    reset: resetFood,
    formState: { errors: foodErrors },
  } = useForm<FoodForm>({
    resolver: zodResolver(FOOD_VALIDATOR),
    defaultValues: {
      name: "", category: "", description: "", price: 0,
      image: "", badge: undefined, spicy: false, rating: 0,
      prepTime: "", serves: 1, inStock: true, isFeatured: false,
      meatOptions: [],
    },
  })

  const foodCategory    = watchFood("category")
  const foodInStock     = watchFood("inStock")
  const foodIsFeatured  = watchFood("isFeatured")
  const foodSpicy       = watchFood("spicy")
  const foodBadge       = watchFood("badge")
  const foodMeatOptions = watchFood("meatOptions") ?? []

  // ── Room form ──────────────────────────────────────────────────────────────
  const {
    register: regRoom,
    handleSubmit: handleRoomSubmit,
    setValue: setRoomValue,
    watch: watchRoom,
    reset: resetRoom,
    formState: { errors: roomErrors },
  } = useForm<RoomForm>({
    resolver: zodResolver(ROOM_VALIDATOR),
    defaultValues: {
      name: "", description: "", price: 0,
      roomNumber: "", capacity: 2, bed: "",
      images: [], featured: false, status: "AVAILABLE",
    },
  })

  const roomFeatured = watchRoom("featured")
  const roomStatus   = watchRoom("status")

  // ── Mode switch ────────────────────────────────────────────────────────────
  const switchMode = (mode: FormMode) => {
    setFormMode(mode)
    setSuccess(undefined)
    setError(undefined)
  }

  // ── Key features helpers ───────────────────────────────────────────────────
  const addFeature = () => {
    const trimmed = featureInput.trim()
    if (!trimmed) return
    setProductValue("keyFeatures", [...keyFeatures, trimmed], { shouldValidate: true })
    setFeatureInput("")
  }
  const removeFeature = (idx: number) =>
    setProductValue("keyFeatures", keyFeatures.filter((_, i) => i !== idx), { shouldValidate: true })

  // ── Size option helpers (product) ──────────────────────────────────────────
  const addSizeOption = (name: string, price: number) => {
    const updated = [...sizeOptions, { name, price, isDefault: sizeOptions.length === 0 }]
    setProductValue("sizeOptions", updated, { shouldValidate: true })
  }
  const removeSizeOption = (i: number) => {
    const filtered = sizeOptions.filter((_, idx) => idx !== i)
    if (filtered.length > 0 && !filtered.some(s => s.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true }
    }
    setProductValue("sizeOptions", filtered, { shouldValidate: true })
  }
  const setDefaultSize = (i: number) =>
    setProductValue(
      "sizeOptions",
      sizeOptions.map((s, idx) => ({ ...s, isDefault: idx === i })),
      { shouldValidate: true }
    )

  // ── Food meat option helpers ───────────────────────────────────────────────
  const addMeatOption = (name: string, price: number) => {
    const updated = [...foodMeatOptions, { name, price, isDefault: foodMeatOptions.length === 0 }]
    setFoodValue("meatOptions", updated, { shouldValidate: true })
  }
  const removeMeatOption = (i: number) => {
    const filtered = foodMeatOptions.filter((_, idx) => idx !== i)
    if (filtered.length > 0 && !filtered.some(m => m.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true }
    }
    setFoodValue("meatOptions", filtered, { shouldValidate: true })
  }
  const setDefaultMeat = (i: number) =>
    setFoodValue(
      "meatOptions",
      foodMeatOptions.map((m, idx) => ({ ...m, isDefault: idx === i })),
      { shouldValidate: true }
    )

  // ── Product image helpers ──────────────────────────────────────────────────
  const syncImagesToForm = useCallback(
    (imgs: UploadingImage[]) => {
      const ready = imgs.filter((img) => img.firebaseUrl).map((img) => ({
        color: img.color, colorCode: img.colorCode, image: img.firebaseUrl!,
      }))
      setProductValue("images", ready, { shouldValidate: true })
    },
    [setProductValue]
  )

  const uploadImageForColor = useCallback(
    async (file: File, color: string, colorCode: string) => {
      const id = Math.random().toString(36).slice(2)
      const previewUrl = URL.createObjectURL(file)
      setUploadingImages((prev) => {
        const old = prev.find((img) => img.color === color)
        if (old) URL.revokeObjectURL(old.previewUrl)
        return [
          ...prev.filter((img) => img.color !== color),
          { id, color, colorCode, file, previewUrl, firebaseUrl: null, progress: 0 },
        ]
      })
      setIsAnyUploading(true)
      try {
        const url = await handleImageSaveToFireBase(file, (progress) => {
          setUploadingImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, progress } : img))
          )
        })
        setUploadingImages((prev) => {
          const next = prev.map((img) =>
            img.id === id ? { ...img, firebaseUrl: url, progress: 100 } : img
          )
          syncImagesToForm(next)
          return next
        })
      } catch {
        setUploadingImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, error: "Upload failed" } : img))
        )
        toast.error(`Failed to upload image for ${color}`)
      } finally {
        setIsAnyUploading(false)
      }
    },
    [syncImagesToForm]
  )

  const handleProductFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!pendingColor) return
      const file = e.target.files?.[0]
      if (file) uploadImageForColor(file, pendingColor.color, pendingColor.colorCode)
      e.target.value = ""
    },
    [pendingColor, uploadImageForColor]
  )

  const removeImage = useCallback(
    (color: string) => {
      setUploadingImages((prev) => {
        const item = prev.find((img) => img.color === color)
        if (item) URL.revokeObjectURL(item.previewUrl)
        const next = prev.filter((img) => img.color !== color)
        syncImagesToForm(next)
        return next
      })
    },
    [syncImagesToForm]
  )

  // ── Food single-image helpers ──────────────────────────────────────────────
  const handleFoodFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (foodImagePreview) URL.revokeObjectURL(foodImagePreview)
    const preview = URL.createObjectURL(file)
    setFoodImagePreview(preview)
    setFoodImageUrl(null)
    setFoodImageUploading(true)
    setFoodImageProgress(0)
    try {
      const url = await handleImageSaveToFireBase(file, (p) => setFoodImageProgress(p))
      setFoodImageUrl(url)
      setFoodValue("image", url, { shouldValidate: true })
      toast.success("Image uploaded ✅")
    } catch {
      toast.error("Image upload failed")
      setFoodImagePreview(null)
    } finally {
      setFoodImageUploading(false)
    }
  }

  const removeFoodImage = () => {
    if (foodImagePreview) URL.revokeObjectURL(foodImagePreview)
    setFoodImagePreview(null)
    setFoodImageUrl(null)
    setFoodValue("image", "", { shouldValidate: true })
  }

  // ── Room multi-image helpers ───────────────────────────────────────────────
  const syncRoomImagesToForm = useCallback(
    (drafts: RoomImageDraft[]) => {
      const urls = drafts.filter((d) => d.firebaseUrl).map((d) => d.firebaseUrl!)
      setRoomValue("images", urls, { shouldValidate: true })
    },
    [setRoomValue]
  )

  const handleRoomFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    for (const file of files) {
      const id         = Math.random().toString(36).slice(2)
      const previewUrl = URL.createObjectURL(file)
      setRoomImageDrafts((prev) => [...prev, { id, previewUrl, firebaseUrl: null, progress: 0 }])
      try {
        const url = await handleImageSaveToFireBase(file, (progress) => {
          setRoomImageDrafts((prev) =>
            prev.map((d) => (d.id === id ? { ...d, progress } : d))
          )
        })
        setRoomImageDrafts((prev) => {
          const next = prev.map((d) =>
            d.id === id ? { ...d, firebaseUrl: url, progress: 100 } : d
          )
          syncRoomImagesToForm(next)
          return next
        })
      } catch {
        setRoomImageDrafts((prev) =>
          prev.map((d) => (d.id === id ? { ...d, error: "Upload failed" } : d))
        )
        toast.error("Failed to upload image")
      }
    }
  }

  const removeRoomImage = (id: string) => {
    setRoomImageDrafts((prev) => {
      const item = prev.find((d) => d.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      const next = prev.filter((d) => d.id !== id)
      syncRoomImagesToForm(next)
      return next
    })
  }

  const isAnyRoomImageUploading = roomImageDrafts.some((d) => !d.firebaseUrl && !d.error)

  // ── Product submit ─────────────────────────────────────────────────────────
  const onProductSubmit = (data: ProductForm) => {
    setError(undefined)
    if (isAnyUploading) { setError("Please wait for all images to finish uploading"); return }
    if (!data.images || data.images.length === 0) { setError("Please upload at least one product image"); return }
    createProduct(data)
  }

  // ── Food submit ────────────────────────────────────────────────────────────
  const onFoodSubmit = (data: FoodForm) => {
    setError(undefined)
    if (foodImageUploading) { setError("Please wait for the image to finish uploading"); return }
    if (!data.image) { setError("Please upload a food image"); return }
    startFoodTransition(async () => {
      const result = await createFoodAction(data)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        resetFood()
        removeFoodImage()
        setSuccess("Food item created successfully!")
        setError(undefined)
        toast.success("Food item created successfully 🍽️")
        setTimeout(() => setSuccess(undefined), 3000)
      }
    })
  }

  // ── Room submit ────────────────────────────────────────────────────────────
  const onRoomSubmit = (data: RoomForm) => {
    setError(undefined)
    if (isAnyRoomImageUploading) { setError("Please wait for all images to finish uploading"); return }
    if (!data.images || data.images.length === 0) { setError("Please upload at least one room image"); return }
    startRoomTransition(async () => {
      const result = await createRoomAction(data)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        resetRoom()
        roomImageDrafts.forEach((d) => URL.revokeObjectURL(d.previewUrl))
        setRoomImageDrafts([])
        setSuccess("Room created successfully!")
        setError(undefined)
        toast.success("Room created successfully 🏨")
        setTimeout(() => setSuccess(undefined), 3000)
      }
    })
  }

  const isPending =
    formMode === "product" ? isProductPending :
    formMode === "food"    ? isPendingFood    :
                             isPendingRoom

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      {/* Hidden file inputs */}
      <input ref={fileInputRef}     type="file" accept="image/*"          className="hidden" onChange={handleProductFileChange} />
      <input ref={foodFileInputRef} type="file" accept="image/*"          className="hidden" onChange={handleFoodFileChange} />
      <input ref={roomFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleRoomFileChange} />

      {/* ── Mode Selector ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          What are you adding?
        </p>
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted/40 border border-border">
          {[
            { mode: "product" as FormMode, icon: <ShoppingBasket size={15} />, label: "Product" },
            { mode: "food"    as FormMode, icon: <UtensilsCrossed size={15} />, label: "Food / Meal" },
            { mode: "room"    as FormMode, icon: <Hotel size={15} />,           label: "Room" },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                formMode === mode
                  ? "bg-background shadow text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  PRODUCT FORM                                                   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {formMode === "product" && (
        <>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
              <Package className="w-5 h-5" />
            </span>
            Add a Product
          </h2>

          <form onSubmit={handleProductSubmit(onProductSubmit)} className="flex flex-col gap-5">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...regProduct("name")} placeholder="e.g. Bama Real Mayonnaise" disabled={isPending}
                className={productErrors.name ? "border-red-400 focus-visible:ring-red-300" : ""} />
              {productErrors.name && <p className="text-xs text-red-500">{productErrors.name.message}</p>}
            </div>

            {/* Price + Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">
                  Price (₦)
                  {sizeOptions.length > 0 && (
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">(fallback)</span>
                  )}
                </Label>
                <Input id="price" type="number" step="0.01" min="0"
                  {...regProduct("price", { valueAsNumber: true })} placeholder="0.00" disabled={isPending}
                  className={productErrors.price ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {productErrors.price && <p className="text-xs text-red-500">{productErrors.price.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brand">Brand <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="brand" {...regProduct("brand")} placeholder="e.g. Bama" disabled={isPending} />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...regProduct("description")} placeholder="Describe the product..." rows={3}
                disabled={isPending}
                className={productErrors.description ? "border-red-400 focus-visible:ring-red-300 resize-none" : "resize-none"} />
              {productErrors.description && <p className="text-xs text-red-500">{productErrors.description.message}</p>}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <button type="button" role="switch" aria-checked={inStock}
                  onClick={() => setProductValue("inStock", !inStock, { shouldValidate: true })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${inStock ? "bg-primary" : "bg-muted"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${inStock ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <Label className="cursor-pointer select-none text-sm">{inStock ? "In Stock" : "Out of Stock"}</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <button type="button" role="switch" aria-checked={isFeatured}
                  onClick={() => setProductValue("isFeatured", !isFeatured, { shouldValidate: true })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${isFeatured ? "bg-primary" : "bg-muted"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isFeatured ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <Label className="cursor-pointer select-none text-sm">{isFeatured ? "Featured ✓" : "Feature on homepage"}</Label>
              </div>
            </div>

            {/* Badge */}
            <BadgeSelector value={badge} onChange={(b) => setProductValue("badge", b, { shouldValidate: true })} disabled={isPending} />

            {/* Original Price */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="originalPrice">Original Price (₦) <span className="text-xs text-muted-foreground font-normal">— shows crossed-out price</span></Label>
              <Input id="originalPrice" type="number" step="0.01" min="0"
                // {...regProduct("originalPrice", { valueAsNumber: true })}
                 {...regProduct("originalPrice", {
      setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    })}
                placeholder="e.g. 1500" disabled={isPending}
                className={productErrors.originalPrice ? "border-red-400 focus-visible:ring-red-300" : ""} />
              {productErrors.originalPrice && <p className="text-xs text-red-500">{productErrors.originalPrice.message}</p>}
            </div>

            {/* Product Details */}
            <div className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-muted/10">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="text-base">📋</span> Product Details
                <span className="text-xs font-normal text-muted-foreground">(optional but recommended)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="netContent">Net Content</Label>
                  <Input id="netContent" {...regProduct("netContent")} placeholder="e.g. 385mL, 1kg" disabled={isPending} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="containerType">Container Type</Label>
                  <Input id="containerType" {...regProduct("containerType")} placeholder="e.g. Plastic Jar, Carton" disabled={isPending} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                  <Input id="countryOfOrigin" {...regProduct("countryOfOrigin")} placeholder="e.g. Nigeria" disabled={isPending} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="storageInfo">Storage Info</Label>
                  <Input id="storageInfo" {...regProduct("storageInfo")} placeholder="e.g. Keep refrigerated" disabled={isPending} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature() } }}
                    placeholder="e.g. Rich in Vitamin C — press Enter or Add" disabled={isPending} />
                  <Button type="button" variant="outline" onClick={addFeature}
                    disabled={isPending || !featureInput.trim()} className="flex-shrink-0">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                {keyFeatures.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {keyFeatures.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
                        <span className="text-primary text-xs font-bold flex-shrink-0">✓</span>
                        <span className="text-sm text-foreground flex-1">{f}</span>
                        <button type="button" onClick={() => removeFeature(idx)}
                          className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ingredients">Ingredients <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea id="ingredients" {...regProduct("ingredients")} placeholder="e.g. Soybean Oil, Egg Yolk, Water..." rows={2} disabled={isPending} className="resize-none" />
              </div>
            </div>

            {/* ── Size / Weight Options ─────────────────────────────────────── */}
            <OptionSelector
              title="Size / Weight Options"
              description="Add different sizes or weights with individual prices. The first option becomes the default. The base price above acts as a fallback if no sizes are added."
              icon={<span className="text-base">📦</span>}
              options={sizeOptions}
              onAdd={addSizeOption}
              onRemove={removeSizeOption}
              onSetDefault={setDefaultSize}
              onClear={() => setProductValue("sizeOptions", [], { shouldValidate: true })}
              disabled={isPending}
              namePlaceholder="e.g. 500g, 1kg, 2kg"
              accent="green"
            />

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              {productErrors.category && <p className="text-xs text-red-500">{productErrors.category.message}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {categories.filter((item) => item.label !== "All").map((item) => (
                  <button key={item.label} type="button"
                    onClick={() => setProductValue("category", item.label, { shouldValidate: true })}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      category === item.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                    style={{ backgroundColor: category === item.label ? undefined : item.color }}>
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Colors & Images */}
            <div className="flex flex-col gap-1.5">
              <Label>Product Colors & Images</Label>
              {productErrors.images && <p className="text-xs text-red-500">{productErrors.images.message as string}</p>}
              <p className="text-xs text-muted-foreground mb-2">Click a color to select it, then upload its image. Each color needs its own image.</p>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((item) => {
                  const uploaded   = uploadingImages.find((img) => img.color === item.color)
                  const isSelected = pendingColor?.color === item.color
                  return (
                    <button key={item.color} type="button" disabled={isPending}
                      onClick={() => setPendingColor({ color: item.color, colorCode: item.colorCode })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected         ? "border-primary bg-primary/10"
                        : uploaded?.firebaseUrl ? "border-green-400 bg-green-50"
                        : uploaded?.error  ? "border-red-300 bg-red-50"
                        : "border-border bg-muted/30 hover:border-primary/40"
                      }`}>
                      <div className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: item.colorCode }} />
                      <span className="text-xs font-medium text-foreground flex-1 truncate">{item.color}</span>
                      {uploaded?.firebaseUrl && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                      {uploaded && !uploaded.firebaseUrl && !uploaded.error && <Loader2 size={14} className="text-primary animate-spin flex-shrink-0" />}
                      {uploaded?.error && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {pendingColor && (
                <div className="mt-3 p-4 rounded-xl border border-dashed border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: pendingColor.colorCode }} />
                    <p className="text-sm font-semibold text-foreground">{pendingColor.color}</p>
                    <Badge variant="outline" className="ml-auto text-xs">Selected</Badge>
                  </div>
                  {(() => {
                    const entry = uploadingImages.find((img) => img.color === pendingColor.color)
                    if (entry?.firebaseUrl) return (
                      <div className="flex items-center gap-4">
                        <img src={entry.previewUrl} alt={entry.color} className="w-16 h-16 object-cover rounded-lg border border-border" />
                        <div className="flex flex-col gap-1.5">
                          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Replace image</Button>
                          <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeImage(pendingColor.color)}><X size={12} className="mr-1" /> Remove</Button>
                        </div>
                      </div>
                    )
                    if (entry && !entry.firebaseUrl) return (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{entry.error ? "Upload failed" : "Uploading..."}</span>
                          {!entry.error && <span>{Math.round(entry.progress)}%</span>}
                        </div>
                        {!entry.error && (
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${entry.progress}%` }} />
                          </div>
                        )}
                        {entry.error && (
                          <Button type="button" variant="outline" size="sm" className="text-red-500 mt-1 w-fit"
                            onClick={() => fileInputRef.current?.click()}>Retry upload</Button>
                        )}
                      </div>
                    )
                    return (
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                        <Upload size={14} /> Upload Image
                      </Button>
                    )
                  })()}
                </div>
              )}
            </div>

            {success && <FormSuccess message={success} />}
            {error   && <FormError  message={error}   />}

            <Button type="submit" disabled={isPending || isAnyUploading} className="w-full">
              {isPending
                ? <><Loader2 size={16} className="animate-spin mr-2" /> Creating product...</>
                : <><Package size={16} className="mr-2" /> Add Product</>}
            </Button>
          </form>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  FOOD FORM                                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {formMode === "food" && (
        <>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-500">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            Add a Food Item
          </h2>

          <form onSubmit={handleFoodSubmit(onFoodSubmit)} className="flex flex-col gap-5">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="food-name">Food Name</Label>
              <Input id="food-name" {...regFood("name")} placeholder="e.g. Jollof Rice" disabled={isPending}
                className={foodErrors.name ? "border-red-400 focus-visible:ring-red-300" : ""} />
              {foodErrors.name && <p className="text-xs text-red-500">{foodErrors.name.message}</p>}
            </div>

            {/* Price + Prep Time + Serves */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="food-price">
                  Base Price (₦)
                  {foodMeatOptions.length > 0 && (
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">(fallback)</span>
                  )}
                </Label>
                <Input id="food-price" type="number" min="0"
                  {...regFood("price", { valueAsNumber: true })} placeholder="3000" disabled={isPending}
                  className={foodErrors.price ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {foodErrors.price && <p className="text-xs text-red-500">{foodErrors.price.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="food-prepTime">Prep Time</Label>
                <Input id="food-prepTime" {...regFood("prepTime")} placeholder="25 min" disabled={isPending}
                  className={foodErrors.prepTime ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {foodErrors.prepTime && <p className="text-xs text-red-500">{foodErrors.prepTime.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="food-serves">Serves</Label>
                <Input id="food-serves" type="number" min="1"
                  {...regFood("serves", { valueAsNumber: true })} placeholder="1" disabled={isPending} />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="food-description">Description</Label>
              <Textarea id="food-description" {...regFood("description")}
                placeholder="e.g. Classic Nigerian party jollof, slow-cooked over firewood..." rows={3}
                disabled={isPending}
                className={foodErrors.description ? "border-red-400 focus-visible:ring-red-300 resize-none" : "resize-none"} />
              {foodErrors.description && <p className="text-xs text-red-500">{foodErrors.description.message}</p>}
            </div>

            {/* ── Protein / Meat Options via OptionSelector ─────────────────── */}
            <OptionSelector
              title="Protein / Meat Options"
              description="Add different protein choices with individual prices. The first option you add becomes the default."
              icon={<ChefHat size={15} className="text-orange-500" />}
              options={foodMeatOptions}
              onAdd={addMeatOption}
              onRemove={removeMeatOption}
              onSetDefault={setDefaultMeat}
              onClear={() => setFoodValue("meatOptions", [], { shouldValidate: true })}
              disabled={isPending}
              namePlaceholder="Protein name (e.g. Beef)"
              accent="amber"
            />

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: foodInStock    ? "In Stock"   : "Out of Stock",      checked: foodInStock,    onToggle: () => setFoodValue("inStock",    !foodInStock,    { shouldValidate: true }), color: "bg-primary"    },
                { label: foodIsFeatured ? "Featured ✓" : "Feature it",        checked: foodIsFeatured, onToggle: () => setFoodValue("isFeatured", !foodIsFeatured, { shouldValidate: true }), color: "bg-primary"    },
                { label: foodSpicy      ? "Spicy"      : "Spicy?",            checked: foodSpicy,      onToggle: () => setFoodValue("spicy",      !foodSpicy,      { shouldValidate: true }), color: "bg-orange-500" },
              ].map(({ label, checked, onToggle, color }) => (
                <div key={label} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/20">
                  <button type="button" role="switch" aria-checked={checked} onClick={onToggle}
                    className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${checked ? color : "bg-muted"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                  <Label className="text-xs cursor-pointer select-none flex items-center gap-1">
                    {foodSpicy && label === "Spicy" ? <><Flame size={12} className="text-orange-500" /> {label}</> : label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div className="flex flex-col gap-1.5">
              <Label>Badge <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
              <div className="flex flex-wrap gap-2">
                {FOOD_BADGE_OPTIONS.map((b) => (
                  <button key={b} type="button"
                    onClick={() => setFoodValue("badge", foodBadge === b ? undefined : b, { shouldValidate: true })}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      foodBadge === b
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              {foodErrors.category && <p className="text-xs text-red-500">{foodErrors.category.message}</p>}
              <div className="grid grid-cols-2 gap-2">
                {FOOD_CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => setFoodValue("category", cat, { shouldValidate: true })}
                    disabled={isPending}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      foodCategory === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Image */}
            <div className="flex flex-col gap-1.5">
              <Label>Food Image</Label>
              {foodErrors.image && <p className="text-xs text-red-500">{foodErrors.image.message}</p>}
              {!foodImagePreview ? (
                <button type="button" onClick={() => foodFileInputRef.current?.click()} disabled={isPending}
                  className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30 transition-all">
                  <Upload size={22} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload food image</span>
                  <span className="text-xs text-muted-foreground/60">JPG, PNG, WEBP</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={foodImagePreview} alt="food preview" className="w-full h-48 object-cover" />
                  {foodImageUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="text-white animate-spin" />
                      <div className="w-3/4 h-1.5 rounded-full bg-white/30 overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${foodImageProgress}%` }} />
                      </div>
                      <span className="text-white text-xs">{Math.round(foodImageProgress)}%</span>
                    </div>
                  )}
                  {foodImageUrl && !foodImageUploading && (
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <span className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        <CheckCircle size={11} /> Uploaded
                      </span>
                      <button type="button" onClick={removeFoodImage}
                        className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              {foodImageUrl && (
                <Button type="button" variant="outline" size="sm" className="w-fit"
                  onClick={() => foodFileInputRef.current?.click()}>
                  <Upload size={12} className="mr-1" /> Replace image
                </Button>
              )}
            </div>

            {success && <FormSuccess message={success} />}
            {error   && <FormError  message={error}   />}

            <Button type="submit" disabled={isPending || foodImageUploading} className="w-full">
              {isPending
                ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving food item...</>
                : <><UtensilsCrossed size={16} className="mr-2" /> Add Food Item</>}
            </Button>
          </form>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  ROOM FORM                                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {formMode === "room" && (
        <>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-600">
              <Hotel className="w-5 h-5" />
            </span>
            Add a Room
          </h2>

          <form onSubmit={handleRoomSubmit(onRoomSubmit)} className="flex flex-col gap-5">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-name">Room Name</Label>
              <Input id="room-name" {...regRoom("name")} placeholder="e.g. Deluxe King Suite" disabled={isPending}
                className={roomErrors.name ? "border-red-400 focus-visible:ring-red-300" : ""} />
              {roomErrors.name && <p className="text-xs text-red-500">{roomErrors.name.message}</p>}
            </div>

            {/* Price + Room Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="room-price">Price per Night (₦)</Label>
                <Input id="room-price" type="number" min="0"
                  {...regRoom("price", { valueAsNumber: true })} placeholder="25000" disabled={isPending}
                  className={roomErrors.price ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {roomErrors.price && <p className="text-xs text-red-500">{roomErrors.price.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="room-number">Room Number <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="room-number" {...regRoom("roomNumber")} placeholder="e.g. 101" disabled={isPending} />
              </div>
            </div>

            {/* Capacity + Bed */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="room-capacity">
                  <Users size={12} className="inline mr-1" />
                  Max Guests
                </Label>
                <Input id="room-capacity" type="number" min="1"
                  {...regRoom("capacity", { valueAsNumber: true })} placeholder="2" disabled={isPending}
                  className={roomErrors.capacity ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {roomErrors.capacity && <p className="text-xs text-red-500">{roomErrors.capacity.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>
                  <BedDouble size={12} className="inline mr-1" />
                  Bed Type <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {ROOM_BED_OPTIONS.map((bed) => {
                    const current = watchRoom("bed")
                    return (
                      <button key={bed} type="button"
                        onClick={() => setRoomValue("bed", current === bed ? "" : bed, { shouldValidate: true })}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                          current === bed
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-border text-muted-foreground hover:border-amber-300 hover:text-foreground"
                        }`}>
                        {bed}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-description">Description</Label>
              <Textarea id="room-description" {...regRoom("description")}
                placeholder="e.g. Spacious suite with a king-sized bed, private bathroom, and city views..." rows={3}
                disabled={isPending}
                className={roomErrors.description ? "border-red-400 focus-visible:ring-red-300 resize-none" : "resize-none"} />
              {roomErrors.description && <p className="text-xs text-red-500">{roomErrors.description.message}</p>}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <button type="button" role="switch" aria-checked={roomStatus === "AVAILABLE"}
                  onClick={() => setRoomValue("status", roomStatus === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE", { shouldValidate: true })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${
                    roomStatus === "AVAILABLE" ? "bg-green-500" : "bg-red-400"
                  }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    roomStatus === "AVAILABLE" ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
                <Label className="cursor-pointer select-none text-sm">
                  {roomStatus === "AVAILABLE" ? "✅ Available" : "🔴 Occupied"}
                </Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <button type="button" role="switch" aria-checked={roomFeatured}
                  onClick={() => setRoomValue("featured", !roomFeatured, { shouldValidate: true })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${roomFeatured ? "bg-amber-500" : "bg-muted"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${roomFeatured ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <Label className="cursor-pointer select-none text-sm">{roomFeatured ? "Featured ✓" : "Feature it"}</Label>
              </div>
            </div>

            {/* Standard Amenities */}
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50">
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                ✨ Standard Amenities
                <span className="text-xs font-normal text-amber-600">(included in all rooms)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {STANDARD_ROOM_AMENITIES.map((a) => (
                  <span key={a} className="text-xs bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Room Images */}
            <div className="flex flex-col gap-1.5">
              <Label>Room Images</Label>
              {roomErrors.images && <p className="text-xs text-red-500">{roomErrors.images.message as string}</p>}
              <p className="text-xs text-muted-foreground">Upload multiple photos of the room.</p>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {roomImageDrafts.map((draft) => (
                  <div key={draft.id} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/20">
                    <img src={draft.previewUrl} alt="room" className="w-full h-full object-cover" />
                    {!draft.firebaseUrl && !draft.error && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
                        <Loader2 size={16} className="text-white animate-spin" />
                        <div className="w-3/4 h-1 rounded-full bg-white/30 overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${draft.progress}%` }} />
                        </div>
                      </div>
                    )}
                    {draft.firebaseUrl && (
                      <button type="button" onClick={() => removeRoomImage(draft.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors">
                        <X size={10} />
                      </button>
                    )}
                    {draft.error && (
                      <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                        <AlertCircle size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => roomFileInputRef.current?.click()} disabled={isPending}
                  className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/20 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center gap-1">
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add photo</span>
                </button>
              </div>
            </div>

            {success && <FormSuccess message={success} />}
            {error   && <FormError  message={error}   />}

            <Button type="submit" disabled={isPending || isAnyRoomImageUploading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              {isPending
                ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving room...</>
                : <><Hotel size={16} className="mr-2" /> Add Room</>}
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}

export default AddProductForm