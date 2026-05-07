"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  X,
  Navigation,
  Search,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Phone,
  Pencil,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { useDeliveryAddress } from "@/context/DeliveryAddressContext";
import { Modal } from "@/components/ui/modal";
import { getDefaultAddress } from "@/actions/address";
import { useTheme } from "@/providers/theme-provider";

// ── Coverage zone ─────────────────────────────────────────────────────────────
// We only deliver within ~20km of Oyo Town centre.
const OYO_TOWN_CENTER = { lat: 7.8489, lng: 3.9319 };
const COVERAGE_RADIUS_KM = 20;

// Autocomplete bounding box — biases results to the Oyo Town area
const OYO_BOUNDS = {
  north: 8.05,
  south: 7.65,
  east: 4.18,
  west: 3.70,
};

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function isInCoverage(coords: { lat: number; lng: number }): boolean {
  return haversineKm(OYO_TOWN_CENTER, coords) <= COVERAGE_RADIUS_KM;
}

// ── Google Maps config ────────────────────────────────────────────────────────
const LIBRARIES: Libraries = ["places"];
const MAP_STYLE = { width: "100%", height: "220px" };
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  ],
};

// ── Types ─────────────────────────────────────────────────────────────────────
type View = "existing" | "picker" | "signup-prompt";

type GeocodedAddress = {
  formattedAddress: string;
  street: string;
  town: string;
  lga: string;
  state: string;
};

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

