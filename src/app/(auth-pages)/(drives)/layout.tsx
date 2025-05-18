import { HomeIcon } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative flex h-12 w-full">
      <Link href="/">
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <HomeIcon />
          Без Градски
        </div>
      </Link>

      {children}
    </div>
  );
}
