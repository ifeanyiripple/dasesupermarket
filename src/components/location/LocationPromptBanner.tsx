"use client";

import { useEffect, useState } from "react";
import { MapPin, X, Navigation, LocateFixed } from "lucide-react";
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
    if (pendingAddress || activeAddress) return;
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
        // Backdrop
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm rounded-2xl shadow-2xl border p-6"
            style={{ backgroundColor: "white", borderColor: theme.primaryBorder }}
          >
            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}18` }}
              >
                <LocateFixed size={28} style={{ color: theme.primary }} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h2 className="text-base font-bold text-gray-800 leading-snug">
                Where should we deliver?
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Set your delivery location so we can show you available items and match you with the closest riders.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleGPS}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: theme.primary, color: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
              >
                <Navigation size={14} />
                Use my current location
              </button>
              <button
                onClick={handleManual}
                className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: theme.primaryBorder, color: theme.primaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Select area manually
              </button>
              <button
                onClick={dismiss}
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}