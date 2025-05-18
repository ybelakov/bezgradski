import { useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { env } from "~/env";
import { useCallback, useRef, useState } from "react";
import { MapControls } from "./MapControls";
import { MapSearchInputs } from "./MapSearchInputs";
import { GoogleMapWithDirections } from "./GoogleMapWithDirections";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMapStore } from "~/store/mapStore";
import { api } from "~/trpc/react";
import { XIcon } from "lucide-react";
import { ConfirmRouteDialog } from "./ConfirmRouteDialog";

const libraries: Libraries = ["places"];

export function Map() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { origin, destination, directions, isSaving, setIsSaving } =
    useMapStore();
  const { data: session } = useSession();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
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
      toast.success("Route saved successfully!");
      setIsSaving(false);
      setIsConfirmModalOpen(false);
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
  ) => {
    if (!session?.user.id || !origin || !destination || !directions) {
      toast.error("Cannot save route. Missing required information.");
      return;
    }

    setIsSaving(true);
    try {
      const directionsData = JSON.parse(JSON.stringify(directions)) as Record<
        string,
        unknown
      >;
      await saveRouteMutation.mutateAsync({
        origin,
        destination,
        directions: directionsData,
        dateTime,
        seats,
      });
    } catch (error: unknown) {
      toast.error(`Failed to save route: ${(error as Error).message}`);
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <>
      <div
        className={cn(
          "absolute top-0 z-[50] h-screen w-screen bg-black/50",
          isModalOpen ? "block" : "hidden",
        )}
      />
      <Dialog open={isModalOpen} modal={false}>
        <DialogContent className="z-[100]" hideXIcon>
          <XIcon
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />
          <DialogTitle className="text-center">Маршрут</DialogTitle>
          <div className="flex flex-col gap-4 p-1">
            <MapSearchInputs isLoaded={isLoaded} mapRef={mapRef} />
            <MapControls />
          </div>
        </DialogContent>
      </Dialog>
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
        onOpenChange={setIsConfirmModalOpen}
        onConfirm={handleSaveRouteConfirmed}
        isSaving={isSaving}
      />
    </>
  );
}
