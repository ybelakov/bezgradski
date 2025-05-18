"use client";

import Image from "next/image";
import { MapSearchInputs } from "~/app/_components/MapSearchInputs";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { env } from "~/env";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "~/store/searchStore";
import { Button } from "~/components/ui/button";
import { BaseDialog } from "~/app/_components/BaseDialog";

const libraries: Libraries = ["places", "geometry"];

export default function SearchDrivePage() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { searchOrigin, searchDestination, searchDate, resetSearchCriteria } =
    useSearchStore();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-route-display",
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_JAVASCRIPT_API_KEY,
    libraries,
  });

  useEffect(() => {
    return () => {
      resetSearchCriteria();
    };
  }, [resetSearchCriteria]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchOrigin) {
      params.append("originLat", searchOrigin.lat.toString());
      params.append("originLng", searchOrigin.lng.toString());
      params.append("originAddress", searchOrigin.address);
    }
    if (searchDestination) {
      params.append("destinationLat", searchDestination.lat.toString());
      params.append("destinationLng", searchDestination.lng.toString());
      params.append("destinationAddress", searchDestination.address);
    }
    if (searchDate) {
      params.append("date", searchDate);
    }

    router.push(`/search?${params.toString()}`);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading map inputs...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Desktop view */}
      <div className="fixed inset-0 top-12 z-40 pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/background-bg.jpg"
            alt="Background"
            fill
            priority
            quality={100}
            className="object-cover"
            style={{ filter: "blur(8px)" }}
          />
        </div>

        <BaseDialog
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          title="Намери Транспорт"
          modal={false}
          showCustomXIcon={false}
          dialogContentClassName="flex-col sm:max-w-md lg:flex"
        >
          <div className="flex flex-col gap-4 p-6 pb-2">
            <MapSearchInputs
              isLoaded={isLoaded}
              mapRef={mapRef}
              purpose="search"
            />
            {/* TODO: Add other search fields like date, passengers */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSearch}
                disabled={!searchOrigin || !searchDestination || !searchDate}
                className="w-full"
              >
                Търси
              </Button>
              <Button
                variant="link"
                onClick={() => router.push("/all")}
                className="m-0 w-full cursor-pointer items-center justify-center p-0"
              >
                Виж всички
              </Button>
            </div>
          </div>
        </BaseDialog>
      </div>
    </div>
  );
}
