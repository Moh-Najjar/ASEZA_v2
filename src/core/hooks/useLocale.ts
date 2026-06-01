import { useTranslation } from "react-i18next";
import { isRtl } from "../../i18n/languages";

export interface UseLocaleReturn {
  /** true when the active language is Arabic (RTL) */
  isAr: boolean;
  /** react-i18next t() for keyed translations */
  t: ReturnType<typeof useTranslation>["t"];
  /**
   * Returns the Arabic value when the active language is Arabic,
   * otherwise returns the English value.
   * Use this for bilingual fields on FormField / ColumnDef
   * (e.g. loc(field.labelEn, field.labelAr)).
   */
  loc: (enVal: string, arVal: string) => string;
}

/** Thin wrapper around useTranslation that adds the loc() bilingual helper */
export const useLocale = (): UseLocaleReturn => {
  const { t, i18n } = useTranslation();
  const isAr = isRtl(i18n.language);

  const loc = (enVal: string, arVal: string): string =>
    isAr ? arVal : enVal;

  return { isAr, t, loc };
};
