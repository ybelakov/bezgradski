"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

export default function AllRoutesPage() {
  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = api.routes.getAllUpcoming.useQuery();

  return (
    <div className="container mx-auto p-4 pt-12">
      <h1 className="mb-6 text-2xl font-bold">
        Всички предстоящи маршрути в София (
        <Link className="text-md text-blue-400" href="/all-map">
          виж на картата
        </Link>
        )
      </h1>

      {isLoading && <p>Зареждане на маршрути...</p>}
      {isError && (
        <p className="text-red-500">
          Грешка при зареждане на маршрути: {error?.message ?? "Unknown error"}
        </p>
      )}

      {!isLoading && !isError && (
        <div>
          {routes ? (
            <ul className="flex flex-col space-y-4">
              {routes.map((route) => (
                <Link key={route.id} href={`/${route.id}`}>
                  {/* Assuming the route object has an id, origin, destination, dateTime, and seats */}
                  <li className="cursor-pointer rounded border bg-white p-4 shadow hover:bg-gray-50">
                    <h3 className="text-lg font-semibold">
                      {route.origin} - {route.destination}
                    </h3>
                    <p>Дата: {new Date(route.dateTime).toLocaleDateString()}</p>
                    <p>
                      Час на тръгване:{" "}
                      {new Date(route.dateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-blue-500 hover:underline">Виж маршрут</p>
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <p>Няма намерени предстоящи маршрути.</p>
          )}
        </div>
      )}
    </div>
  );
}
