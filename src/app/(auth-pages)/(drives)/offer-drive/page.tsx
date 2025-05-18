"use client";
import { Map } from "~/app/_components/Map";

export default function OfferDrivePage() {
  return (
    <div
      className="w-full overflow-hidden pt-12"
      style={{
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <Map />
    </div>
  );
}
