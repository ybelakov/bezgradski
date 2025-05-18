"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Polyline,
} from "@react-google-maps/api";
import { env } from "~/env";
import type { Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places", "geometry"];

// Define an array of colors for the routes
const ROUTE_COLORS = [
  "#FF5252", // Red
  "#448AFF", // Blue
  "#66BB6A", // Green
  "#FFC107", // Amber
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#009688", // Teal
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
  "#3F51B5", // Indigo
  "#FFEB3B", // Yellow
  "#FF4081", // Pink A400
  "#8BC34A", // Light Green
  "#FF5722", // Deep Orange
  "#673AB7", // Deep Purple
  "#CDDC39", // Lime
  "#FF9800", // Orange A400
  "#00BCD4", // Cyan
  "#9E9E9E", // Grey
  "#F44336", // Red A400
  "#2196F3", // Blue A400
];

export default function AllRoutesMapPage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-route-display",
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_JAVASCRIPT_API_KEY,
    libraries,
  });

  const {
    data: routes,
    isLoading,
    isError,
  } = api.routes.getAllUpcoming.useQuery();

  // Track which route is currently selected / highlighted
  const [selectedRouteId, setSelectedRouteId] = useState<
    string | number | null
  >(null);

  if (isLoading || !isLoaded) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  if (isError) {
    return <div className="p-12 text-red-500">Error loading routes</div>;
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Няма намерени предстоящи маршрути
      </div>
    );
  }

  // Filter routes that have directions
  const routesWithDirections = routes.filter((route) => route.directions);

  // Find the currently selected route object
  const selectedRoute = routes.find((route) => route.id === selectedRouteId);

  return (
    <div className="flex h-screen w-full flex-col pt-12">
      <h1 className="mb-4 px-4 text-2xl font-bold">
        Всички предстоящи маршрути
      </h1>

      {/* Info box for the selected route */}
      {selectedRoute ? (
        <div className="mx-4 mb-4 rounded border bg-white px-4 py-2 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/${selectedRoute.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="text-sm font-semibold hover:underline">
                  От {selectedRoute.origin} до {selectedRoute.destination} -{" "}
                  <span className="text-sm font-normal text-blue-600 hover:text-blue-800">
                    Виж маршрут
                  </span>
                </h2>
              </Link>
              {selectedRoute.dateTime && (
                <p className="text-sm">
                  Дата: {new Date(selectedRoute.dateTime).toLocaleDateString()}{" "}
                  –{" "}
                  {new Date(selectedRoute.dateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {typeof selectedRoute.seats === "number" && (
                <p className="text-sm">
                  Свободни места:{" "}
                  {(selectedRoute.seats ?? 0) -
                    (selectedRoute._count?.userRides ?? 0)}{" "}
                  / {selectedRoute.seats}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedRouteId(null)}
              className="ml-4 text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Затвори"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <span className="px-4">
          Натиснете върху маршрут, за да видите информация за него.
        </span>
      )}

      {/* Loading spinner */}

      {/* Map */}
      <div className="relative h-full w-full flex-1">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
          }}
          center={{ lat: 42.6977, lng: 23.3219 }} // Sofia, Bulgaria
          zoom={11}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {routesWithDirections.map((route, index) => {
            // Get color for this route (cycle through colors)
            const routeColor = ROUTE_COLORS[index % ROUTE_COLORS.length];

            // Decode the overview polyline to draw a clickable Polyline
            const directions =
              route.directions as unknown as google.maps.DirectionsResult;

            const route0 = directions.routes?.[0];
            const encodedPath =
              typeof route0?.overview_polyline === "string"
                ? route0?.overview_polyline
                : (
                    route0?.overview_polyline as
                      | google.maps.DirectionsPolyline
                      | undefined
                  )?.points;

            if (!encodedPath) return null;

            const path = google.maps.geometry.encoding.decodePath(encodedPath);

            const isHighlighted = selectedRouteId === route.id;

            return (
              <Fragment key={route.id}>
                {/* Keep the DirectionsRenderer for markers/etc., but hide its polyline */}
                <DirectionsRenderer
                  key={`renderer-${route.id}`}
                  directions={directions}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeOpacity: 0, // hide original polyline so we control styling via Polyline below
                      clickable: false,
                    },
                  }}
                />

                {/* Custom clickable polyline */}
                <Polyline
                  path={path}
                  options={{
                    strokeColor: routeColor,
                    strokeWeight: isHighlighted ? 6 : 4,
                    strokeOpacity: isHighlighted ? 1 : 0.4,
                    zIndex: isHighlighted ? 2 : 1,
                  }}
                  onClick={() => setSelectedRouteId(route.id)}
                />
              </Fragment>
            );
          })}
        </GoogleMap>
      </div>
    </div>
  );
}
