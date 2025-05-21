import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { locales } from "~/i18n/locales";

export default function SelectLanguage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const handleLanguageChange = (value: string) => {
    document.cookie = `BEZGRADSKI_LOCALE=${value}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <>
      <Label className="mr-2">{t("select_language")}</Label>
      <Select onValueChange={handleLanguageChange} defaultValue={locale}>
        <SelectTrigger>
          <SelectValue placeholder={t("select_language")} />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {t(`language_${locale}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
