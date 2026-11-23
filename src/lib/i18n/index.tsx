import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ca, type Dict } from "./ca";
import { es } from "./es";

export type Lang = "ca" | "es";
const DICTS: Record<Lang, Dict> = { ca, es };
const KEY = "sjs-lang";

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: "ca", t: ca, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ca");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "es" || saved === "ca") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  }, []);
  return <Ctx.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function formatEUR(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
}
export function formatPct(r: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES", { style: "percent", maximumFractionDigits: 1 }).format(r);
}
