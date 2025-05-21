export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bg";
