import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
import { useCallback, useRef } from "react";
import { useMapStore } from "~/store/mapStore";

interface GoogleMapWithDirectionsProps {
  onMapLoad: (map: google.maps.Map) => void;
  onDirectionsSuccess?: () => void;
}

export function GoogleMapWithDirections({
  onMapLoad,
  onDirectionsSuccess,
}: GoogleMapWithDirectionsProps) {
  const {
    origin,
    destination,
    directions,
    shouldFetchDirections,
    setDirections,
    setShouldFetchDirections,
  } = useMapStore();

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const directionsOptions =
    origin && destination && shouldFetchDirections
      ? {
          destination,
          origin,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }
      : null;

  const directionsCallback = useCallback(
    (
      response: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus,
    ) => {
      if (status === window.google.maps.DirectionsStatus.OK && response) {
        console.log(response);
        setDirections(response);
        onDirectionsSuccess?.();
      } else {
        console.error(`Error fetching directions. Status: ${status}`);
        if (response) {
          console.error("Directions response:", response);
        }
      }
      setShouldFetchDirections(false); // Reset the trigger
    },
    [setDirections, setShouldFetchDirections, onDirectionsSuccess],
  );

  const onDirectionsChanged = useCallback(() => {
    if (directionsRendererRef.current) {
      const newDirections = directionsRendererRef.current.getDirections();
      if (
        newDirections &&
        JSON.stringify(newDirections) !== JSON.stringify(directions)
      ) {
        setDirections(newDirections);
      }
    }
  }, [setDirections, directions]);

  return (
    <div className="h-full w-full">
      <GoogleMap
        mapContainerStyle={{
          height: "100%",
          width: "100%",
        }}
        center={{
          lat: 42.6977, // Sofia, Bulgaria latitude
          lng: 23.3219, // Sofia, Bulgaria longitude
        }}
        zoom={8}
        onLoad={onMapLoad}
        options={{
          restriction: {
            latLngBounds: {
              north: 42.85, // Expanded north boundary
              south: 42.55, // Expanded south boundary
              east: 23.6, // Expanded east boundary
              west: 23.05, // Expanded west boundary
            },
            strictBounds: true,
          },
          streetViewControl: false,
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ draggable: true }}
            onLoad={(renderer) => {
              directionsRendererRef.current = renderer;
            }}
            onDirectionsChanged={onDirectionsChanged}
          />
        )}
        {directionsOptions && (
          <DirectionsService
            options={directionsOptions}
            callback={directionsCallback}
          />
        )}
      </GoogleMap>
    </div>
  );
}
