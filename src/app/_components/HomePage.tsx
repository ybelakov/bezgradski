"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Car, Search, ListChecks, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function HomePage() {
  const router = useRouter();

  const handleOfferTransport = () => {
    // Navigate to the offer-drive page
    router.push("/offer-drive");
  };

  const handleSearchTransport = () => {
    // Navigate to the search-drive page
    router.push("/search-drive");
  };

  const handleLogout = async () => {
    await signOut({
      redirect: true,
    });
  };

  const TransportButtons = () => (
    <div className="flex h-full w-full flex-col gap-6 p-3">
      <Button
        className="flex-1 py-8 text-xl"
        variant="outline"
        onClick={handleSearchTransport}
      >
        <Search className="mr-2 size-6" />
        Намери транспорт
      </Button>
      <Button
        className="flex-1 py-8 text-xl"
        variant="outline"
        onClick={handleOfferTransport}
      >
        <Car className="mr-2 size-6" />
        Предложи транспорт
      </Button>
      <Link href="/drives" passHref className="flex-1">
        <Button className="h-full w-full py-8 text-xl" variant="outline">
          <ListChecks className="mr-2 size-6" />
          Моите пътувания
        </Button>
      </Link>
    </div>
  );

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      id="transport-options-container"
    >
      {/* Desktop view */}
      <div className="fixed inset-0 z-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/background-bg.jpg"
            alt="Background"
            fill
            priority
            quality={100}
            className="object-cover"
            style={{ filter: "blur(8px)" }}
          />
        </div>

        <Dialog open>
          <DialogContent className="flex flex-col justify-center" hideXIcon>
            <DialogTitle className="text-center text-xl font-bold">
              Без Градски - Споделено пътуване
            </DialogTitle>
            <TransportButtons />
            <div className="mt-6 flex w-full justify-end">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Изход
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
