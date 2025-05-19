import { BusIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative flex h-20 w-full">
      <div className="absolute top-2 left-3 flex items-center justify-between gap-1">
        <Link href="/" className="cursor-pointer">
          <ChevronLeft />
        </Link>
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
