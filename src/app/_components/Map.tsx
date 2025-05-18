import { useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { env } from "~/env";
import { useCallback, useRef, useState } from "react";
import { GoogleMapWithDirections } from "./GoogleMapWithDirections";
import { RouteCreationDialog } from "./RouteCreationDialog";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMapStore } from "~/store/mapStore";
import { api } from "~/trpc/react";
import { ConfirmRouteDialog } from "./ConfirmRouteDialog";
import { useRouter } from "next/navigation";

const libraries: Libraries = ["places", "geometry"];

export function Map() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { origin, destination, directions, isSaving, setIsSaving } =
    useMapStore();
  const { data: session } = useSession();
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-route-display",
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_JAVASCRIPT_API_KEY,
    libraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleDirectionsSuccess = () => {
    setIsModalOpen(false);
  };

  const saveRouteMutation = api.routes.create.useMutation({
    onSuccess: () => {
      toast.success("Маршрутът е записан!");
      setIsSaving(false);
      setIsConfirmModalOpen(false);
      router.push("/drives");
    },
    onError: (error) => {
      toast.error(`Failed to save route: ${error.message}`);
      setIsSaving(false);
    },
  });

  const handleSaveRouteConfirmed = async (
    dateTime: Date,
    _time: string,
    seats: number,
    phoneNumber: string,
  ) => {
    if (!session?.user.id || !origin || !destination || !directions) {
      toast.error("Cannot save route. Missing required information.");
      return;
    }

    setIsSaving(true);
    try {
      await saveRouteMutation.mutateAsync({
        origin,
        destination,
        directions,
        dateTime,
        seats,
        phoneNumber,
      });
    } catch (error: unknown) {
      toast.error(`Failed to save route: ${(error as Error).message}`);
      setIsSaving(false);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <>
      <RouteCreationDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoaded={isLoaded}
        mapRef={mapRef}
      />
      <Button
        className="absolute top-1 right-1"
        onClick={() => {
          if (directions) {
            setIsConfirmModalOpen(true);
          } else {
            setIsModalOpen(true);
          }
        }}
        disabled={!session || (!!directions && isSaving)}
      >
        {directions ? "Публикувай" : "Създай маршрут"}
      </Button>
      {/* Map */}
      <GoogleMapWithDirections
        onMapLoad={onMapLoad}
        onDirectionsSuccess={handleDirectionsSuccess}
      />
      {/* Confirmation Dialog */}
      <ConfirmRouteDialog
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSaveRouteConfirmed}
        isSaving={isSaving}
      />
    </>
  );
}
