"use client"
// components/admin/ItemFormModal.tsx
// Reusable FULL-SCREEN modal for Add / Edit — Product, Food, and Room
// Usage:
//   <ItemFormModal mode="product" item={p} onClose={...} onSuccess={...} />
//   <ItemFormModal mode="food"    item={f} onClose={...} onSuccess={...} />
//   <ItemFormModal mode="room"    item={r} onClose={...} onSuccess={...} />

import { useState, useCallback, useRef, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { PRODUCT_VALIDATOR } from "@/lib/validators/product-validator"
// ── FIX: use `type` keyword to avoid name conflict with local function names ──
import { FOOD_VALIDATOR, type FoodForm as FoodFormValues, FOOD_CATEGORIES, FOOD_BADGE_OPTIONS } from "@/lib/validators/food-validator"
import { ROOM_VALIDATOR, type RoomForm as RoomFormValues, ROOM_BED_OPTIONS, STANDARD_ROOM_AMENITIES } from "@/lib/validators/room-validator"
import handleImageSaveToFireBase from "@/lib/upload"
import { categories } from "@/utils/Categories"
import { colors }     from "@/utils/Colors"
import { createFoodAction } from "@/actions/create-food"
import { updateFoodAction } from "@/actions/update-food"
import { createRoomAction } from "@/actions/create-room"
import { updateRoomAction } from "@/actions/update-room"
import { z } from "zod"
import {
  X, Upload, Package, UtensilsCrossed, BedDouble,
  CheckCircle, AlertCircle, Loader2, Plus, Trash2,
  ChevronLeft,
} from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { toast }    from "sonner"
import { cn }       from "@/lib/utils"

// ── Shared types ──────────────────────────────────────────────────────────────

type ProductForm = z.infer<typeof PRODUCT_VALIDATOR>

type ExistingImage = { id: string; color: string; colorCode: string; image: string }
type UploadingImage = {
  id: string; color: string; colorCode: string; file: File
  previewUrl: string; firebaseUrl: string | null; progress: number; error?: string
}

// ── Mode-specific item shapes ─────────────────────────────────────────────────

type ProductItem = {
  id: string; name: string; description: string; price: number; originalPrice: number | null
  brand: string | null; category: string; inStock: boolean; badge: string | null
  isFeatured: boolean; netContent: string | null; containerType: string | null
  keyFeatures: string[]; ingredients: string | null; storageInfo: string | null
  countryOfOrigin: string | null; images: ExistingImage[]
}

type FoodItem = {
  id: string; name: string; category: string; description: string; price: number
  image: string; badge: string | null; spicy: boolean; rating: number; prepTime: string
  serves: number; inStock: boolean; isFeatured: boolean
  meatOptions: { id?: string; name: string; price: number; isDefault: boolean }[]
}

type RoomItem = {
  id: string; name: string; description: string; price: number; roomNumber: string | null
  capacity: number; bed: string | null; images: string[]; featured: boolean
  status: "AVAILABLE" | "OCCUPIED"
}

// ── Discriminated union props ─────────────────────────────────────────────────

type Props =
  | { mode: "product"; item?: ProductItem; onClose: () => void; onSuccess: () => void }
  | { mode: "food";    item?: FoodItem;    onClose: () => void; onSuccess: () => void }
  | { mode: "room";    item?: RoomItem;    onClose: () => void; onSuccess: () => void }

// ── Shared Toggle switch ──────────────────────────────────────────────────────

function Toggle({ value, onChange, label, disabled }: {
  value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
      <button type="button" role="switch" aria-checked={value} disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn("w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0",
          value ? "bg-[#1a5c38]" : "bg-muted", disabled && "opacity-50 cursor-not-allowed")}>
        <div className={cn("w-5 h-5 bg-white rounded-full shadow transition-transform", value ? "translate-x-5" : "translate-x-0")} />
      </button>
      <Label className="cursor-pointer select-none text-sm">{label}</Label>
    </div>
  )
}

