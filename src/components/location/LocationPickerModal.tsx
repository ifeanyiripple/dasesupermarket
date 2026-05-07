"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, X, Navigation, CheckCircle2, Loader2,
  Phone, Pencil, AlertCircle, ChevronLeft,
  ChevronDown, Home, Briefcase, MoreHorizontal,
} from "lucide-react";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { getDefaultAddress } from "@/actions/address";
import { useTheme } from "@/providers/theme-provider";

// ── Oyo State delivery areas (within ~20 km of Oyo Town) ──────────────────────
const DELIVERY_AREAS: Record<string, string[]> = {
  "Atiba": [
    "Oyo Town", "Ojongbodu", "Awe Road", "Kosobo", "Akinmorin",
    "Isale-Oyo", "Okelewo", "Oja-Oba", "Tashan Oyo",
  ],
  "Oyo East": [
    "Ajawere", "Igbope", "Kisi", "Iseyin Road", "Ipapo", "Igbo-Idi",
  ],
  "Oyo West": [
    "Owode", "Jobele", "Igbo-Ora", "Akinola", "Alakia",
  ],
  "Afijio": [
    "Ilora", "Alapata", "Oke-Mesi", "Awe", "Idere",
  ],
  "Lagelu": [
    "Iyana-Offa", "Lagun", "Olorunda", "Ajara", "Aba-Eku",
  ],
  "Ona-Ara": [
    "Akanran", "Ido", "Bode Osi", "Awotan",
  ],
};

const ALL_LGAS = Object.keys(DELIVERY_AREAS);
const LABEL_OPTIONS = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Other", icon: MoreHorizontal },
];

// ── Nominatim reverse geocode (free, no API key) ──────────────────────────────
type NominatimAddress = {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  road?: string;
  house_number?: string;
  display_name?: string;
};

