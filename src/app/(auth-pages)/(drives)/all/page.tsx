"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  RouteFilters,
  type FilterType,
  getFilterDate,
} from "~/components/RouteFilters";

export default function AllRoutesPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("today");
  const filterDate = useMemo(
    () => getFilterDate(selectedFilter),
    [selectedFilter],
  );

  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = api.routes.getAllUpcoming.useQuery({
    date: filterDate,
  });

  return (
    <div className="container mx-auto p-4 pt-12">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold">
          Всички предстоящи маршрути в София (
          <Link className="text-md text-blue-400" href="/all-map">
            виж на картата
          </Link>
          )
        </h1>

        <RouteFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {isLoading && <p>Зареждане на маршрути...</p>}
      {!routes?.length && !isLoading && (
        <p className="text-gray-500">Няма намерени предстоящи маршрути.</p>
      )}
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
