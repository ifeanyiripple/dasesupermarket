import { z } from "zod"

export const ROOM_BED_OPTIONS = [
  "Single",
  "Double",
  "Queen Size",
  "King Size",
  "Twin",
] as const

export type RoomBed = (typeof ROOM_BED_OPTIONS)[number]

export const STANDARD_ROOM_AMENITIES = [
  "WiFi",
  "24/7 Power Supply",
  "TV",
  "Security",
  "AC",
  "Cushion",
] as const

export const ROOM_VALIDATOR = z.object({
  name:       z.string().min(2, "Room name is required"),
  description:z.string().min(5, "Description is required"),
  price:      z.number().min(1, "Price must be greater than 0"),
  roomNumber: z.string().optional(),
  capacity:   z.number().int().min(1, "Capacity must be at least 1"),
  bed:        z.string().optional(),
  images:     z.array(z.string().min(1)).min(1, "Please upload at least one image"),
  featured:   z.boolean(),
  status:     z.enum(["AVAILABLE", "OCCUPIED", ]),
})

export type RoomForm = z.infer<typeof ROOM_VALIDATOR>