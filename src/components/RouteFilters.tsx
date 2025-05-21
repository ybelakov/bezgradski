import { Button } from "~/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";

export type FilterType = "all" | "today" | "tomorrow";
export type ViewType = "list" | "map";

interface RouteFiltersProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function RouteFilters({
  selectedFilter,
  onFilterChange,
  selectedView,
  onViewChange,
}: RouteFiltersProps) {
  const t = useTranslations();
  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="bg-background flex w-fit rounded-md border">
        <Button
          onClick={() => onFilterChange("all")}
          variant={selectedFilter === "all" ? "default" : "ghost"}
        >
          {t("filter_all")}
        </Button>
        <Button
          onClick={() => onFilterChange("today")}
          variant={selectedFilter === "today" ? "default" : "ghost"}
        >
          {t("filter_today")}
        </Button>
        <Button
          onClick={() => onFilterChange("tomorrow")}
          variant={selectedFilter === "tomorrow" ? "default" : "ghost"}
        >
          {t("filter_tomorrow")}
        </Button>
      </div>
      <div className="bg-background flex w-fit rounded-md border">
        <Button
          onClick={() => onViewChange("map")}
          variant={selectedView === "map" ? "default" : "ghost"}
          className="flex items-center gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          <span>{t("filter_map")}</span>
        </Button>
        <Button
          onClick={() => onViewChange("list")}
          variant={selectedView === "list" ? "default" : "ghost"}
          className="flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          <span>{t("filter_list")}</span>
        </Button>
      </div>
    </div>
  );
}

// Helper function to get date for filters
export function getFilterDate(filter: FilterType): Date | undefined {
  if (filter === "all") return undefined;

  const date = new Date();
  if (filter === "today") {
    return date;
  } else if (filter === "tomorrow") {
    date.setDate(date.getDate() + 1);
    return date;
  }
  return undefined;
}