// ── Geocoder result parser ────────────────────────────────────────────────────
function parseGeocoderResult(result: google.maps.GeocoderResult): GeocodedAddress {
  const c = result.address_components;
  const get = (type: string) =>
    c.find((comp) => comp.types.includes(type))?.long_name ?? "";

  const street = [get("street_number"), get("route")].filter(Boolean).join(" ");
  const town =
    get("sublocality_level_1") ||
    get("sublocality") ||
    get("neighborhood") ||
    get("locality");
  const lga = get("administrative_area_level_2") || get("locality");
  const state = get("administrative_area_level_1");

  return { formattedAddress: result.formatted_address, street, town, lga, state };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function LocationPickerModal({ open, onClose, initialGPS = false }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setPendingAddress } = useDeliveryAddress();
  const { theme } = useTheme();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("picker");
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // ── Map ───────────────────────────────────────────────────────────────────
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(OYO_TOWN_CENTER);
  const [geocoded, setGeocoded] = useState<GeocodedAddress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [outOfZone, setOutOfZone] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [phoneNumber, setPhoneNumber] = useState("");
  const [label, setLabel] = useState("");

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Init geocoder
  useEffect(() => {
    if (isLoaded && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Auto GPS if launched from banner
  useEffect(() => {
    if (open && initialGPS && isLoaded) requestGPS();
  }, [open, initialGPS, isLoaded]);

  // Load saved address for logged-in users
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

  // ── Coverage check + geocode ──────────────────────────────────────────────
  const applyCoords = useCallback(
    (pos: { lat: number; lng: number }) => {
      setCoords(pos);

      if (!isInCoverage(pos)) {
        setOutOfZone(true);
        setGeocoded(null);
        setShowDetails(false);
        return;
      }

      setOutOfZone(false);
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setGeocoded(parseGeocoderResult(results[0]));
          setShowDetails(true);
        }
      });
    },
    []
  );

  // ── GPS ───────────────────────────────────────────────────────────────────
  function requestGPS() {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    setOutOfZone(false);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const pos = { lat: latitude, lng: longitude };
        setMapCenter(pos);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(16);
        applyCoords(pos);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Search for your area below."
            : "Couldn't get your location. Please search below."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // ── Map interactions ──────────────────────────────────────────────────────
  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return;
    applyCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  function handleMarkerDrag(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return;
    applyCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  // ── Places Autocomplete ───────────────────────────────────────────────────
  function handlePlaceChanged() {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setMapCenter(pos);
    mapRef.current?.panTo(pos);
    mapRef.current?.setZoom(16);

    if (place.address_components && place.formatted_address) {
      const parsed = parseGeocoderResult({
        address_components: place.address_components,
        formatted_address: place.formatted_address,
      } as google.maps.GeocoderResult);

      setCoords(pos);
      if (!isInCoverage(pos)) {
        setOutOfZone(true);
        setGeocoded(null);
        setShowDetails(false);
      } else {
        setOutOfZone(false);
        setGeocoded(parsed);
        setShowDetails(true);
      }
    } else {
      applyCoords(pos);
    }
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  function handleConfirm() {
    if (!geocoded || !coords || outOfZone) return;
    setPendingAddress({
      lga: geocoded.lga || "Oyo",
      town: geocoded.town || geocoded.formattedAddress,
      street: geocoded.street || undefined,
      phoneNumber: phoneNumber || undefined,
      label: label || undefined,
      latitude: coords.lat,
      longitude: coords.lng,
      formattedAddress: geocoded.formattedAddress,
    });
    if (!session?.user) {
      setView("signup-prompt");
    } else {
      handleClose();
    }
  }

  // ── Close / reset ─────────────────────────────────────────────────────────
  function handleClose() {
    setView("picker");
    setSavedAddress(null);
    setCoords(null);
    setGeocoded(null);
    setShowDetails(false);
    setGpsError(null);
    setGpsLoading(false);
    setOutOfZone(false);
    setPhoneNumber("");
    setLabel("");
    onClose();
  }

  // ── Shared input focus style helpers ──────────────────────────────────────
  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = theme.primary;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = theme.primaryBorder;
    e.currentTarget.style.boxShadow = "none";
  };

  const modalClass = "p-0 overflow-hidden bg-white dark:bg-gray-900";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingAddress) {
    return (
      <Modal showModal={open} setShowModal={(v) => !v && handleClose()} onClose={handleClose} className={modalClass}>
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <Loader2 size={22} className="animate-spin" style={{ color: theme.primary }} />
          <p className="text-sm text-gray-500">Loading your address…</p>
        </div>
      </Modal>
    );
  }

  // ── Existing address ──────────────────────────────────────────────────────
  if (view === "existing" && savedAddress) {
    return (
      <Modal showModal={open} setShowModal={(v) => !v && handleClose()} onClose={handleClose} className={modalClass}>
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: theme.primaryBorder }}
        >
          <h2 className="font-semibold text-gray-800 text-base">Delivery address</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 space-y-2.5"
            style={{ border: `1px solid ${theme.primaryBorder}`, backgroundColor: theme.primaryLight }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <MapPin size={15} style={{ color: theme.primary }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.primary }}>
                  {savedAddress.label ?? "Home"}
                </span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: theme.primaryText, backgroundColor: `${theme.primary}20` }}
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

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: theme.primary, color: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
          >
            <CheckCircle2 size={16} />
            Deliver here
          </motion.button>

          <button
            onClick={() => setView("picker")}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ border: `1px solid ${theme.primaryBorder}`, color: theme.primaryText }}
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
      <Modal showModal={open} setShowModal={(v) => !v && handleClose()} onClose={handleClose} className={modalClass}>
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
                {geocoded?.town ?? "your location"}
              </span>{" "}
              as your delivery address.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { handleClose(); router.push("/auth/register"); }}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ backgroundColor: theme.primary, color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
            >
              Create account
            </motion.button>
            <button
              onClick={handleClose}
              className="w-full py-2.5 text-sm transition-colors"
              style={{ color: theme.primaryText }}
            >
              Continue without saving
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Picker (Google Maps) ──────────────────────────────────────────────────
  return (
    <Modal
      showModal={open}
      setShowModal={(v) => !v && handleClose()}
      onClose={handleClose}
      className={modalClass}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: theme.primaryBorder }}
      >
        <div className="flex items-center gap-2">
          {savedAddress && (
            <button
              onClick={() => setView("existing")}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="font-semibold text-gray-800 text-base leading-tight">
              Set delivery location
            </h2>
            <p className="text-xs text-gray-400 leading-tight">
              Oyo Town & surroundings only
            </p>
          </div>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[80vh]">

        {/* Controls */}
        <div className="px-5 pt-4 pb-3 space-y-2.5">

          {/* GPS button */}
          <motion.button
            onClick={requestGPS}
            disabled={gpsLoading || !isLoaded}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all disabled:opacity-60"
            style={{ borderColor: theme.primaryBorder, backgroundColor: `${theme.primary}08` }}
          >
            {gpsLoading ? (
              <Loader2 size={15} className="animate-spin shrink-0" style={{ color: theme.primary }} />
            ) : (
              <Navigation size={15} className="shrink-0" style={{ color: theme.primary }} />
            )}
            <span className="text-sm font-medium" style={{ color: theme.primaryText }}>
              {gpsLoading ? "Getting your location…" : "Use my current location"}
            </span>
          </motion.button>

          {/* GPS error */}
          {gpsError && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Search input */}
          {isLoaded ? (
            <div className="relative">
              <Autocomplete
                onLoad={(a) => { autocompleteRef.current = a; }}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  componentRestrictions: { country: "ng" },
                  bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(OYO_BOUNDS.south, OYO_BOUNDS.west),
                    new google.maps.LatLng(OYO_BOUNDS.north, OYO_BOUNDS.east)
                  ),
                  strictBounds: false, // bias results to Oyo area but don't hard-block typing
                  types: ["geocode", "establishment"],
                }}
              >
                <input
                  placeholder="Search area, street or landmark in Oyo…"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none pl-9 bg-transparent transition-all"
                  style={{ borderColor: theme.primaryBorder }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Autocomplete>
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div
              className="w-full border rounded-xl h-10 bg-gray-50 animate-pulse"
              style={{ borderColor: theme.primaryBorder }}
            />
          )}
        </div>

        {/* Map */}
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={MAP_STYLE}
            center={mapCenter}
            zoom={coords ? 16 : 13}
            onLoad={(map) => { mapRef.current = map; }}
            onClick={handleMapClick}
            options={MAP_OPTIONS}
          >
            {coords && (
              <Marker
                position={coords}
                draggable
                onDragEnd={handleMarkerDrag}
                animation={window.google.maps.Animation.DROP}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full bg-gray-100 animate-pulse" style={{ height: 220 }}>
            <div className="flex items-center justify-center h-full gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs">Loading map…</span>
            </div>
          </div>
        )}

        {/* Tap hint */}
        {!coords && isLoaded && (
          <p className="text-center text-xs text-gray-400 py-2">
            Tap the map or search to set your pin
          </p>
        )}

        {/* ── Out of coverage warning ── */}
        {outOfZone && coords && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-5 mt-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
          >
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">Outside our delivery zone</p>
              <p className="text-xs text-red-500 mt-0.5">
                We currently only deliver within Oyo Town and nearby areas. Move the pin closer to Oyo Town.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Address details + confirm (only when in zone) ── */}
        {showDetails && geocoded && !outOfZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pb-6 pt-3 space-y-4"
          >
            {/* Geocoded summary */}
            <div className="rounded-xl px-4 py-3 space-y-1" style={{ backgroundColor: theme.primaryLight }}>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: theme.primary }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {geocoded.town || geocoded.lga || "Oyo Town"}
                  </p>
                  {(geocoded.lga || geocoded.state) && (
                    <p className="text-xs text-gray-500">
                      {[geocoded.lga, geocoded.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {geocoded.street && (
                    <p className="text-xs text-gray-500 truncate">{geocoded.street}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 pl-5">Drag the pin to fine-tune your location</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Phone number (optional)
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 08012345678"
                  type="tel"
                  inputMode="numeric"
                  className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-transparent transition-all"
                  style={{ borderColor: theme.primaryBorder }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Label chips */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Label (optional)
              </label>
              <div className="flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLabel(label === l ? "" : l)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      borderColor: label === l ? theme.primary : theme.primaryBorder,
                      backgroundColor: label === l ? `${theme.primary}15` : "transparent",
                      color: label === l ? theme.primaryText : "#6B7280",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: theme.primary, color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary; }}
            >
              <CheckCircle2 size={16} />
              Use this location
            </motion.button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}