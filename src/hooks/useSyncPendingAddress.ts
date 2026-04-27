"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { saveAddressAction } from "@/actions/address";

export function useSyncPendingAddress() {
  const { data: session, status } = useSession();
  const { pendingAddress, clearPendingAddress, refreshActiveAddress } = useDeliveryAddress();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.id) return;
    if (!pendingAddress) return;
    if (hasSynced.current) return;

    hasSynced.current = true;

    saveAddressAction(pendingAddress).then((ok) => {
      if (ok) {
        clearPendingAddress();
        refreshActiveAddress(); // ← update the button label immediately
      } else {
        hasSynced.current = false;
      }
    });
  }, [status, session?.user?.id, pendingAddress]);
}