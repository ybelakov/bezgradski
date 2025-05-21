"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Polyline,
} from "@react-google-maps/api";
import { env } from "~/env";
import type { Libraries } from "@react-google-maps/api";
import {
  RouteFilters,
  type FilterType,
  type ViewType,
  getFilterDate,
} from "~/components/RouteFilters";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-route-display",
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_JAVASCRIPT_API_KEY,
    libraries,
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("today");
  const [selectedRouteId, setSelectedRouteId] = useState<
    string | number | null
  >(null);

  const handleViewChange = (view: ViewType) => {
    if (view === "list") {
      router.push("/all");
    }
  };

  const filterDate = useMemo(
    () => getFilterDate(selectedFilter),
    [selectedFilter],
  );

  const { data, isLoading, isError } = api.routes.getAllUpcoming.useQuery({
    date: filterDate,
  });

  if (isLoading || !isLoaded) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  if (isError) {
    return <div className="p-12 text-red-500">Error loading routes</div>;
  }

  const routes = data?.items;

  // Filter routes that have directions
  const routesWithDirections = routes?.filter((route) => route.directions);

  // Find the currently selected route object
  const selectedRoute = routes?.find((route) => route.id === selectedRouteId);

  return (
    <div className="flex h-screen w-full flex-col pt-12">
      <div className="px-4">
        <h1 className="mb-4 text-2xl font-bold">{t("all_routes")}</h1>
        <div className="mb-4">
          <RouteFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            selectedView="map"
            onViewChange={handleViewChange}
          />
        </div>
      </div>

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
                  {t("route_from_to", {
                    origin: selectedRoute.origin,
                    destination: selectedRoute.destination,
                  })}
                  <span className="text-sm font-normal text-blue-600 hover:text-blue-800">
                    {t("view_route")}
                  </span>
                </h2>
              </Link>
              {selectedRoute.dateTime && (
                <p className="text-sm">
                  {t("date")}:{" "}
                  {new Date(selectedRoute.dateTime).toLocaleDateString()} –{" "}
                  {new Date(selectedRoute.dateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedRouteId(null)}
              className="ml-4 text-gray-500 transition-colors hover:text-gray-700"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <span className="px-4">{t("click_route_info")}</span>
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
          {routesWithDirections?.map((route, index) => {
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
