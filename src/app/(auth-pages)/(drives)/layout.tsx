"use client";
import { BusIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  return (
    <div className="relative flex h-20 w-full">
      <div className="absolute top-2 left-3 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft />
        </Button>
        <Link
          href="/"
          className="flex flex-row items-center gap-1 rounded-md border p-1 shadow-md"
        >
          <BusIcon />
          Без Градски
        </Link>
      </div>
      {children}
    </div>
  );
}