// ── Shared FieldError ─────────────────────────────────────────────────────────

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-red-500 mt-0.5">{msg}</p> : null

// ═══════════════════════════════════════════════════════════════════════════════
// ── PRODUCT FORM ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ProductFormSection({ item, onClose, onSuccess }: { item?: ProductItem; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!item
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadingImages,  setUploadingImages]  = useState<UploadingImage[]>([])
  const [existingImages,   setExistingImages]   = useState<ExistingImage[]>(item?.images ?? [])
  const [pendingColor,     setPendingColor]     = useState<{ color: string; colorCode: string } | null>(null)
  const [isAnyUploading,   setIsAnyUploading]   = useState(false)
  const [featureInput,     setFeatureInput]     = useState("")

  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (data: ProductForm) => client.products.createProduct.$post(data),
    onSuccess:  () => { toast.success("Product created"); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); onSuccess() },
    onError:    (e: any) => toast.error(e?.message || "Failed to create product"),
  })
  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async (data: ProductForm) => client.products.updateProduct.$post({ id: item!.id, data }),
    onSuccess:  () => { toast.success("Product updated"); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); onSuccess() },
    onError:    (e: any) => toast.error(e?.message || "Failed to update product"),
  })
  const isPending = isCreating || isUpdating

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(PRODUCT_VALIDATOR),
    defaultValues: {
      name: item?.name ?? "", description: item?.description ?? "", badge: (item?.badge as any) ?? undefined,
      isFeatured: item?.isFeatured ?? false, originalPrice: item?.originalPrice ?? undefined,
      price: item?.price ?? 0, brand: item?.brand ?? "", category: item?.category ?? "",
      inStock: item?.inStock ?? false, netContent: item?.netContent ?? "",
      containerType: item?.containerType ?? "", keyFeatures: item?.keyFeatures ?? [],
      ingredients: item?.ingredients ?? "", storageInfo: item?.storageInfo ?? "",
      countryOfOrigin: item?.countryOfOrigin ?? "",
      images: item?.images.map(img => ({ color: img.color, colorCode: img.colorCode, image: img.image })) ?? [],
    },
  })

  const category  = watch("category"); const inStock   = watch("inStock"); const isFeatured = watch("isFeatured")
  const badge     = watch("badge");    const features  = watch("keyFeatures") ?? []

  const addFeature = () => {
    const t = featureInput.trim(); if (!t) return
    setValue("keyFeatures", [...features, t], { shouldValidate: true }); setFeatureInput("")
  }
  const removeFeature = (i: number) =>
    setValue("keyFeatures", features.filter((_, idx) => idx !== i), { shouldValidate: true })

  const syncImagesToForm = useCallback((uploading: UploadingImage[], existing: ExistingImage[]) => {
    const fromExisting  = existing.map(img => ({ color: img.color, colorCode: img.colorCode, image: img.image }))
    const fromUploading = uploading.filter(img => img.firebaseUrl).map(img => ({ color: img.color, colorCode: img.colorCode, image: img.firebaseUrl! }))
    setValue("images", [...fromExisting, ...fromUploading], { shouldValidate: true })
  }, [setValue])

  const uploadImageForColor = useCallback(async (file: File, color: string, colorCode: string) => {
    const id = Math.random().toString(36).slice(2)
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
        syncImagesToForm(next, existingImages); return next
      })
    } catch {
      setUploadingImages(prev => prev.map(img => img.id === id ? { ...img, error: "Upload failed" } : img))
      toast.error(`Failed to upload image for ${color}`)
    } finally { setIsAnyUploading(false) }
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
      syncImagesToForm(next, existingImages); return next
    })
  }, [existingImages, syncImagesToForm])

  const removeExistingImage = useCallback((id: string) => {
    setExistingImages(prev => {
      const next = prev.filter(img => img.id !== id)
      syncImagesToForm(uploadingImages, next); return next
    })
  }, [uploadingImages, syncImagesToForm])

  const onSubmit = (data: ProductForm) => {
    if (isAnyUploading) { toast.error("Please wait for uploads to finish"); return }
    if (!data.images || data.images.length === 0) { toast.error("Upload at least one product image"); return }
    isEdit ? updateProduct(data) : createProduct(data)
  }

  const assignedColors = new Set([...existingImages.map(i => i.color), ...uploadingImages.map(i => i.color)])

  const BADGE_OPTIONS = [
    { value: "new",     label: "New",     color: "bg-blue-100 text-blue-700" },
    { value: "sale",    label: "Sale",    color: "bg-red-100 text-red-700" },
    { value: "hot",     label: "Hot",     color: "bg-orange-100 text-orange-700" },
    { value: "organic", label: "Organic", color: "bg-[#f0faf4] text-[#1a5c38]" },
  ]

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label>Product Name</Label>
          <Input {...register("name")} placeholder="e.g. Bama Real Mayonnaise" disabled={isPending} className={errors.name ? "border-red-400" : ""} />
          <FieldError msg={errors.name?.message} />
        </div>

        {/* Price + Original */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Price (₦)</Label>
            <Input type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} placeholder="0.00" disabled={isPending} className={errors.price ? "border-red-400" : ""} />
            <FieldError msg={errors.price?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Original Price (₦) <span className="text-xs text-muted-foreground">(crossed-out)</span></Label>
            <Input type="number" step="0.01" min="0" {...register("originalPrice", { valueAsNumber: true })} placeholder="leave empty if no discount" disabled={isPending} />
          </div>
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <Label>Brand <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <Input {...register("brand")} placeholder="e.g. Bama" disabled={isPending} />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="Describe the product..." rows={3} disabled={isPending} className={cn("resize-none", errors.description ? "border-red-400" : "")} />
          <FieldError msg={errors.description?.message} />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <Toggle value={inStock}    onChange={v => setValue("inStock", v, { shouldValidate: true })} label={inStock ? "In Stock" : "Out of Stock"} disabled={isPending} />
          <Toggle value={isFeatured} onChange={v => setValue("isFeatured", v, { shouldValidate: true })} label={isFeatured ? "Featured ✓" : "Feature on homepage"} disabled={isPending} />
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-1.5">
          <Label>Badge <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.map(b => (
              <button key={b.value} type="button" disabled={isPending}
                onClick={() => setValue("badge", badge === b.value ? undefined : (b.value as any), { shouldValidate: true })}
                className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-all", b.color,
                  badge === b.value ? "ring-2 ring-offset-1 ring-[#1a5c38]" : "opacity-60 hover:opacity-100")}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-muted/10">
          <p className="text-sm font-bold flex items-center gap-2"><span>📋</span> Product Details <span className="text-xs font-normal text-muted-foreground">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><Label>Net Content</Label><Input {...register("netContent")} placeholder="e.g. 385mL" disabled={isPending} /></div>
            <div className="flex flex-col gap-1.5"><Label>Container Type</Label><Input {...register("containerType")} placeholder="e.g. Plastic Jar" disabled={isPending} /></div>
            <div className="flex flex-col gap-1.5"><Label>Country of Origin</Label><Input {...register("countryOfOrigin")} placeholder="e.g. Nigeria" disabled={isPending} /></div>
            <div className="flex flex-col gap-1.5"><Label>Storage Info</Label><Input {...register("storageInfo")} placeholder="e.g. Keep refrigerated" disabled={isPending} /></div>
          </div>
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
                    <span className="text-[#1a5c38] text-xs font-bold">✓</span>
                    <span className="text-sm flex-1">{f}</span>
                    <button type="button" onClick={() => removeFeature(idx)} className="text-muted-foreground hover:text-red-500"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Ingredients <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea {...register("ingredients")} placeholder="e.g. Soybean Oil, Egg Yolk..." rows={2} disabled={isPending} className="resize-none" />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <FieldError msg={errors.category?.message} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {categories.filter(c => c.label !== "All").map(item => (
              <button key={item.label} type="button" disabled={isPending}
                onClick={() => setValue("category", item.label, { shouldValidate: true })}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                  category === item.label ? "border-[#1a5c38] bg-[#f0faf4] text-[#1a5c38]" : "border-border text-muted-foreground hover:border-[#1a5c38]/40")}
                style={{ backgroundColor: category === item.label ? undefined : item.color }}>
                <span className="text-base leading-none">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col gap-1.5">
          <Label>Product Colors & Images</Label>
          <FieldError msg={errors.images?.message as string} />
          {isEdit && existingImages.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              <p className="text-xs font-semibold text-[#1a5c38]">Current Images</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.image} alt={img.color} className="w-16 h-16 object-cover rounded-xl border-2 border-[#1a5c38]/30" />
                    <button type="button" onClick={() => removeExistingImage(img.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                    <p className="text-[9px] text-center text-gray-500 mt-0.5 truncate max-w-[64px]">{img.color}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {colors.filter(c => !assignedColors.has(c.color)).map(item => {
              const uploading = uploadingImages.find(img => img.color === item.color)
              const isSelected = pendingColor?.color === item.color
              return (
                <button key={item.color} type="button" disabled={isPending}
                  onClick={() => setPendingColor({ color: item.color, colorCode: item.colorCode })}
                  className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                    isSelected ? "border-[#1a5c38] bg-[#f0faf4]" : uploading?.firebaseUrl ? "border-green-400 bg-green-50" : "border-border bg-muted/30 hover:border-[#1a5c38]/40")}>
                  <div className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: item.colorCode }} />
                  <span className="text-xs font-medium flex-1 truncate">{item.color}</span>
                  {uploading?.firebaseUrl && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                  {uploading && !uploading.firebaseUrl && !uploading.error && <Loader2 size={14} className="text-[#1a5c38] animate-spin flex-shrink-0" />}
                  {uploading?.error && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          {pendingColor && (
            <div className="mt-3 p-4 rounded-xl border border-dashed border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: pendingColor.colorCode }} />
                <p className="text-sm font-semibold">{pendingColor.color}</p>
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
                    <p className="text-xs text-muted-foreground">{entry.error ? "Upload failed" : `Uploading... ${Math.round(entry.progress)}%`}</p>
                    {!entry.error && <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-[#1a5c38] rounded-full transition-all" style={{ width: `${entry.progress}%` }} /></div>}
                    {entry.error && <Button type="button" variant="outline" size="sm" className="text-red-500 w-fit" onClick={() => fileInputRef.current?.click()}>Retry upload</Button>}
                  </div>
                )
                return <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2"><Upload size={14} /> Upload Image</Button>
              })()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border sticky bottom-0 bg-[#f7fdfb] pb-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" disabled={isPending || isAnyUploading} className="flex-1 h-11 bg-[#1a5c38] hover:bg-[#2d7a4f] text-white">
            {isPending ? <><Loader2 size={16} className="animate-spin mr-2" />{isEdit ? "Saving..." : "Creating..."}</> : <><Package size={16} className="mr-2" />{isEdit ? "Save Changes" : "Add Product"}</>}
          </Button>
        </div>
      </form>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FOOD FORM ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function FoodFormSection({ item, onClose, onSuccess }: { item?: FoodItem; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!item
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadingUrl,    setUploadingUrl]    = useState<string | null>(item?.image ?? null)
  const [isUploading,     setIsUploading]     = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState(0)
  const [meatOptionInput, setMeatOptionInput] = useState({ name: "", price: 0, isDefault: false })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FoodFormValues>({
    resolver: zodResolver(FOOD_VALIDATOR),
    defaultValues: {
      name:        item?.name        ?? "",
      category:    item?.category    ?? "",
      description: item?.description ?? "",
      price:       item?.price       ?? 0,
      image:       item?.image       ?? "",
      badge:       item?.badge       ?? undefined,
      spicy:       item?.spicy       ?? false,
      rating:      item?.rating      ?? 0,
      prepTime:    item?.prepTime    ?? "",
      serves:      item?.serves      ?? 1,
      inStock:     item?.inStock     ?? true,
      isFeatured:  item?.isFeatured  ?? false,
      meatOptions: item?.meatOptions?.map(({ name, price, isDefault }) => ({ name, price, isDefault })) ?? [],
    },
  })

  const category    = watch("category")
  const spicy       = watch("spicy")
  const inStock     = watch("inStock")
  const isFeatured  = watch("isFeatured")
  const meatOptions = watch("meatOptions") ?? []

  const handleFoodImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setIsUploading(true); setUploadProgress(0)
    try {
      const url = await handleImageSaveToFireBase(file, p => setUploadProgress(Math.round(p)))
      setUploadingUrl(url)
      setValue("image", url, { shouldValidate: true })
    } catch { toast.error("Image upload failed") }
    finally { setIsUploading(false); e.target.value = "" }
  }, [setValue])

  const addMeatOption = () => {
    const { name, price, isDefault } = meatOptionInput
    if (!name.trim()) { toast.error("Option name required"); return }
    setValue("meatOptions", [...meatOptions, { name: name.trim(), price, isDefault }], { shouldValidate: true })
    setMeatOptionInput({ name: "", price: 0, isDefault: false })
  }
  const removeMeatOption = (i: number) =>
    setValue("meatOptions", meatOptions.filter((_, idx) => idx !== i), { shouldValidate: true })

  const onSubmit = (data: FoodFormValues) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateFoodAction(item!.id, data)
        : await createFoodAction(data)
      if (result.error) { toast.error(result.error); return }
      toast.success(isEdit ? "Food updated" : "Food created")
      onSuccess()
    })
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFoodImageUpload} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label>Food Name</Label>
          <Input {...register("name")} placeholder="e.g. Jollof Rice Special" disabled={isPending} className={errors.name ? "border-red-400" : ""} />
          <FieldError msg={errors.name?.message} />
        </div>

        {/* Price + Prep Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Price (₦)</Label>
            <Input type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} placeholder="0.00" disabled={isPending} className={errors.price ? "border-red-400" : ""} />
            <FieldError msg={errors.price?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Prep Time</Label>
            <Input {...register("prepTime")} placeholder="e.g. 25 min" disabled={isPending} className={errors.prepTime ? "border-red-400" : ""} />
            <FieldError msg={errors.prepTime?.message} />
          </div>
        </div>

        {/* Rating + Serves */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Rating (0 - 5)</Label>
            <Input type="number" step="0.1" min="0" max="5" {...register("rating", { valueAsNumber: true })} placeholder="e.g. 4.5" disabled={isPending} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Serves (people)</Label>
            <Input type="number" min="1" {...register("serves", { valueAsNumber: true })} placeholder="e.g. 2" disabled={isPending} />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="Describe this dish..." rows={3} disabled={isPending} className={cn("resize-none", errors.description ? "border-red-400" : "")} />
          <FieldError msg={errors.description?.message} />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-3 gap-3">
          <Toggle value={inStock}    onChange={v => setValue("inStock", v)}    label={inStock ? "In Stock" : "Out of Stock"} disabled={isPending} />
          <Toggle value={isFeatured} onChange={v => setValue("isFeatured", v)} label={isFeatured ? "Featured ✓" : "Feature it"} disabled={isPending} />
          <Toggle value={spicy}      onChange={v => setValue("spicy", v)}      label={spicy ? "🌶 Spicy" : "Not Spicy"} disabled={isPending} />
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-1.5">
          <Label>Badge <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <div className="flex flex-wrap gap-2">
            {FOOD_BADGE_OPTIONS.map(b => {
              const current = watch("badge")
              return (
                <button key={b} type="button" disabled={isPending}
                  onClick={() => setValue("badge", current === b ? undefined : b, { shouldValidate: true })}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-all bg-amber-50 text-amber-700",
                    current === b ? "ring-2 ring-offset-1 ring-amber-500" : "opacity-60 hover:opacity-100")}>
                  {b}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <FieldError msg={errors.category?.message} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {FOOD_CATEGORIES.map(cat => (
              <button key={cat} type="button" disabled={isPending}
                onClick={() => setValue("category", cat, { shouldValidate: true })}
                className={cn("px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left",
                  category === cat ? "border-[#1a5c38] bg-[#f0faf4] text-[#1a5c38]" : "border-border text-muted-foreground hover:border-[#1a5c38]/40")}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Food Image */}
        <div className="flex flex-col gap-1.5">
          <Label>Food Image</Label>
          <FieldError msg={errors.image?.message} />
          {uploadingUrl ? (
            <div className="flex items-center gap-4 p-3 rounded-xl border border-green-200 bg-green-50">
              <img src={uploadingUrl} alt="food" className="w-16 h-16 object-cover rounded-xl border" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-700">Image uploaded</p>
                <Button type="button" variant="outline" size="sm" className="mt-1.5" onClick={() => fileInputRef.current?.click()}>Replace</Button>
              </div>
              <button type="button" onClick={() => { setUploadingUrl(null); setValue("image", "", { shouldValidate: true }) }}
                className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-[#1a5c38] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:border-[#1a5c38]/40 hover:bg-[#f0faf4] transition-all text-muted-foreground text-sm font-medium">
              <Upload size={18} /> Upload Food Image
            </button>
          )}
        </div>

        {/* Meat Options */}
        <div className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-muted/10">
          <p className="text-sm font-bold">🥩 Protein / Meat Options <span className="text-xs font-normal text-muted-foreground">(optional)</span></p>
          <div className="grid grid-cols-3 gap-2">
            <Input value={meatOptionInput.name} onChange={e => setMeatOptionInput(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chicken" disabled={isPending} />
            <Input type="number" value={meatOptionInput.price} onChange={e => setMeatOptionInput(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} placeholder="Extra price" disabled={isPending} />
            <Button type="button" variant="outline" onClick={addMeatOption} disabled={isPending}><Plus size={14} className="mr-1" /> Add</Button>
          </div>
          {meatOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              {meatOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-sm flex-1 font-medium">{opt.name}</span>
                  {opt.price > 0 && <span className="text-xs text-[#1a5c38] font-bold">+₦{opt.price.toLocaleString()}</span>}
                  {opt.isDefault && <span className="text-[10px] bg-[#f0faf4] text-[#1a5c38] px-1.5 py-0.5 rounded font-bold">Default</span>}
                  <button type="button" onClick={() => removeMeatOption(i)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border sticky bottom-0 bg-[#f7fdfb] pb-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" disabled={isPending || isUploading} className="flex-1 h-11 bg-[#1a5c38] hover:bg-[#2d7a4f] text-white">
            {isPending ? <><Loader2 size={16} className="animate-spin mr-2" />{isEdit ? "Saving..." : "Creating..."}</> : <><UtensilsCrossed size={16} className="mr-2" />{isEdit ? "Save Changes" : "Add Food"}</>}
          </Button>
        </div>
      </form>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ROOM FORM ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function RoomFormSection({ item, onClose, onSuccess }: { item?: RoomItem; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!item
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadedImages, setUploadedImages] = useState<string[]>(item?.images ?? [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RoomFormValues>({
    resolver: zodResolver(ROOM_VALIDATOR),
    defaultValues: {
      name:        item?.name        ?? "",
      description: item?.description ?? "",
      price:       item?.price       ?? 0,
      roomNumber:  item?.roomNumber  ?? "",
      capacity:    item?.capacity    ?? 1,
      bed:         item?.bed         ?? ROOM_BED_OPTIONS[0],
      images:      item?.images      ?? [],
      featured:    item?.featured    ?? false,
      status:      item?.status      ?? "AVAILABLE",
    },
  })

  const featured = watch("featured")
  const status   = watch("status")
  const bed      = watch("bed")

  const handleRoomImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setIsUploading(true); setUploadProgress(0)
    try {
      const url = await handleImageSaveToFireBase(file, p => setUploadProgress(Math.round(p)))
      const newImages = [...uploadedImages, url]
      setUploadedImages(newImages)
      setValue("images", newImages, { shouldValidate: true })
    } catch { toast.error("Image upload failed") }
    finally { setIsUploading(false); e.target.value = "" }
  }, [uploadedImages, setValue])

  const removeRoomImage = (url: string) => {
    const newImages = uploadedImages.filter(u => u !== url)
    setUploadedImages(newImages)
    setValue("images", newImages, { shouldValidate: true })
  }

  const onSubmit = (data: RoomFormValues) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateRoomAction(item!.id, data)
        : await createRoomAction(data)
      if (result.error) { toast.error(result.error); return }
      toast.success(isEdit ? "Room updated" : "Room created")
      onSuccess()
    })
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleRoomImageUpload} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Name + Room Number */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Room Name</Label>
            <Input {...register("name")} placeholder="e.g. Deluxe Suite" disabled={isPending} className={errors.name ? "border-red-400" : ""} />
            <FieldError msg={errors.name?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Room Number <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input {...register("roomNumber")} placeholder="e.g. 101" disabled={isPending} />
          </div>
        </div>

        {/* Price + Capacity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Price per Night (₦)</Label>
            <Input type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} placeholder="0.00" disabled={isPending} className={errors.price ? "border-red-400" : ""} />
            <FieldError msg={errors.price?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Capacity (guests)</Label>
            <Input type="number" min="1" {...register("capacity", { valueAsNumber: true })} placeholder="e.g. 2" disabled={isPending} />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="Describe this room..." rows={3} disabled={isPending} className={cn("resize-none", errors.description ? "border-red-400" : "")} />
          <FieldError msg={errors.description?.message} />
        </div>

        {/* Bed type */}
        <div className="flex flex-col gap-1.5">
          <Label>Bed Type</Label>
          <div className="flex flex-wrap gap-2">
            {ROOM_BED_OPTIONS.map(b => (
              <button key={b} type="button" disabled={isPending}
                onClick={() => setValue("bed", b, { shouldValidate: true })}
                className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                  bed === b ? "bg-[#1a5c38] text-white border-[#1a5c38]" : "border-border text-muted-foreground hover:border-[#1a5c38]/40")}>
                🛏 {b}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <Toggle value={featured} onChange={v => setValue("featured", v)} label={featured ? "Featured ✓" : "Feature this room"} disabled={isPending} />
          <button type="button" disabled={isPending}
            onClick={() => setValue("status", status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE", { shouldValidate: true })}
            className={cn("flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all",
              status === "AVAILABLE" ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700")}>
            {status === "AVAILABLE" ? "✓ Available" : "✗ Occupied"}
          </button>
        </div>

        {/* Standard amenities info */}
        <div className="p-3 rounded-xl bg-muted/20 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Standard Amenities (auto-applied)</p>
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_ROOM_AMENITIES.map(a => (
              <span key={a} className="text-[10px] bg-[#f0faf4] text-[#1a5c38] px-2 py-0.5 rounded-full font-semibold">{a}</span>
            ))}
          </div>
        </div>

        {/* Room Images */}
        <div className="flex flex-col gap-1.5">
          <Label>Room Images</Label>
          <FieldError msg={errors.images?.message as string} />
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Room ${i + 1}`} className="w-20 h-20 object-cover rounded-xl border-2 border-[#1a5c38]/30" />
                  <button type="button" onClick={() => removeRoomImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {isUploading ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-[#1a5c38] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:border-[#1a5c38]/40 hover:bg-[#f0faf4] transition-all text-muted-foreground text-sm font-medium">
              <Upload size={18} /> Add Room Image
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border sticky bottom-0 bg-[#f7fdfb] pb-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" disabled={isPending || isUploading} className="flex-1 h-11 bg-[#1a5c38] hover:bg-[#2d7a4f] text-white">
            {isPending ? <><Loader2 size={16} className="animate-spin mr-2" />{isEdit ? "Saving..." : "Creating..."}</> : <><BedDouble size={16} className="mr-2" />{isEdit ? "Save Changes" : "Add Room"}</>}
          </Button>
        </div>
      </form>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ITEM FORM MODAL — EXPORTED FULL-SCREEN WRAPPER ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const MODE_CONFIG = {
  product: {
    icon:  <Package size={18} className="text-[#7ec89a]" />,
    label: "Product",
    headerBg: "bg-[#0d3d25]",
    breadcrumb: "Products",
  },
  food: {
    icon:  <UtensilsCrossed size={18} className="text-[#f59e0b]" />,
    label: "Food Item",
    headerBg: "bg-[#3d1a0d]",
    breadcrumb: "Food Menu",
  },
  room: {
    icon:  <BedDouble size={18} className="text-[#7ec8c8]" />,
    label: "Room",
    headerBg: "bg-[#0d253d]",
    breadcrumb: "Rooms",
  },
}

export default function ItemFormModal(props: Props) {
  const { mode, onClose } = props
  const cfg    = MODE_CONFIG[mode]
  const isEdit = !!props.item

  return (
    // ── Full-screen overlay — feels like a real page ───────────────────────
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f7fdfb] overflow-hidden">

      {/* ── Top navigation bar ─────────────────────────────────────────── */}
      <header className={`${cfg.headerBg} flex-shrink-0`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Left: back button + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">{cfg.breadcrumb}</span>
            </button>

            <span className="text-white/20 text-lg">/</span>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                {cfg.icon}
              </div>
              <div>
                <h1 className="text-white font-bold text-base leading-none">
                  {isEdit ? `Edit ${cfg.label}` : `Add New ${cfg.label}`}
                </h1>
                {isEdit && (
                  <p className="text-white/40 text-[11px] mt-0.5 leading-none truncate max-w-[200px]">
                    {(props.item as any)?.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Sub-bar: mode indicator pills */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Admin Console</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">DASE Supermarket</span>
          <span className="text-white/20">·</span>
          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70`}>
            {isEdit ? "Editing" : "New Entry"}
          </span>
        </div>
      </header>

      {/* ── Scrollable form area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* Section hint */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
              {cfg.icon}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-base">
                {isEdit ? `Update ${cfg.label} Details` : `Create a New ${cfg.label}`}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEdit
                  ? `Edit the fields below and save your changes.`
                  : `Fill in the details below to add this ${cfg.label.toLowerCase()} to your store.`
                }
              </p>
            </div>
          </div>

          {/* Form content — switch on mode */}
          {mode === "product" && (
            <ProductFormSection
              item={props.item as ProductItem}
              onClose={onClose}
              onSuccess={props.onSuccess}
            />
          )}
          {mode === "food" && (
            <FoodFormSection
              item={props.item as FoodItem}
              onClose={onClose}
              onSuccess={props.onSuccess}
            />
          )}
          {mode === "room" && (
            <RoomFormSection
              item={props.item as RoomItem}
              onClose={onClose}
              onSuccess={props.onSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}