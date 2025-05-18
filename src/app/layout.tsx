import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Без градски - намери превоз",
  description:
    "Намери или предложи превоз в България. Споделено пътуване без градски транспорт.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Без градски - намери превоз",
    description:
      "Намери или предложи превоз в София. Споделено пътуване без градски транспорт.",
    type: "website",
    locale: "bg_BG",
    url: "https://bezgradski.bg",
    siteName: "Без градски",
    images: [
      {
        url: "/og-image.png", // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Без градски - споделено пътуване",
      },
    ],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <HydrateClient>
            <SessionProvider>
              <Toaster />
              <main className="h-full w-full">{children}</main>
            </SessionProvider>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
