export function formatDateTime(
  dateTime: Date | string | null | undefined,
): string {
  if (!dateTime) return "N/A";

  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;

  return date.toLocaleString("bg-BG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
