"use client";

import { api } from "~/trpc/react";

// Helper function to format date and time (optional, can be expanded)
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";
  // Ensure 'date' is a Date object before formatting
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("bg-BG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

export default function DrivesPage() {
  const { data: routes, error } = api.routes.getAll.useQuery();

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error loading routes: {error.message}
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        You have no saved routes.
      </div>
    );
  }

  // Get current date and time
  const now = new Date();

  // Separate and sort routes
  const upcomingRoutes = routes
    .filter((route) => {
      const routeDate = new Date(route.dateTime as string | Date);
      return routeDate >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.dateTime as string | Date).getTime() -
        new Date(b.dateTime as string | Date).getTime(),
    );

  const pastRoutes = routes
    .filter((route) => {
      const routeDate = new Date(route.dateTime as string | Date);
      return routeDate < now;
    })
    .sort(
      (a, b) =>
        new Date(b.dateTime as string | Date).getTime() -
        new Date(a.dateTime as string | Date).getTime(),
    );

  return (
    <div className="container mx-auto p-4 pt-12">
      <div className="space-y-4">
        {upcomingRoutes.length > 0 && (
          <>
            <h2 className="mb-4 text-left text-xl font-semibold">
              Предстоящи пътувания
            </h2>
            {upcomingRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-card rounded-lg border p-4 shadow-sm"
              >
                <h2 className="mb-2 text-xl font-semibold">
                  От {route.origin} до {route.destination}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Дата и час:{" "}
                  {formatDateTime(
                    route.dateTime as string | Date | null | undefined,
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  Свободни места: {route.seats ?? "N/A"}
                </p>
                {/* You can add more details or actions here, e.g., view on map, delete route */}
              </div>
            ))}
          </>
        )}

        {pastRoutes.length > 0 && (
          <>
            <h2 className="mt-8 mb-4 text-left text-xl font-semibold">
              Минали пътувания
            </h2>
            {pastRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-card rounded-lg border p-4 opacity-70 shadow-sm"
              >
                <h2 className="mb-2 text-xl font-semibold">
                  От {route.origin} до {route.destination}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Дата и час:{" "}
                  {formatDateTime(
                    route.dateTime as string | Date | null | undefined,
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  Свободни места: {route.seats ?? "N/A"}
                </p>
                {/* You can add more details or actions here, e.g., view on map, delete route */}
              </div>
            ))}
          </>
        )}

        {upcomingRoutes.length === 0 && pastRoutes.length === 0 && (
          <div className="text-center">
            Нямате предстоящи или минали пътувания.
          </div>
        )}
      </div>
    </div>
  );
}
