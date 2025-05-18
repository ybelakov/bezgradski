"use client";

import {
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import { env } from "~/env";
import type { Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

interface RouteDisplayMapProps {
  directions?: google.maps.DirectionsResult;
}

export function RouteDisplayMap({ directions }: RouteDisplayMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-route-display",
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_JAVASCRIPT_API_KEY,
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        height: "400px", // Adjust as needed
        width: "100%",
      }}
      center={{ lat: 42.6977, lng: 23.3219 }}
      zoom={10} // Adjust zoom as needed, or fit bounds
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      <DirectionsRenderer
        directions={directions}
        options={{
          polylineOptions: {
            strokeColor: "#1a73e8", // Example color
            strokeWeight: 5,
          },
        }}
      />
    </GoogleMap>
  );
}
