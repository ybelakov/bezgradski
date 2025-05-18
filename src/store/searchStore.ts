import { create } from "zustand";

interface LocationDetails {
  lat: number;
  lng: number;
  address: string;
}

interface SearchState {
  searchOrigin: LocationDetails | null;
  searchDestination: LocationDetails | null;
  searchDate: string | null;
  setSearchOrigin: (origin: LocationDetails | null) => void;
  setSearchDestination: (destination: LocationDetails | null) => void;
  setSearchDate: (date: string | null) => void;
  resetSearchCriteria: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchOrigin: null,
  searchDestination: null,
  searchDate: null,
  searchTime: null,
  setSearchOrigin: (origin) => set({ searchOrigin: origin }),
  setSearchDestination: (destination) =>
    set({ searchDestination: destination }),
  setSearchDate: (date) => set({ searchDate: date }),
  resetSearchCriteria: () =>
    set({
      searchOrigin: null,
      searchDestination: null,
      searchDate: null,
    }),
}));
