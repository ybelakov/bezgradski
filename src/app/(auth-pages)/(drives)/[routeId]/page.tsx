"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
// No longer need useEffect from react for this page's direct logic
// import { useEffect } from "react";
import { RouteDisplayMap } from "~/app/_components/RouteDisplayMap"; // Import the new map component

export default function RouteDetailsPage() {
  const params = useParams();
  const routeId = params.routeId as string;

  const {
    data: route,
    isLoading: isLoadingRoute, // Renamed to avoid conflict if isMapApiLoaded is used
    isError: isRouteError,
    error: routeError,
  } = api.routes.getById.useQuery(
    { id: routeId },
    {
      enabled: !!routeId,
    },
  );
  console.log({ route });
  if (isLoadingRoute) return <p>Зареждане...</p>;
  if (isRouteError) return <p>Error fetching route: {routeError?.message}</p>;
  if (!route) return <p>Route not found.</p>;

  return (
    <div className="container mx-auto p-4 pt-12">
      <h1 className="mb-4 text-2xl font-bold">Информация за маршрута</h1>
      <div className="mb-6 rounded bg-gray-100 p-4 shadow">
        <p>
          <strong>Начална точка:</strong> {route.origin}
        </p>
        <p>
          <strong>Дестинация:</strong> {route.destination}
        </p>
        <p>
          <strong>Дата:</strong>{" "}
          {route.dateTime
            ? new Date(route.dateTime).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          <strong>Час:</strong>{" "}
          {route.dateTime
            ? new Date(route.dateTime).toLocaleTimeString()
            : "N/A"}
        </p>
        <p>
          <strong>Свободни места:</strong> {route.seats ?? "N/A"}
        </p>
      </div>

      {/* Map Display Section */}
      <div className="mt-6">
        <RouteDisplayMap
          directions={
            route.directions as object as google.maps.DirectionsResult
          }
        />
      </div>
    </div>
  );
}
