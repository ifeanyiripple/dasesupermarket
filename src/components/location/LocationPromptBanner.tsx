"use client";

import { useEffect, useState } from "react";
import { MapPin, X, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { useTheme } from "@/providers/theme-provider";

const BANNER_KEY = "oymart_location_banner_dismissed";

type Props = {
  onRequestGPS: () => void;
  onPickManually: () => void;
};

export function LocationPromptBanner({ onRequestGPS, onPickManually }: Props) {
  const [visible, setVisible] = useState(false);
  const { pendingAddress, activeAddress } = useDeliveryAddress();
  const { theme } = useTheme();

  useEffect(() => {
    // Don't show if address already set
    if (pendingAddress || activeAddress) return;
    // Don't show again this session
    if (sessionStorage.getItem(BANNER_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [pendingAddress, activeAddress]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(BANNER_KEY, "1");
  }

  function handleGPS() {
    dismiss();
    onRequestGPS();
  }

  function handleManual() {
    dismiss();
    onPickManually();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div
            className="relative rounded-2xl shadow-2xl border p-4"
            style={{ backgroundColor: "white", borderColor: theme.primaryBorder }}
          >
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>

            <div className="flex items-start gap-3 pr-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <MapPin size={16} style={{ color: theme.primary }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  Enable location for faster delivery
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  We'll match you with the closest riders.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3.5">
              <button
                onClick={handleGPS}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                style={{ backgroundColor: theme.primary, color: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
              >
                <Navigation size={13} />
                Use my location
              </button>
              <button
                onClick={handleManual}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: theme.primaryBorder, color: theme.primaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Select area
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}