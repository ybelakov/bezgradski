import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale } from "~/i18n/locales";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const cookies_ = await cookies();
  const locale = cookies_.get("BEZGRADSKI_LOCALE")?.value ?? defaultLocale;
  const messages = (
    (await import(`~/messages/${locale}.json`)) as Record<string, unknown>
  ).default as Record<string, unknown>;

  return {
    locale,
    messages,
  };
});
