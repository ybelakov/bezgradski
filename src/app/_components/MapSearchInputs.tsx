import { Autocomplete } from "@react-google-maps/api";
import { useCallback, useRef, useState } from "react";
import { useMapStore } from "~/store/mapStore";
import { useSearchStore } from "~/store/searchStore";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "~/lib/utils";
import { useTranslations } from "next-intl";

interface MapSearchInputsProps {
  isLoaded: boolean;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  purpose?: "offer" | "search";
}

export function MapSearchInputs({
  isLoaded,
  mapRef,
  purpose = "offer",
}: MapSearchInputsProps) {
  const t = useTranslations();
  const { setOrigin: setMapOrigin, setDestination: setMapDestination } =
    useMapStore();
  const { searchDate, setSearchOrigin, setSearchDestination, setSearchDate } =
    useSearchStore();

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const onOriginLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      originRef.current = autocomplete;
    },
    [],
  );

  const onDestinationLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      destinationRef.current = autocomplete;
    },
    [],
  );

  const onOriginChanged = () => {
    const place = originRef?.current?.getPlace();
    if (!place?.geometry?.location || !place.formatted_address) {
      return;
    }

    const locationDetails = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address,
    };

    if (purpose === "search") {
      setSearchOrigin(locationDetails);
    } else {
      if (mapRef.current) {
        if (place.geometry.viewport) {
          mapRef.current.fitBounds(place.geometry.viewport);
        } else if (place.geometry.location) {
          mapRef.current.setCenter(place.geometry.location);
          mapRef.current.setZoom(17);
        }
      }
      setMapOrigin(place.formatted_address ?? null);
    }
  };

  const onDestinationChanges = () => {
    const place = destinationRef?.current?.getPlace();
    if (!place?.geometry?.location || !place.formatted_address) {
      return;
    }

    const locationDetails = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address,
    };

    if (purpose === "search") {
      setSearchDestination(locationDetails);
    } else {
      if (mapRef.current) {
        if (place.geometry.viewport) {
          mapRef.current.fitBounds(place.geometry.viewport);
        } else if (place.geometry.location) {
          mapRef.current.setCenter(place.geometry.location);
          mapRef.current.setZoom(17);
        }
      }
      setMapDestination(place.formatted_address ?? null);
    }
  };

  if (!isLoaded) return null;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setSearchDate(format(selectedDate, "yyyy-MM-dd"));
    } else {
      setSearchDate(null);
    }
    setIsCalendarOpen(false);
  };

  const dateObject = searchDate ? parseISO(searchDate) : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginChanged}>
        <input
          type="text"
          placeholder={t("start_point")}
          className="w-full rounded border p-2"
        />
      </Autocomplete>
      <Autocomplete
        onLoad={onDestinationLoad}
        onPlaceChanged={onDestinationChanges}
      >
        <input
          type="text"
          placeholder={t("destination")}
          className="w-full rounded border p-2"
        />
      </Autocomplete>
      {purpose === "search" && (
        <>
          <div className="grid w-full items-center gap-1.5">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  id="date-picker"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateObject ? (
                    format(dateObject, "PPP")
                  ) : (
                    <span>{t("select_date")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  weekStartsOn={1}
                  mode="single"
                  selected={dateObject}
                  onSelect={handleDateSelect}
                  fromDate={new Date()}
                  toDate={new Date(new Date().getFullYear(), 11, 31)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
}
