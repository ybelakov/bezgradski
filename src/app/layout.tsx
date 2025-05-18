import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Без градски - намери превоз",
  description: "Без градски",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
