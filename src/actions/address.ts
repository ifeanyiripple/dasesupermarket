"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PendingAddress } from "@/context/DeliveryAddressContext";

export async function saveAddressAction(data: PendingAddress): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Check if a default address already exists; if so don't override
  const existing = await db.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  await db.address.create({
    data: {
      userId: session.user.id,
      lga: data.lga,
      town: data.town,
      street: data.street ?? null,
      phoneNumber: data.phoneNumber ?? null,
      label: data.label ?? "Home",
      state: "Oyo",
      isDefault: !existing, // first address becomes default
    },
  });

  return true;
}

export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.address.updateMany({
    where: { userId: session.user.id },
    data: { isDefault: false },
  });

  await db.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}

export async function getDefaultAddress() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });
}