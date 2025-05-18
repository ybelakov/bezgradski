import { Autocomplete } from "@react-google-maps/api";
import { useCallback, useRef } from "react";
import { useMapStore } from "~/store/mapStore";

interface MapSearchInputsProps {
  isLoaded: boolean;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
}

export function MapSearchInputs({ isLoaded, mapRef }: MapSearchInputsProps) {
  const { setOrigin, setDestination } = useMapStore();

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onOriginLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      originRef.current = autocomplete;
    },
    [],
  );

  const onDestinationLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      destinationRef.current = autocomplete;
    },
    [],
  );

  const onOriginChanged = () => {
    const place = originRef?.current?.getPlace();
    if (!place?.geometry) {
      alert("No details available for input: '" + place?.name + "'");
      return;
    }
    if (mapRef.current) {
      if (place.geometry.viewport) {
        mapRef.current.fitBounds(place.geometry.viewport);
      } else if (place.geometry.location) {
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(17);
      }
    }
    setOrigin(place.formatted_address ?? null);
  };

  const onDestinationChanges = () => {
    const place = destinationRef?.current?.getPlace();
    if (!place?.geometry) {
      alert("No details available for input: '" + place?.name + "'");
      return;
    }
    if (mapRef.current) {
      if (place.geometry.viewport) {
        mapRef.current.fitBounds(place.geometry.viewport);
      } else if (place.geometry.location) {
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(17);
      }
    }
    setDestination(place.formatted_address ?? null);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginChanged}>
        <input
          type="text"
          placeholder="Начална точка"
          className="w-full rounded border p-2"
        />
      </Autocomplete>
      <Autocomplete
        onLoad={onDestinationLoad}
        onPlaceChanged={onDestinationChanges}
      >
        <input
          type="text"
          placeholder="Дестинация"
          className="w-full rounded border p-2"
        />
      </Autocomplete>
    </div>
  );
}
