"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Car, Search } from "lucide-react";

export function HomePage() {
  const router = useRouter();

  const handleOfferTransport = () => {
    // Navigate to the offer-drive page
    router.push("/offer-drive");
  };

  const TransportButtons = () => (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <Button className="flex-1 py-8 text-xl" variant="secondary">
        <Search className="mr-2 size-6" />
        Намери транспорт
      </Button>
      <Button
        className="flex-1 py-8 text-xl"
        variant="default"
        onClick={handleOfferTransport}
      >
        <Car className="mr-2 size-6" />
        Предложи транспорт
      </Button>
    </div>
  );

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      id="transport-options-container"
    >
      {/* Mobile view */}
      <div className="fixed inset-0 z-50 flex flex-col md:hidden">
        <div className="p-6 pb-0 text-center">
          <h1 className="text-lg font-bold">
            Без Градски - Споделено пътуване
          </h1>
        </div>
        <TransportButtons />
      </div>

      {/* Desktop view */}
      <div className="fixed inset-0 z-40 hidden md:block">
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
          <DialogContent
            className="hidden flex-col sm:max-w-md lg:flex"
            hideXIcon
            overlayClassName="hidden lg:flex"
          >
            <DialogTitle className="text-center text-xl font-bold">
              Без Градски - Споделено пътуване
            </DialogTitle>
            <TransportButtons />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
