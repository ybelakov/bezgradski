import "~/styles/globals.css";

import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  const locale = await getLocale();
  return {
    title: t("app_title"),
    description: t("app_description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    openGraph: {
      title: t("app_title"),
      description: t("app_description"),
      type: "website",
      locale: `${locale}_BG`,
      url: "https://bezgradski.bg",
      siteName: t("app_name"),
      images: [
        {
          url: "/og-image.png", // You'll need to add this image to your public folder
          width: 1200,
          height: 630,
          alt: t("og_image_alt"),
        },
      ],
    },
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <HydrateClient>
            <SessionProvider>
              <NextIntlClientProvider locale={locale}>
                <Toaster />
                <main className="h-full w-full">{children}</main>
              </NextIntlClientProvider>
            </SessionProvider>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
