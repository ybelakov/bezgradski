"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ConfirmRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dateTime: Date, time: string, seats: number) => void;
  isSaving: boolean;
}

export function ConfirmRouteDialog({
  open,
  onOpenChange,
  onConfirm,
  isSaving,
}: ConfirmRouteDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState<string>("");
  const [seats, setSeats] = React.useState<number | undefined>();

  const handleConfirm = () => {
    if (date && time && seats !== undefined) {
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDateTime = new Date(date);
      if (hours !== undefined && minutes !== undefined) {
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);
      }
      onConfirm(combinedDateTime, time, seats);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" hideXIcon>
        <XIcon
          className="absolute top-2 right-2 cursor-pointer"
          onClick={handleClose}
        />
        <DialogHeader>
          <DialogTitle>Confirm Route Details</DialogTitle>
          <DialogDescription>
            Please provide the date, time, and available seats for this route.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seats" className="text-right">
              Seats
            </Label>
            <Input
              id="seats"
              type="number"
              value={seats ?? ""}
              onChange={(e) => setSeats(parseInt(e.target.value, 10))}
              className="col-span-3"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleConfirm}
            disabled={!date || !time || seats === undefined || isSaving}
          >
            {isSaving ? "Saving..." : "Confirm & Save Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
