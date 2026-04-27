"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getDefaultAddress } from "@/actions/address";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "oymart_pending_address";

export type PendingAddress = {
  lga: string;
  town: string;
  street?: string;
  phoneNumber?: string;
  label?: string;
};

export type ActiveAddress = {
  town: string;
  lga: string;
  street: string | null;
  phoneNumber: string | null;
  label: string | null;
};

type DeliveryAddressContextType = {
  pendingAddress: PendingAddress | null;
  activeAddress: ActiveAddress | null;
  setPendingAddress: (addr: PendingAddress) => void;
  clearPendingAddress: () => void;
  refreshActiveAddress: () => Promise<void>;
};

const DeliveryAddressContext = createContext<DeliveryAddressContextType | null>(null);

export function DeliveryAddressProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [pendingAddress, setPendingAddressState] = useState<PendingAddress | null>(null);
  const [activeAddress, setActiveAddress] = useState<ActiveAddress | null>(null);

  // Hydrate pending from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPendingAddressState(JSON.parse(raw));
    } catch {}
  }, []);

  // Hydrate active address from DB once session is ready
  const refreshActiveAddress = useCallback(async () => {
    const addr = await getDefaultAddress();
    if (addr) {
      setActiveAddress({
        town: addr.town,
        lga: addr.lga,
        street: addr.street,
        phoneNumber: addr.phoneNumber,
        label: addr.label,
      });
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      refreshActiveAddress();
    } else if (status === "unauthenticated") {
      setActiveAddress(null);
    }
  }, [status, session?.user?.id]);

  const setPendingAddress = useCallback((addr: PendingAddress) => {
    setPendingAddressState(addr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addr));
  }, []);

  const clearPendingAddress = useCallback(() => {
    setPendingAddressState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <DeliveryAddressContext.Provider
      value={{
        pendingAddress,
        activeAddress,
        setPendingAddress,
        clearPendingAddress,
        refreshActiveAddress,
      }}
    >
      {children}
    </DeliveryAddressContext.Provider>
  );
}

export function useDeliveryAddress() {
  const ctx = useContext(DeliveryAddressContext);
  if (!ctx) throw new Error("useDeliveryAddress must be inside DeliveryAddressProvider");
  return ctx;
}