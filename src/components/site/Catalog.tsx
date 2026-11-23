import { Link } from "@tanstack/react-router";
import { useI18n, formatEUR, formatPct } from "@/lib/i18n";
import { CAMPAIGN } from "@/lib/campaign";
import { roseLine } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
export function Catalog() {
 const { t, lang } = useI18n(); const p = t.products; const u = roseLine(1);
 return (      <section className="container-page grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <article className="overflow-hidden rounded-lg bg-paper md:grid md:grid-cols-2">
          <figure className="relative">
            <img src={CAMPAIGN.roseImage.src} alt={p.roseName} width={1280} height={1600} loading="lazy" className="h-full max-h-[34rem] w-full object-cover" />
            {!CAMPAIGN.roseImage.authorized && <figcaption className="absolute inset-x-0 bottom-0 bg-foreground/75 px-3 py-2 text-xs text-background">{t.common.illustrative}</figcaption>}
          </figure>
          <div className="p-7">
            <h2 className="font-display text-3xl">{p.roseName}</h2>
            <p className="mt-3">{p.roseDesc}</p>
            <p className="mt-6 font-display text-5xl">{formatEUR(u.unitBase, lang)} <span className="font-sans text-base">{t.common.plusVat}</span></p>
            <p className="text-sm">{t.common.perRose} · {t.common.transportApart}</p>
            <p className="mt-2 text-sm text-muted-foreground">{formatEUR(u.unitGross, lang)} · {t.common.vatIncl} ({formatPct(u.vatRate, lang)})</p>
            {!CAMPAIGN.rose.vatValidated && <p className="mt-1 text-xs text-muted-foreground">{p.vatPending}</p>}
            <Button asChild className="mt-5 shadow-none"><Link to="/pressupost">{t.imported.reservations}</Link></Button>
            <p className="mt-6 text-xs text-muted-foreground">{p.supplier}: <a href={CAMPAIGN.supplierUrl} target="_blank" rel="noopener noreferrer" className="underline">rosessantjordi.com</a>. {p.supplierNote}</p>
          </div>
        </article>
        <article className="h-fit overflow-hidden rounded-lg border border-border bg-paper">
          <a href={CAMPAIGN.bookmark.shopUrl} target="_blank" rel="noopener noreferrer" className="group block">
            <figure>
              <img src={CAMPAIGN.bookmark.photo} alt={p.bmAlt} width={1000} height={1119} loading="lazy" className="aspect-[1000/1119] max-h-[22rem] w-full object-cover" />
            </figure>
            <div className="p-7">
              <h2 className="font-display text-3xl group-hover:underline">{p.bmName}</h2>
              <p className="mt-3">{p.bmDesc}</p>
              <p className="mt-6 text-sm text-muted-foreground">{p.bmShop}</p>
              <span className="btn btn-outline mt-5 inline-flex">{p.bmBuy}</span>
            </div>
          </a>
        </article>
      </section>
);
}
