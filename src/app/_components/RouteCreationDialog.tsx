"use client";

import React from "react";
import { MapSearchInputs } from "./MapSearchInputs";
import { MapControls } from "./MapControls";
import { BaseDialog } from "./BaseDialog";

interface RouteCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoaded: boolean;
  mapRef: React.RefObject<google.maps.Map | null>;
  modal?: boolean;
}

export function RouteCreationDialog({
  isOpen,
  onClose,
  isLoaded,
  mapRef,
  modal = false,
}: RouteCreationDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Маршрут"
      modal={modal}
      dialogContentClassName="z-[100]"
    >
      <div className="flex flex-col gap-4 p-1">
        <MapSearchInputs isLoaded={isLoaded} mapRef={mapRef} />
        <MapControls />
      </div>
    </BaseDialog>
  );
}
