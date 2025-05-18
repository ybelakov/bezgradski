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
import { useSession } from "next-auth/react";

interface ConfirmRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    dateTime: Date,
    time: string,
    seats: number,
    phoneNumber: string,
  ) => void;
  isSaving: boolean;
}

export function ConfirmRouteDialog({
  open,
  onClose,
  onConfirm,
  isSaving,
}: ConfirmRouteDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 1)),
  );
  const [time, setTime] = React.useState<string>("08:00");
  const [seats, setSeats] = React.useState<number | undefined>(4);
  const [phoneNumber, setPhoneNumber] = React.useState<string>();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState<boolean>(false);

  const { data: session } = useSession();

  React.useEffect(() => {
    if (!session?.user.phoneNumber) return;
    setPhoneNumber(session.user.phoneNumber);
  }, [session?.user.phoneNumber]);
  const handleConfirm = () => {
    if (date && time && seats !== undefined && phoneNumber) {
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDateTime = new Date(date);
      if (hours !== undefined && minutes !== undefined) {
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);
      }
      onConfirm(combinedDateTime, time, seats, phoneNumber);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]" hideXIcon>
        <XIcon
          className="absolute top-2 right-2 cursor-pointer"
          onClick={onClose}
        />
        <DialogHeader>
          <DialogTitle>Потвърди</DialogTitle>
          <DialogDescription>
            Моля, въведете датата, часа и наличните места за този маршрут.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Дата</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setIsCalendarOpen(false);
                  }}
                  fromDate={new Date()}
                  toDate={new Date(new Date().getFullYear(), 11, 31)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Час
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
              Места
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Телефон
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
              placeholder="0888 123 456"
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
            disabled={
              !date || !time || seats === undefined || !phoneNumber || isSaving
            }
          >
            {isSaving ? "Запазване..." : "Запази"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
