"use server"

import { db }                                         from "@/lib/db"
import { ROOM_VALIDATOR, RoomForm, STANDARD_ROOM_AMENITIES } from "@/lib/validators/room-validator"
import { revalidatePath }                              from "next/cache"

export async function createRoomAction(data: RoomForm) {
  const parsed = ROOM_VALIDATOR.safeParse(data)

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid room data",
    }
  }

  const {
    name, description, price, roomNumber,
    capacity, bed, images, featured, status,
  } = parsed.data

  try {
    const room = await db.room.create({
      data: {
        name,
        description,
        price,
        roomNumber:  roomNumber ?? null,
        capacity,
        available:   status === "AVAILABLE" ? 1 : 0,
        status,
        bed:         bed ?? null,
        amenities:   [...STANDARD_ROOM_AMENITIES],
        images,
        featured,
      },
    })

    revalidatePath("/admin/rooms")
    revalidatePath("/")

    return { success: true, room }
  } catch (err: any) {
    console.error("[CREATE_ROOM_ACTION]", err)
    return { error: "Failed to save room to database" }
  }
}