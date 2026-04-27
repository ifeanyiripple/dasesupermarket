"use client";

import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { LocationPickerModal } from "@/components/location/LocationPickerModal";

export function DeliverToButton({ mobile = false }: { mobile?: boolean }) {
  const { pendingAddress, activeAddress } = useDeliveryAddress();
  const [open, setOpen] = useState(false);

  const label = pendingAddress?.town ?? activeAddress?.town ?? "Select location";

  if (mobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-[var(--theme-primary)]"
        >
          <span className="font-semibold text-[var(--theme-primary)]">{label}</span>
          <ChevronDown size={11} />
        </button>
        <LocationPickerModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          hidden lg:flex items-center gap-1.5 text-xs  cursor-pointer
          text-[var(--theme-primary)]
          transition-colors duration-200
          border-l border-gray-200 pl-4
        "
      >
        <MapPin size={13} className="text-[var(--theme-primary)]" />
        <span>
          Deliver to <span className="font-semibold  text-[var(--theme-primary)]">{label}</span>
        </span>
        <ChevronDown size={12} />
      </button>
      <LocationPickerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}