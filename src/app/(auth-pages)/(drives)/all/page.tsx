"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RouteFilters,
  type FilterType,
  type ViewType,
  getFilterDate,
} from "~/components/RouteFilters";
import { useTranslations } from "next-intl";

export default function AllRoutesPage() {
  const router = useRouter();
  const t = useTranslations();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("today");
  const filterDate = useMemo(
    () => getFilterDate(selectedFilter),
    [selectedFilter],
  );

  const handleViewChange = (view: ViewType) => {
    if (view === "map") {
      router.push("/all-map");
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.routes.getAllUpcoming.useInfiniteQuery(
    {
      date: filterDate,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const routes = data?.pages.flatMap((page) => page.items) ?? [];
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="container mx-auto p-4 pt-12">
      <div className="mb-6">
        <h1 className="mb-4 text-lg font-bold">{t("all_routes_sofia")}</h1>

        <RouteFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          selectedView="list"
          onViewChange={handleViewChange}
        />
      </div>
      {isLoading && <p>{t("loading_routes")}</p>}
      {isError && (
        <p className="text-red-500">
          {t("error_loading_routes", {
            error: error?.message ?? "Unknown error",
          })}
        </p>
      )}
      {!isLoading && !isError && (
        <div>
          {routes.length > 0 ? (
            <>
              <ul className="flex flex-col space-y-4">
                {routes.map((route) => (
                  <Link key={route.id} href={`/${route.id}`}>
                    <li className="cursor-pointer rounded border bg-white p-4 text-sm shadow hover:bg-gray-50">
                      <h3 className="text-md font-semibold">
                        {route.origin} - {route.destination}
                      </h3>
                      <p>
                        {t("date")}:{" "}
                        {new Date(route.dateTime).toLocaleDateString()}
                      </p>
                      <p>
                        {t("time_of_travel")}:{" "}
                        {new Date(route.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-blue-500 hover:underline">
                        {t("view_route")}
                      </p>
                    </li>
                  </Link>
                ))}
              </ul>
              <div ref={loadMoreRef} className="mt-4 h-10 w-full">
                {isFetchingNextPage && (
                  <p className="text-center text-gray-500">
                    {t("loading_more")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p>{t("no_upcoming_routes")}</p>
          )}
        </div>
      )}
    </div>
  );
}
