"use client"
// components/admin/ProductFormModal.tsx
// Unified Add / Edit product form — pass product prop to edit, omit to create

import { useState, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { PRODUCT_VALIDATOR } from "@/lib/validators/product-validator"
import handleImageSaveToFireBase from "@/lib/upload"
import { categories } from "@/utils/Categories"
import { colors }     from "@/utils/Colors"
import BadgeSelector  from "@/components/ui/BadgeSelector"
import { X, Upload, Package, CheckCircle, AlertCircle, Loader2, Plus } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { Badge }    from "@/components/ui/badge"
import { toast }    from "sonner"
import { cn }       from "@/lib/utils"

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

// Existing DB image (for edit mode)
type ExistingImage = {
  id:        string
  color:     string
  colorCode: string
  image:     string
}

type Props = {
  // If provided → edit mode; omit → create mode
  product?: {
    id:              string
    name:            string
    description:     string
    price:           number
    originalPrice:   number | null
    brand:           string | null
    category:        string
    inStock:         boolean
    badge:           string | null
    isFeatured:      boolean
    netContent:      string | null
    containerType:   string | null
    keyFeatures:     string[]
    ingredients:     string | null
    storageInfo:     string | null
    countryOfOrigin: string | null
    images:          ExistingImage[]
  }
  onClose:   () => void
  onSuccess: () => void
}

export default function ProductFormModal({ product, onClose, onSuccess }: Props) {
  const isEdit       = !!product
  const queryClient  = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadingImages,  setUploadingImages]  = useState<UploadingImage[]>([])
  const [existingImages,   setExistingImages]   = useState<ExistingImage[]>(product?.images ?? [])
  const [pendingColor,     setPendingColor]     = useState<{ color: string; colorCode: string } | null>(null)
  const [isAnyUploading,   setIsAnyUploading]   = useState(false)
  const [featureInput,     setFeatureInput]     = useState("")

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (data: ProductForm) => client.products.createProduct.$post(data),
    onSuccess:  () => { toast.success("Product created ✅"); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); onSuccess() },
    onError:    (e: any) => toast.error(e?.message || "Failed to create product"),
  })

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async (data: ProductForm) =>
      client.products.updateProduct.$post({ id: product!.id, data }),
    onSuccess:  () => { toast.success("Product updated ✅"); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); onSuccess() },
    onError:    (e: any) => toast.error(e?.message || "Failed to update product"),
  })

  const isPending = isCreating || isUpdating

  // ── Form setup ─────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(PRODUCT_VALIDATOR),
    defaultValues: {
      name:            product?.name            ?? "",
      description:     product?.description     ?? "",
      badge:           (product?.badge as any)  ?? undefined,
      isFeatured:      product?.isFeatured      ?? false,
      originalPrice:   product?.originalPrice   ?? undefined,
      price:           product?.price           ?? 0,
      brand:           product?.brand           ?? "",
      category:        product?.category        ?? "",
      inStock:         product?.inStock         ?? false,
      netContent:      product?.netContent      ?? "",
      containerType:   product?.containerType   ?? "",
      keyFeatures:     product?.keyFeatures     ?? [],
      ingredients:     product?.ingredients     ?? "",
      storageInfo:     product?.storageInfo     ?? "",
      countryOfOrigin: product?.countryOfOrigin ?? "",
      // In edit mode, populate images from existing DB images
      images: product?.images.map(img => ({
        color:     img.color,
        colorCode: img.colorCode,
        image:     img.image,
      })) ?? [],
    },
  })

  const category   = watch("category")
  const inStock    = watch("inStock")
  const isFeatured = watch("isFeatured")
  const badge      = watch("badge")
  const features   = watch("keyFeatures") ?? []

  // ── Key features ───────────────────────────────────────────────────────────
  const addFeature = () => {
    const t = featureInput.trim()
    if (!t) return
    setValue("keyFeatures", [...features, t], { shouldValidate: true })
    setFeatureInput("")
  }
  const removeFeature = (i: number) =>
    setValue("keyFeatures", features.filter((_, idx) => idx !== i), { shouldValidate: true })

  // ── Image sync ─────────────────────────────────────────────────────────────
  const syncImagesToForm = useCallback((uploading: UploadingImage[], existing: ExistingImage[]) => {
    const fromExisting  = existing.map(img => ({ color: img.color, colorCode: img.colorCode, image: img.image }))
    const fromUploading = uploading.filter(img => img.firebaseUrl).map(img => ({ color: img.color, colorCode: img.colorCode, image: img.firebaseUrl! }))
    setValue("images", [...fromExisting, ...fromUploading], { shouldValidate: true })
  }, [setValue])

  const uploadImageForColor = useCallback(async (file: File, color: string, colorCode: string) => {
    const id         = Math.random().toString(36).slice(2)
    const previewUrl = URL.createObjectURL(file)

    setUploadingImages(prev => {
      const old = prev.find(img => img.color === color)
      if (old) URL.revokeObjectURL(old.previewUrl)
      return [...prev.filter(img => img.color !== color), { id, color, colorCode, file, previewUrl, firebaseUrl: null, progress: 0 }]
    })
    setIsAnyUploading(true)

    try {
      const url = await handleImageSaveToFireBase(file, progress => {
        setUploadingImages(prev => prev.map(img => img.id === id ? { ...img, progress } : img))
      })
      setUploadingImages(prev => {
        const next = prev.map(img => img.id === id ? { ...img, firebaseUrl: url, progress: 100 } : img)
        syncImagesToForm(next, existingImages)
        return next
      })
    } catch {
      setUploadingImages(prev => prev.map(img => img.id === id ? { ...img, error: "Upload failed" } : img))
      toast.error(`Failed to upload image for ${color}`)
    } finally {
      setIsAnyUploading(false)
    }
  }, [existingImages, syncImagesToForm])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pendingColor) return
    const file = e.target.files?.[0]
    if (file) uploadImageForColor(file, pendingColor.color, pendingColor.colorCode)
    e.target.value = ""
  }, [pendingColor, uploadImageForColor])

  const removeUploadingImage = useCallback((color: string) => {
    setUploadingImages(prev => {
      const item = prev.find(img => img.color === color)
      if (item) URL.revokeObjectURL(item.previewUrl)
      const next = prev.filter(img => img.color !== color)
      syncImagesToForm(next, existingImages)
      return next
    })
  }, [existingImages, syncImagesToForm])

  const removeExistingImage = useCallback((id: string) => {
    setExistingImages(prev => {
      const next = prev.filter(img => img.id !== id)
      syncImagesToForm(uploadingImages, next)
      return next
    })
  }, [uploadingImages, syncImagesToForm])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = (data: ProductForm) => {
    if (isAnyUploading) { toast.error("Please wait for uploads to finish"); return }
    if (!data.images || data.images.length === 0) { toast.error("Upload at least one product image"); return }
    isEdit ? updateProduct(data) : createProduct(data)
  }

  // ── All colors that already have an image assigned ─────────────────────────
  const assignedColors = new Set([
    ...existingImages.map(i => i.color),
    ...uploadingImages.map(i => i.color),
  ])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 pt-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d3d25] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Package size={16} className="text-[#7ec89a]" />
            </div>
            <div>
              <h2 className="font-bold text-base">{isEdit ? "Edit Product" : "Add New Product"}</h2>
              {isEdit && <p className="text-[11px] text-white/50">{product.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Bama Real Mayonnaise" disabled={isPending} className={errors.name ? "border-red-400" : ""} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Price + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price (₦)</Label>
              <Input id="price" type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} placeholder="0.00" disabled={isPending} className={errors.price ? "border-red-400" : ""} />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="originalPrice">Original Price (₦) <span className="text-xs text-muted-foreground">(crossed-out)</span></Label>
              <Input id="originalPrice" type="number" step="0.01" min="0" {...register("originalPrice", { valueAsNumber: true })} placeholder="leave empty if no discount" disabled={isPending} />
            </div>
          </div>

          {/* Brand + Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brand">Brand <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input id="brand" {...register("brand")} placeholder="e.g. Bama" disabled={isPending} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe the product..." rows={3} disabled={isPending} className={cn("resize-none", errors.description ? "border-red-400" : "")} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
              <button type="button" role="switch" aria-checked={inStock}
                onClick={() => setValue("inStock", !inStock, { shouldValidate: true })}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${inStock ? "bg-[#1a5c38]" : "bg-muted"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${inStock ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <Label className="cursor-pointer select-none text-sm">{inStock ? "In Stock" : "Out of Stock"}</Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
              <button type="button" role="switch" aria-checked={isFeatured}
                onClick={() => setValue("isFeatured", !isFeatured, { shouldValidate: true })}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${isFeatured ? "bg-[#1a5c38]" : "bg-muted"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <Label className="cursor-pointer select-none text-sm">{isFeatured ? "Featured ✓" : "Feature on homepage"}</Label>
            </div>
          </div>

          {/* Badge */}
          <BadgeSelector value={badge} onChange={b => setValue("badge", b, { shouldValidate: true })} disabled={isPending} />

          {/* Product Details */}
          <div className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-muted/10">
            <p className="text-sm font-bold flex items-center gap-2">
              <span>📋</span> Product Details
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="netContent">Net Content</Label>
                <Input id="netContent" {...register("netContent")} placeholder="e.g. 385mL, 1kg" disabled={isPending} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="containerType">Container Type</Label>
                <Input id="containerType" {...register("containerType")} placeholder="e.g. Plastic Jar" disabled={isPending} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                <Input id="countryOfOrigin" {...register("countryOfOrigin")} placeholder="e.g. Nigeria" disabled={isPending} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="storageInfo">Storage Info</Label>
                <Input id="storageInfo" {...register("storageInfo")} placeholder="e.g. Keep refrigerated" disabled={isPending} />
              </div>
            </div>
            {/* Key Features */}
            <div className="flex flex-col gap-1.5">
              <Label>Key Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature() } }}
                  placeholder="e.g. Rich in Vitamin C — press Enter or Add" disabled={isPending} />
                <Button type="button" variant="outline" onClick={addFeature} disabled={isPending || !featureInput.trim()} className="flex-shrink-0">
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
                      <span className="text-[#1a5c38] text-xs font-bold flex-shrink-0">✓</span>
                      <span className="text-sm flex-1">{f}</span>
                      <button type="button" onClick={() => removeFeature(idx)} className="text-muted-foreground hover:text-red-500 flex-shrink-0"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Ingredients */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ingredients">Ingredients <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Textarea id="ingredients" {...register("ingredients")} placeholder="e.g. Soybean Oil, Egg Yolk..." rows={2} disabled={isPending} className="resize-none" />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {categories.filter(c => c.label !== "All").map(item => (
                <button key={item.label} type="button" disabled={isPending}
                  onClick={() => setValue("category", item.label, { shouldValidate: true })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${category === item.label ? "border-[#1a5c38] bg-[#f0faf4] text-[#1a5c38]" : "border-border text-muted-foreground hover:border-[#1a5c38]/40"}`}
                  style={{ backgroundColor: category === item.label ? undefined : item.color }}>
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors & Images */}
          <div className="flex flex-col gap-1.5">
            <Label>Product Colors & Images</Label>
            {errors.images && <p className="text-xs text-red-500">{errors.images.message as string}</p>}

            {/* Show existing images in edit mode */}
            {isEdit && existingImages.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                <p className="text-xs font-semibold text-[#1a5c38]">Current Images</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.image} alt={img.color} className="w-16 h-16 object-cover rounded-xl border-2 border-[#1a5c38]/30" />
                      <div className="absolute -top-1.5 -right-1.5">
                        <button type="button" onClick={() => removeExistingImage(img.id)}
                          className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                      <p className="text-[9px] text-center text-gray-500 mt-0.5 truncate max-w-[64px]">{img.color}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-2">
              {isEdit ? "Add new color variants below:" : "Click a color to select it, then upload its image."}
            </p>

            {/* Color grid */}
            <div className="grid grid-cols-2 gap-2">
              {colors.filter(c => !assignedColors.has(c.color)).map(item => {
                const uploading  = uploadingImages.find(img => img.color === item.color)
                const isSelected = pendingColor?.color === item.color
                return (
                  <button key={item.color} type="button" disabled={isPending}
                    onClick={() => setPendingColor({ color: item.color, colorCode: item.colorCode })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${isSelected ? "border-[#1a5c38] bg-[#f0faf4]" : uploading?.firebaseUrl ? "border-green-400 bg-green-50" : uploading?.error ? "border-red-300 bg-red-50" : "border-border bg-muted/30 hover:border-[#1a5c38]/40"}`}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: item.colorCode }} />
                    <span className="text-xs font-medium flex-1 truncate">{item.color}</span>
                    {uploading?.firebaseUrl && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                    {uploading && !uploading.firebaseUrl && !uploading.error && <Loader2 size={14} className="text-[#1a5c38] animate-spin flex-shrink-0" />}
                    {uploading?.error && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Upload panel */}
            {pendingColor && (
              <div className="mt-3 p-4 rounded-xl border border-dashed border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: pendingColor.colorCode }} />
                  <p className="text-sm font-semibold">{pendingColor.color}</p>
                  <Badge variant="outline" className="ml-auto text-xs">Selected</Badge>
                </div>
                {(() => {
                  const entry = uploadingImages.find(img => img.color === pendingColor.color)
                  if (entry?.firebaseUrl) return (
                    <div className="flex items-center gap-4">
                      <img src={entry.previewUrl} alt={entry.color} className="w-16 h-16 object-cover rounded-lg border" />
                      <div className="flex flex-col gap-1.5">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Replace image</Button>
                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => removeUploadingImage(pendingColor.color)}><X size={12} className="mr-1" /> Remove</Button>
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
                          <div className="h-full bg-[#1a5c38] rounded-full transition-all" style={{ width: `${entry.progress}%` }} />
                        </div>
                      )}
                      {entry.error && <Button type="button" variant="outline" size="sm" className="text-red-500 w-fit" onClick={() => fileInputRef.current?.click()}>Retry upload</Button>}
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

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isPending || isAnyUploading} className="flex-1 bg-[#1a5c38] hover:bg-[#2d7a4f] text-white">
              {isPending ? <><Loader2 size={16} className="animate-spin mr-2" />{isEdit ? "Saving..." : "Creating..."}</> : <><Package size={16} className="mr-2" />{isEdit ? "Save Changes" : "Add Product"}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}