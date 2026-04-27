"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, X, ChevronLeft, Phone, Pencil, CheckCircle2, Loader2 } from "lucide-react";
import { OYO_LOCATIONS } from "@/data/oyo-locations";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { Modal } from "@/components/ui/modal";
import { getDefaultAddress } from "@/actions/address";
import { useTheme } from "@/providers/theme-provider";

type Step = "lga" | "town" | "detail";
type View = "existing" | "picker" | "signup-prompt";

type SavedAddress = {
  id: string;
  town: string;
  lga: string;
  street: string | null;
  phoneNumber: string | null;
  label: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

// Helper to get dynamic modal class based on theme
const getModalClass = (primaryLight: string) =>
  `p-0 overflow-hidden bg-[${primaryLight}]/10! dark:!bg-[${primaryLight}]/15 backdrop-blur-xl border border-[${primaryLight}]/20`;

export function LocationPickerModal({ open, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setPendingAddress } = useDeliveryAddress();
  const { theme } = useTheme();

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("picker");
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // ── Picker state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("lga");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [street, setStreet] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const towns = OYO_LOCATIONS.find((l) => l.lga === selectedLga)?.towns ?? [];

  // ── On open: check DB for existing address if logged in ───────────────────
  useEffect(() => {
    if (!open) return;

    if (!session?.user) {
      setView("picker");
      return;
    }

    setLoadingAddress(true);
    getDefaultAddress().then((addr) => {
      if (addr) {
        setSavedAddress(addr as SavedAddress);
        setView("existing");
      } else {
        setView("picker");
      }
      setLoadingAddress(false);
    });
  }, [open, session?.user]);

  function handleClose() {
    setView("picker");
    setSavedAddress(null);
    setStep("lga");
    setSelectedLga("");
    setSelectedTown("");
    setStreet("");
    setPhoneNumber("");
    onClose();
  }

  function handleConfirm() {
    setPendingAddress({ lga: selectedLga, town: selectedTown, street, phoneNumber });
    if (!session?.user) {
      setView("signup-prompt");
    } else {
      handleClose();
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingAddress) {
    return (
      <Modal 
        showModal={open} 
        setShowModal={(v) => !v && handleClose()} 
        onClose={handleClose} 
        className={getModalClass(theme.primaryLight)}
      >
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <Loader2 size={22} className="animate-spin" style={{ color: theme.primary }} />
          <p className="text-sm text-gray-500">Loading your address...</p>
        </div>
      </Modal>
    );
  }

  // ── Existing address confirmation ─────────────────────────────────────────
  if (view === "existing" && savedAddress) {
    return (
      <Modal 
        showModal={open} 
        setShowModal={(v) => !v && handleClose()} 
        onClose={handleClose} 
        className={getModalClass(theme.primaryLight)}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.primaryBorder }}>
          <h2 className="font-semibold text-gray-800 text-base">Delivery address</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors" 
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Saved address card */}
          <motion.div 
            className="rounded-2xl p-4 space-y-2.5 transition-all duration-200"
            style={{ 
              border: `1px solid ${theme.primaryBorder}`,
              backgroundColor: theme.primaryLight,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <MapPin size={15} style={{ color: theme.primary }} />
                </div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.primary }}
                >
                  {savedAddress.label ?? "Home"}
                </span>
              </div>
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  color: theme.primaryText,
                  backgroundColor: `${theme.primary}20`
                }}
              >
                Default
              </span>
            </div>

            <div className="pl-10 space-y-0.5">
              <p className="text-sm font-semibold text-gray-800">
                {savedAddress.town}, {savedAddress.lga} LGA
              </p>
              <p className="text-xs text-gray-500">Oyo State, Nigeria</p>
              {savedAddress.street && (
                <p className="text-xs text-gray-600 pt-0.5">{savedAddress.street}</p>
              )}
              {savedAddress.phoneNumber && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Phone size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{savedAddress.phoneNumber}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
            style={{ 
              backgroundColor: theme.primary,
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary;
            }}
          >
            <CheckCircle2 size={16} />
            Deliver here
          </motion.button>

          <button
            onClick={() => setView("picker")}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{ 
              border: `1px solid ${theme.primaryBorder}`,
              color: theme.primaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Pencil size={13} />
            Change address
          </button>
        </div>
      </Modal>
    );
  }

  // ── Signup prompt ─────────────────────────────────────────────────────────
  if (view === "signup-prompt") {
    return (
      <Modal 
        showModal={open} 
        setShowModal={(v) => !v && handleClose()} 
        onClose={handleClose} 
        className={getModalClass(theme.primaryLight)}
      >
        <div className="p-6 text-center space-y-4">
          <motion.div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: `${theme.primary}20` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <MapPin size={22} style={{ color: theme.primary }} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="font-bold text-lg text-gray-800">Save your location</h2>
            <p className="text-sm text-gray-500">
              Create a free account to save{" "}
              <span className="font-semibold" style={{ color: theme.primaryText }}>
                {selectedTown}, {selectedLga}
              </span>{" "}
              as your delivery address and never type it again.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { handleClose(); router.push("/auth/register"); }}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ 
                backgroundColor: theme.primary,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
              }}
            >
              Create account
            </motion.button>
            <button
              onClick={handleClose}
              className="w-full py-2.5 text-sm transition-colors"
              style={{ color: theme.primaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.primaryText;
              }}
            >
              Continue without saving
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Picker ────────────────────────────────────────────────────────────────
  return (
    <Modal
      showModal={open}
      setShowModal={(v) => !v && handleClose()}
      onClose={handleClose}
      className={getModalClass(theme.primaryLight)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.primaryBorder }}>
        <div className="flex items-center gap-2">
          {(step !== "lga" || savedAddress) && (
            <button
              onClick={() => {
                if (step === "town") return setStep("lga");
                if (step === "detail") return setStep("town");
                setView("existing");
              }}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="font-semibold text-gray-800 text-base">
            {step === "lga" && "Select Your Location"}
            {step === "town" && `Towns in ${selectedLga}`}
            {step === "detail" && "Add details (optional)"}
          </h2>
        </div>
        <button 
          onClick={handleClose} 
          className="text-gray-400 hover:text-gray-600 transition-colors" 
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[60vh] overflow-y-auto">
        {step === "lga" && (
          <ul className="divide-y" style={{ borderColor: theme.primaryBorder }}>
            {OYO_LOCATIONS.map((loc, idx) => (
              <motion.li 
                key={loc.lga}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <button
                  onClick={() => { setSelectedLga(loc.lga); setStep("town"); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                >
                  <span 
                    className="text-sm font-medium transition-colors group-hover:font-semibold"
                    style={{ color: "#4B5563" }}
                  >
                    {loc.lga}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-[var(--theme-primary)] transition-colors" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}

        {step === "town" && (
          <ul className="divide-y" style={{ borderColor: theme.primaryBorder }}>
            {towns.map((town, idx) => (
              <motion.li 
                key={town}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <button
                  onClick={() => { setSelectedTown(town); setStep("detail"); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                >
                  <span 
                    className="text-sm font-medium transition-colors group-hover:font-semibold"
                    style={{ color: "#4B5563" }}
                  >
                    {town}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-[var(--theme-primary)] transition-colors" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}

        {step === "detail" && (
          <motion.div 
            className="p-5 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div 
              className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <MapPin size={15} style={{ color: theme.primary }} className="shrink-0" />
              <p className="text-sm font-medium" style={{ color: theme.primaryText }}>
                {selectedTown}, {selectedLga} LGA, Oyo State
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Home address</label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 12 Awolowo Road"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 bg-transparent"
                  style={{ borderColor: theme.primaryBorder }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.primaryBorder;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Phone number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08012345678"
                    type="tel"
                    inputMode="numeric"
                    className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all duration-200 bg-transparent"
                    style={{ borderColor: theme.primaryBorder }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.primaryBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ 
                backgroundColor: theme.primary,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
              }}
            >
              Use this location
            </motion.button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}