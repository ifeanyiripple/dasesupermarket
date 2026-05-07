"use client";

import { useState } from "react";
import { LocationPromptBanner } from "./LocationPromptBanner";
import { LocationPickerModal } from "./LocationPickerModal";

export function LocationController() {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialGPS, setInitialGPS] = useState(false);

  function openWithGPS() {
    setInitialGPS(true);
    setModalOpen(true);
  }

  function openManual() {
    setInitialGPS(false);
    setModalOpen(true);
  }

  return (
    <>
      <LocationPromptBanner onRequestGPS={openWithGPS} onPickManually={openManual} />
      <LocationPickerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setInitialGPS(false); }}
        initialGPS={initialGPS}
      />
    </>
  );
}