import { Button } from "~/components/ui/button";

export type FilterType = "all" | "today" | "tomorrow";

interface RouteFiltersProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function RouteFilters({
  selectedFilter,
  onFilterChange,
}: RouteFiltersProps) {
  return (
    <div className="flex space-x-4">
      <Button
        onClick={() => onFilterChange("all")}
        variant={selectedFilter === "all" ? "default" : "secondary"}
      >
        Всички
      </Button>
      <Button
        onClick={() => onFilterChange("today")}
        variant={selectedFilter === "today" ? "default" : "secondary"}
      >
        Днес
      </Button>
      <Button
        onClick={() => onFilterChange("tomorrow")}
        variant={selectedFilter === "tomorrow" ? "default" : "secondary"}
      >
        Утре
      </Button>
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