async function reverseGeocode(lat: number, lon: number): Promise<NominatimAddress | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.address ?? null;
  } catch {
    return null;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
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
  initialGPS?: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function LocationPickerModal({ open, onClose, initialGPS = false }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setPendingAddress } = useDeliveryAddress();
  const { theme } = useTheme();

  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("picker");
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // ── GPS ───────────────────────────────────────────────────────────────────
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [selectedLGA, setSelectedLGA] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [customTown, setCustomTown] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [label, setLabel] = useState("");

  const towns = selectedLGA ? DELIVERY_AREAS[selectedLGA] ?? [] : [];
  const effectiveTown = selectedTown === "__custom__" ? customTown : selectedTown;
  const canConfirm = !!selectedLGA && !!effectiveTown.trim();

  // ── Load existing address on open ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (!session?.user) { setView("picker"); return; }
    setLoadingAddress(true);
    getDefaultAddress().then((addr) => {
      if (addr) { setSavedAddress(addr as SavedAddress); setView("existing"); }
      else setView("picker");
      setLoadingAddress(false);
    });
  }, [open, session?.user]);

  // ── GPS on mount if initialGPS ────────────────────────────────────────────
  useEffect(() => {
    if (open && initialGPS) requestGPS();
  }, [open, initialGPS]);

  // ── GPS handler ───────────────────────────────────────────────────────────
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        const addr = await reverseGeocode(latitude, longitude);
        if (addr) {
          // Try to match LGA from Nominatim result
          const rawLGA =
            addr.county || addr.state_district || addr.city || "";
          const matchedLGA =
            ALL_LGAS.find((l) =>
              rawLGA.toLowerCase().includes(l.toLowerCase())
            ) ?? "";

          const rawTown =
            addr.suburb ||
            addr.neighbourhood ||
            addr.quarter ||
            addr.village ||
            addr.town ||
            addr.city ||
            "";

          if (matchedLGA) {
            setSelectedLGA(matchedLGA);
            const matchedTown = DELIVERY_AREAS[matchedLGA]?.find((t) =>
              rawTown.toLowerCase().includes(t.toLowerCase())
            );
            if (matchedTown) {
              setSelectedTown(matchedTown);
            } else if (rawTown) {
              setSelectedTown("__custom__");
              setCustomTown(rawTown);
            }
          } else if (rawTown) {
            // Can't match LGA — prefill custom town so user just picks LGA
            setSelectedTown("__custom__");
            setCustomTown(rawTown);
          }

          const road = [addr.house_number, addr.road].filter(Boolean).join(" ");
          if (road) setStreet(road);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please fill in your address below."
            : "Couldn't detect your location. Please fill in your address below."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ── Confirm ───────────────────────────────────────────────────────────────
  function handleConfirm() {
    if (!canConfirm) return;
    setPendingAddress({
      lga: selectedLGA,
      town: effectiveTown,
      street: street || undefined,
      phoneNumber: phoneNumber || undefined,
      label: label || undefined,
      latitude: coords?.lat,
      longitude: coords?.lng,
      formattedAddress: [street, effectiveTown, `${selectedLGA} LGA`]
        .filter(Boolean)
        .join(", "),
    });
    if (!session?.user) setView("signup-prompt");
    else handleClose();
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleClose() {
    setView("picker");
    setSavedAddress(null);
    setCoords(null);
    setGpsError(null);
    setGpsLoading(false);
    setSelectedLGA("");
    setSelectedTown("");
    setCustomTown("");
    setStreet("");
    setLandmark("");
    setPhoneNumber("");
    setLabel("");
    onClose();
  }

  // ── Input style helpers ───────────────────────────────────────────────────
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = theme.primary;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}22`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = theme.primaryBorder;
    e.currentTarget.style.boxShadow = "none";
  };

  // ── Select wrapper ────────────────────────────────────────────────────────
  function SelectField({
    value,
    onChange,
    placeholder,
    children,
    disabled,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    children: React.ReactNode;
    disabled?: boolean;
  }) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full border rounded-xl px-4 py-3 text-sm outline-none appearance-none bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: theme.primaryBorder, color: value ? "#1f2937" : "#9ca3af" }}
          onFocus={focusStyle}
          onBlur={blurStyle}
        >
          <option value="" disabled>{placeholder}</option>
          {children}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    );
  }

  // ── Full-screen shell ─────────────────────────────────────────────────────
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="location-picker"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="relative w-full sm:max-w-lg bg-white flex flex-col"
          style={{
            height: "100dvh",
            // On desktop/sm+, behave as a tall modal
            borderRadius: "0px",
          }}
        >
          {/* On sm+ screens, round the top */}
          <style>{`
            @media (min-width: 640px) {
              .location-picker-card { border-radius: 1.5rem; max-height: 92dvh; }
            }
          `}</style>
          <div className="location-picker-card flex flex-col h-full">

            {/* ── LOADING ────────────────────────────────────────────── */}
            {loadingAddress && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <Loader2 size={22} className="animate-spin" style={{ color: theme.primary }} />
                <p className="text-sm text-gray-500">Loading your address…</p>
              </div>
            )}

            {/* ── EXISTING ADDRESS ───────────────────────────────────── */}
            {!loadingAddress && view === "existing" && savedAddress && (
              <>
                <Header
                  title="Delivery address"
                  onClose={handleClose}
                  theme={theme}
                />
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 space-y-3"
                    style={{
                      border: `1.5px solid ${theme.primaryBorder}`,
                      backgroundColor: theme.primaryLight,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${theme.primary}22` }}
                        >
                          <MapPin size={14} style={{ color: theme.primary }} />
                        </div>
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: theme.primary }}
                        >
                          {savedAddress.label ?? "Home"}
                        </span>
                      </div>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ color: theme.primaryText, backgroundColor: `${theme.primary}18` }}
                      >
                        Default
                      </span>
                    </div>
                    <div className="pl-10 space-y-0.5">
                      <p className="text-sm font-bold text-gray-800">
                        {savedAddress.town}, {savedAddress.lga} LGA
                      </p>
                      <p className="text-xs text-gray-500">Oyo State, Nigeria</p>
                      {savedAddress.street && (
                        <p className="text-xs text-gray-600 mt-0.5">{savedAddress.street}</p>
                      )}
                      {savedAddress.phoneNumber && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Phone size={11} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{savedAddress.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    style={{ backgroundColor: theme.primary, color: "white" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
                  >
                    <CheckCircle2 size={16} />
                    Deliver here
                  </button>

                  <button
                    onClick={() => setView("picker")}
                    className="w-full py-3 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2"
                    style={{ borderColor: theme.primaryBorder, color: theme.primaryText }}
                  >
                    <Pencil size={13} />
                    Change address
                  </button>
                </div>
              </>
            )}

            {/* ── SIGNUP PROMPT ──────────────────────────────────────── */}
            {!loadingAddress && view === "signup-prompt" && (
              <>
                <Header title="" onClose={handleClose} theme={theme} showClose />
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-5">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.primary}18` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <MapPin size={26} style={{ color: theme.primary }} />
                  </motion.div>
                  <div className="space-y-1.5">
                    <h2 className="font-bold text-xl text-gray-800">Save your location</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Create a free account to permanently save{" "}
                      <span className="font-semibold" style={{ color: theme.primaryText }}>
                        {effectiveTown || "your location"}
                      </span>{" "}
                      as your delivery address.
                    </p>
                  </div>
                  <div className="w-full space-y-2.5 pt-2">
                    <button
                      onClick={() => { handleClose(); router.push("/auth/register"); }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm transition-colors"
                      style={{ backgroundColor: theme.primary, color: "white" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
                    >
                      Create free account
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 text-sm transition-colors"
                      style={{ color: theme.primaryText }}
                    >
                      Continue without saving
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── PICKER ─────────────────────────────────────────────── */}
            {!loadingAddress && view === "picker" && (
              <>
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                  style={{ borderColor: theme.primaryBorder }}
                >
                  <div className="flex items-center gap-2">
                    {savedAddress && (
                      <button
                        onClick={() => setView("existing")}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 -ml-1"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div>
                      <h2 className="font-bold text-gray-800 text-base leading-tight">
                        Set delivery address
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Oyo State delivery only
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

                  {/* GPS button */}
                  <button
                    onClick={requestGPS}
                    disabled={gpsLoading}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all disabled:opacity-60"
                    style={{
                      borderColor: theme.primary,
                      backgroundColor: `${theme.primary}08`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${theme.primary}18` }}
                    >
                      {gpsLoading ? (
                        <Loader2 size={15} className="animate-spin" style={{ color: theme.primary }} />
                      ) : (
                        <Navigation size={15} style={{ color: theme.primary }} />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: theme.primaryText }}>
                        {gpsLoading ? "Detecting your location…" : "Auto-detect my location"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Uses GPS to pre-fill your address
                      </p>
                    </div>
                  </button>

                  {gpsError && (
                    <div className="flex items-start gap-2.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{gpsError}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium">or fill in manually</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* LGA */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Local Government Area (LGA) <span className="text-red-400">*</span>
                    </label>
                    <SelectField
                      value={selectedLGA}
                      onChange={(v) => {
                        setSelectedLGA(v);
                        setSelectedTown("");
                        setCustomTown("");
                      }}
                      placeholder="Select your LGA…"
                    >
                      {ALL_LGAS.map((lga) => (
                        <option key={lga} value={lga}>{lga} LGA</option>
                      ))}
                    </SelectField>
                  </div>

                  {/* Town / Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Town / Area <span className="text-red-400">*</span>
                    </label>
                    <SelectField
                      value={selectedTown}
                      onChange={setSelectedTown}
                      placeholder={selectedLGA ? "Select your town/area…" : "Select an LGA first"}
                      disabled={!selectedLGA}
                    >
                      {towns.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__custom__">Other (type below)</option>
                    </SelectField>

                    {selectedTown === "__custom__" && (
                      <motion.input
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        value={customTown}
                        onChange={(e) => setCustomTown(e.target.value)}
                        placeholder="Type your town or area name…"
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all mt-2"
                        style={{ borderColor: theme.primaryBorder }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    )}
                  </div>

                  {/* Street */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Street address
                      <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                    </label>
                    <input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 12 Akinola Street"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
                      style={{ borderColor: theme.primaryBorder }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>

                  {/* Landmark */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Closest landmark
                      <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(helps riders find you)</span>
                    </label>
                    <input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Sango Market, opposite GTBank"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
                      style={{ borderColor: theme.primaryBorder }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Phone number
                      <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(for your rider)</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 08012345678"
                        type="tel"
                        inputMode="numeric"
                        className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none bg-transparent transition-all"
                        style={{ borderColor: theme.primaryBorder }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                  </div>

                  {/* Label chips */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Label
                      <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      {LABEL_OPTIONS.map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setLabel(label === value ? "" : value)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all"
                          style={{
                            borderColor: label === value ? theme.primary : theme.primaryBorder,
                            backgroundColor: label === value ? `${theme.primary}14` : "transparent",
                            color: label === value ? theme.primaryText : "#6b7280",
                          }}
                        >
                          <Icon size={12} />
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GPS coordinates badge */}
                  {coords && (
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                      style={{ backgroundColor: `${theme.primary}0f`, color: theme.primaryText }}
                    >
                      <Navigation size={12} />
                      <span className="font-medium">GPS captured:</span>
                      <span className="text-gray-500 font-mono">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </span>
                    </div>
                  )}

                  {/* Confirm */}
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: theme.primary, color: "white" }}
                    onMouseEnter={(e) => {
                      if (canConfirm) e.currentTarget.style.backgroundColor = theme.primaryHover;
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
                  >
                    <CheckCircle2 size={16} />
                    Confirm delivery location
                  </button>

                  {/* Bottom spacer for mobile nav */}
                  <div className="h-6" />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Header helper ─────────────────────────────────────────────────────────────
function Header({
  title,
  onClose,
  theme,
  showClose = true,
}: {
  title: string;
  onClose: () => void;
  theme: any;
  showClose?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b shrink-0"
      style={{ borderColor: theme.primaryBorder }}
    >
      <h2 className="font-bold text-gray-800 text-base">{title}</h2>
      {showClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}