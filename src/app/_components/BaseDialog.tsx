"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle as ShadcnDialogTitle,
} from "~/components/ui/dialog"; // Renamed to avoid name clash
import { XIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  modal?: boolean;
  showCustomXIcon?: boolean; // Renamed for clarity, defaults to true
  dialogContentClassName?: string;
  overlayClassName?: string;
}

export function BaseDialog({
  isOpen,
  onClose,
  title,
  children,
  modal = false,
  showCustomXIcon = true, // Default to showing our custom X icon
  dialogContentClassName,
  overlayClassName,
}: BaseDialogProps) {
  return (
    <>
      <div
        style={{
          height: "100dvh",
        }}
        className={cn(
          "absolute top-0 z-[50] w-screen bg-black/50",
          isOpen ? "block" : "hidden",
        )}
      />
      <Dialog open={isOpen} modal={modal}>
        <DialogContent
          className={dialogContentClassName}
          hideXIcon={true} // Always hide shadcn's default X icon, we use our own or none.
          overlayClassName={overlayClassName}
        >
          {showCustomXIcon && (
            <XIcon
              className="absolute top-2 right-2 cursor-pointer"
              onClick={onClose}
            />
          )}
          <ShadcnDialogTitle className="text-center text-xl font-bold">
            {title}
          </ShadcnDialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
