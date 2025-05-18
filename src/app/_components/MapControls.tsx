import { Button } from "~/components/ui/button";
import { useMapStore } from "~/store/mapStore";

export function MapControls() {
  const { origin, destination, directions, setShouldFetchDirections } =
    useMapStore();

  console.log({
    origin,
    destination,
  });

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <Button
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        onClick={() => setShouldFetchDirections(true)}
        disabled={!origin || !destination}
      >
        Продължи
      </Button>
    </div>
  );
}
