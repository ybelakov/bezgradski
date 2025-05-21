"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react"; // Import tRPC hook
import Link from "next/link"; // Import Link
import { useTranslations } from "next-intl";

interface ParsedSearchParams {
  originLat?: number;
  originLng?: number;
  originAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
  destinationAddress?: string;
  date?: string;
  time?: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [parsedParams, setParsedParams] = useState<ParsedSearchParams>({});
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const params: ParsedSearchParams = {};
    const originLatStr = searchParams.get("originLat");
    const originLngStr = searchParams.get("originLng");
    const destinationLatStr = searchParams.get("destinationLat");
    const destinationLngStr = searchParams.get("destinationLng");

    params.originAddress = searchParams.get("originAddress") ?? undefined;
    params.destinationAddress =
      searchParams.get("destinationAddress") ?? undefined;
    params.date = searchParams.get("date") ?? undefined;
    params.time = searchParams.get("time") ?? undefined;

    if (originLatStr) params.originLat = parseFloat(originLatStr);
    if (originLngStr) params.originLng = parseFloat(originLngStr);
    if (destinationLatStr)
      params.destinationLat = parseFloat(destinationLatStr);
    if (destinationLngStr)
      params.destinationLng = parseFloat(destinationLngStr);

    setParsedParams(params);

    // Enable the query only if all required lat/lng and date are present
    if (
      params.originLat !== undefined &&
      params.originLng !== undefined &&
      params.destinationLat !== undefined &&
      params.destinationLng !== undefined &&
      params.date
    ) {
      setIsQueryEnabled(true);
    } else {
      setIsQueryEnabled(false);
    }
  }, [searchParams]);

  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = api.routes.search.useQuery(
    // Type assertion for input, ensure parsedParams matches expected input structure
    parsedParams as {
      originLat: number;
      originLng: number;
      destinationLat: number;
      destinationLng: number;
      date: string;
      originAddress?: string;
      destinationAddress?: string;
    },
    {
      enabled: isQueryEnabled && Object.keys(parsedParams).length > 0, // Ensure params are populated and query is enabled
      // You might want to add other react-query options like staleTime, cacheTime, etc.
    },
  );

  return (
    <div className="container mx-auto p-4 pt-12">
      <h1 className="mb-4 text-2xl font-bold">{t("search_for")}</h1>
      <div className="mb-6 rounded bg-gray-100 p-4 shadow">
        {parsedParams.originAddress && (
          <p>
            <strong>{t("start_point")}:</strong> {parsedParams.originAddress}
          </p>
        )}
        {parsedParams.destinationAddress && (
          <p>
            <strong>{t("destination")}:</strong>{" "}
            {parsedParams.destinationAddress}
          </p>
        )}
        {parsedParams.date && (
          <p>
            <strong>{t("date")}:</strong>{" "}
            {new Date(parsedParams.date).toLocaleDateString()}
          </p>
        )}
        {!isQueryEnabled && Object.keys(parsedParams).length > 0 && (
          <p className="text-orange-600">
            <em>
              Incomplete search criteria. Please provide origin, destination,
              and date.
            </em>
          </p>
        )}
        {Object.keys(parsedParams).length === 0 && !searchParams.toString() && (
          <p>Loading search criteria...</p>
        )}
      </div>
      {isLoading && isQueryEnabled && <p>Searching for routes...</p>}
      {isError && isQueryEnabled && (
        <p className="text-red-500">Error fetching routes: {error?.message}</p>
      )}
      {!isLoading && !isError && isQueryEnabled && (
        <div>
          {routes && routes.length > 0 ? (
            <ul className="space-y-4">
              <span className="mb-1 text-lg">{t("results")}</span>
              {routes.map((route) => (
                <Link key={route.id} href={`/${route.id}`}>
                  <li className="cursor-pointer rounded border bg-white p-4 shadow hover:bg-gray-50">
                    <h3 className="text-lg font-semibold">
                      {route.origin} - {route.destination}
                    </h3>

                    {route.dateTime ? (
                      <p>
                        {" "}
                        {t("date")}:{" "}
                        {new Date(route.dateTime).toLocaleDateString()}
                      </p>
                    ) : null}

                    {route.dateTime ? (
                      <p>
                        {t("time")}:{" "}
                        {new Date(route.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        ч.
                      </p>
                    ) : null}
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <p>{t("no_routes_found")}</p>
          )}
        </div>
      )}
      {!isQueryEnabled &&
        Object.keys(parsedParams).length === 0 &&
        !searchParams.toString() && (
          <p className="mt-6">
            <em>Enter search criteria on the previous page to see results.</em>
          </p>
        )}
    </div>
  );
}
