import { create } from "zustand";

interface MapState {
  origin: string | null;
  destination: string | null;
  directions: google.maps.DirectionsResult | null;
  shouldFetchDirections: boolean;
  isSaving: boolean;

  // Actions
  setOrigin: (origin: string | null) => void;
  setDestination: (destination: string | null) => void;
  setDirections: (directions: google.maps.DirectionsResult | null) => void;
  setShouldFetchDirections: (shouldFetch: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  resetDirections: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  origin: null,
  destination: null,
  directions: null,
  shouldFetchDirections: false,
  isSaving: false,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setDirections: (directions) => set({ directions }),
  setShouldFetchDirections: (shouldFetchDirections) =>
    set({ shouldFetchDirections }),
  setIsSaving: (isSaving) => set({ isSaving }),
  resetDirections: () => set({ directions: null }),
}));
