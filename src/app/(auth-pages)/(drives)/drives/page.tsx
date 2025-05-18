"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  const { data: myRoutes, error: routesError } = api.routes.getAll.useQuery();
  const { data: passengerRides, error: passengerError } =
    api.userRide.getMyRidesAsPassenger.useQuery();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Function to toggle expanded state for a route
  const toggleExpand = (routeId: string) => {
    if (expandedRouteId === routeId) {
      setExpandedRouteId(null);
    } else {
      setExpandedRouteId(routeId);
    }
  };

  // For routes where I'm a driver, fetch passengers
  const { data: passengers } = api.userRide.getPassengersForRoute.useQuery(
    { routeId: expandedRouteId ?? "" },
    { enabled: !!expandedRouteId },
  );

  if (routesError ?? passengerError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error loading routes: {routesError?.message ?? passengerError?.message}
      </div>
    );
  }

  if (
    (!myRoutes || myRoutes.length === 0) &&
    (!passengerRides || passengerRides.length === 0)
  ) {
    return (
      <div className="container mx-auto p-4 text-center">
        Нямате пътувания или записвания за пътуване.
      </div>
    );
  }

  // Get current date and time
  const now = new Date();

  // Separate and sort routes where I'm a driver
  const myUpcomingRoutes =
    myRoutes
      ?.filter((route) => {
        const routeDate = new Date(route.dateTime as string | Date);
        return routeDate >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime as string | Date).getTime() -
          new Date(b.dateTime as string | Date).getTime(),
      ) ?? [];

  const myPastRoutes =
    myRoutes
      ?.filter((route) => {
        const routeDate = new Date(route.dateTime as string | Date);
        return routeDate < now;
      })
      .sort(
        (a, b) =>
          new Date(b.dateTime as string | Date).getTime() -
          new Date(a.dateTime as string | Date).getTime(),
      ) ?? [];

  // Separate and sort rides where I'm a passenger
  const upcomingPassengerRides =
    passengerRides
      ?.filter((ride) => {
        const rideDate = new Date(ride.route.dateTime as string | Date);
        return rideDate >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.route.dateTime as string | Date).getTime() -
          new Date(b.route.dateTime as string | Date).getTime(),
      ) ?? [];

  const pastPassengerRides =
    passengerRides
      ?.filter((ride) => {
        const rideDate = new Date(ride.route.dateTime as string | Date);
        return rideDate < now;
      })
      .sort(
        (a, b) =>
          new Date(b.route.dateTime as string | Date).getTime() -
          new Date(a.route.dateTime as string | Date).getTime(),
      ) ?? [];

  return (
    <div className="container mx-auto p-4 pt-12">
      <div className="space-y-6">
        {/* Routes where I'm the driver */}
        {(myUpcomingRoutes.length > 0 || myPastRoutes.length > 0) && (
          <div className="space-y-4">
            <h1 className="mb-6 text-2xl font-bold">
              Моите пътувания като шофьор
            </h1>

            {myUpcomingRoutes.length > 0 && (
              <>
                <h2 className="mb-4 text-left text-xl font-semibold">
                  Предстоящи пътувания
                </h2>
                {myUpcomingRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <h2 className="mb-2 text-xl font-semibold">
                        От {route.origin} до {route.destination}
                      </h2>
                      <button
                        onClick={() => toggleExpand(route.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {expandedRouteId === route.id ? "Скрий" : "Пътници"}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Дата и час:{" "}
                      {formatDateTime(
                        route.dateTime as string | Date | null | undefined,
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Общо места: {route.seats ?? "N/A"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Свободни места: {route._count.userRides ?? "N/A"}
                    </p>
                    <Link
                      href={`/${route.id}`}
                      className="mt-2 block text-sm text-blue-500 hover:underline"
                    >
                      Детайли за пътуването
                    </Link>

                    {/* Passengers list when expanded */}
                    {expandedRouteId === route.id && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="mb-2 font-medium">Записани пътници:</h3>
                        {passengers && passengers.length > 0 ? (
                          <ul className="space-y-2">
                            {passengers.map((passenger) => (
                              <li
                                key={passenger.id}
                                className="flex items-center gap-2 rounded bg-gray-50 p-2"
                              >
                                {passenger.user.image && (
                                  <Image
                                    src={passenger.user.image}
                                    alt={
                                      passenger.user.name ?? "Профилна снимка"
                                    }
                                    className="h-8 w-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {passenger.user.name ??
                                      passenger.user.email ??
                                      "Неизвестен пътник"}
                                  </p>
                                  {passenger.user.phoneNumber && (
                                    <p className="text-sm text-gray-600">
                                      Тел: {passenger.user.phoneNumber}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Все още няма записани пътници.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {myPastRoutes.length > 0 && (
              <>
                <h2 className="mt-8 mb-4 text-left text-xl font-semibold">
                  Минали пътувания
                </h2>
                {myPastRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-lg border p-4 opacity-70 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <h2 className="mb-2 text-xl font-semibold">
                        От {route.origin} до {route.destination}
                      </h2>
                      <button
                        onClick={() => toggleExpand(route.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {expandedRouteId === route.id ? "Скрий" : "Пътници"}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Дата и час:{" "}
                      {formatDateTime(
                        route.dateTime as string | Date | null | undefined,
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Общо места: {route.seats ?? "N/A"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Свободни места: {route._count.userRides ?? "N/A"}
                    </p>
                    <Link
                      href={`/${route.id}`}
                      className="mt-2 block text-sm text-blue-500 hover:underline"
                    >
                      Детайли за пътуването
                    </Link>

                    {/* Passengers list when expanded */}
                    {expandedRouteId === route.id && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="mb-2 font-medium">Записани пътници:</h3>
                        {passengers && passengers.length > 0 ? (
                          <ul className="space-y-2">
                            {passengers.map((passenger) => (
                              <li
                                key={passenger.id}
                                className="flex items-center gap-2 rounded bg-gray-50 p-2"
                              >
                                {passenger.user.image && (
                                  <Image
                                    src={passenger.user.image}
                                    alt={
                                      passenger.user.name ?? "Профилна снимка"
                                    }
                                    className="h-8 w-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {passenger.user.name ??
                                      passenger.user.email ??
                                      "Неизвестен пътник"}
                                  </p>
                                  {passenger.user.phoneNumber && (
                                    <p className="text-sm text-gray-600">
                                      Тел: {passenger.user.phoneNumber}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Няма записани пътници.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Rides where I'm a passenger */}
        {(upcomingPassengerRides.length > 0 ||
          pastPassengerRides.length > 0) && (
          <div className="mt-8 space-y-4">
            <h1 className="mb-6 text-2xl font-bold">Моите пътувания</h1>

            {upcomingPassengerRides.length > 0 && (
              <>
                <h2 className="mb-4 text-left text-xl font-semibold">
                  Предстоящи
                </h2>
                {upcomingPassengerRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <h2 className="mb-2 text-xl font-semibold">
                      От {ride.route.origin} до {ride.route.destination}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Дата и час:{" "}
                      {formatDateTime(
                        ride.route.dateTime as string | Date | null | undefined,
                      )}
                    </p>

                    {/* Driver information */}
                    <div className="mt-4 rounded bg-gray-50 p-3">
                      <h3 className="font-medium">Шофьор:</h3>
                      <div className="mt-2 flex items-center gap-2">
                        {ride.route.user.image && (
                          <Image
                            src={ride.route.user.image}
                            alt={ride.route.user.name ?? "Профилна снимка"}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <p>
                            {ride.route.user.name ??
                              ride.route.user.email ??
                              "Неизвестен шофьор"}
                          </p>
                          {ride.route.user.phoneNumber && (
                            <p className="text-sm text-gray-600">
                              Тел: {ride.route.user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${ride.route.id}`}
                      className="mt-3 block text-sm text-blue-500 hover:underline"
                    >
                      Детайли за пътуването
                    </Link>
                  </div>
                ))}
              </>
            )}

            {pastPassengerRides.length > 0 && (
              <>
                <h2 className="mt-8 mb-4 text-left text-xl font-semibold">
                  Минали пътувания
                </h2>
                {pastPassengerRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="rounded-lg border p-4 opacity-70 shadow-sm"
                  >
                    <h2 className="mb-2 text-xl font-semibold">
                      От {ride.route.origin} до {ride.route.destination}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Дата и час:{" "}
                      {formatDateTime(
                        ride.route.dateTime as string | Date | null | undefined,
                      )}
                    </p>

                    {/* Driver information */}
                    <div className="mt-4 rounded bg-gray-50 p-3">
                      <h3 className="font-medium">Шофьор:</h3>
                      <div className="mt-2 flex items-center gap-2">
                        {ride.route.user.image && (
                          <Image
                            src={ride.route.user.image}
                            alt={ride.route.user.name ?? "Профилна снимка"}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <p>
                            {ride.route.user.name ??
                              ride.route.user.email ??
                              "Неизвестен шофьор"}
                          </p>
                          {ride.route.user.phoneNumber && (
                            <p className="text-sm text-gray-600">
                              Тел: {ride.route.user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${ride.route.id}`}
                      className="mt-3 block text-sm text-blue-500 hover:underline"
                    >
                      Детайли за пътуването
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
