import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useI18n, formatEUR } from "@/lib/i18n";
import { roseLine } from "@/lib/pricing";
import colab from "@/assets/logo-colaboracio.png.asset.json";

/** First block of the rose catalog: title, explanation, highlighted price and the quote CTA. */
export function CatalogHero() {
  const { t, lang } = useI18n();
  const unitGross = roseLine(1).unitGross;
  return (
    <section className="container-page pt-7 pb-2 md:pt-12 md:pb-4">
      <p className="eyebrow">{t.common.deliveryDates}</p>
      <span aria-hidden className="senyera-rule mt-3 block" />
      <h1 className="mt-4 max-w-4xl font-display text-[2.05rem] leading-[1.08] sm:text-5xl md:text-[3.4rem]">{t.imported.heroTitle}</h1>
      <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted-foreground md:text-lg">{t.imported.heroText}</p>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-leaf">{t.imported.heroRoses}</span>
        <span aria-hidden className="text-muted-foreground">·</span>
        <span className="font-display text-3xl leading-none md:text-4xl">{formatEUR(unitGross, lang)}</span>
        <span className="text-sm text-muted-foreground">{t.imported.heroPerUnit}, {t.common.vatIncl}</span>
      </p>
      <Link to="/pressupost" className="btn btn-primary mt-6">{t.imported.heroCta}</Link>
    </section>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="container-page pt-10 pb-6 md:pt-14">
      {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
      <h1 className="mt-2 max-w-4xl font-display text-4xl leading-[1.05] md:text-5xl">{title}</h1>
      {children}
    </section>
  );
}

export function QuoteCTA({ label }: { label?: string }) {
  const { t } = useI18n();
  return <Link to="/pressupost" className="btn btn-primary">{label ?? t.cta.quote}</Link>;
}

export function ColabLogo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`rounded-lg bg-paper p-6 md:p-10 ${className}`}>
      <img src={colab.url} alt={t.foundation.logoAlt} width={1761} height={661} loading="lazy" className="mx-auto h-auto w-full max-w-xl" />
    </div>
  );
}

export function ClosingBand({ title, text, cta }: { title: string; text: string; cta?: string }) {
  return (
    <section className="container-page mt-14">
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-paper px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <h2 className="font-display text-3xl leading-tight">{title}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{text}</p>
        </div>
        <Link to="/pressupost" className="btn btn-primary shrink-0">{cta}</Link>
      </div>
    </section>
  );
}
