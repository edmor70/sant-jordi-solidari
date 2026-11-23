import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, formatEUR } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { CAMPAIGN } from "@/lib/campaign";
import { donationAmount } from "@/lib/pricing";
export const Route = createFileRoute("/impacte")({ head: () => seoHead("impact"), component: Impact });
function Impact() {
  usePageSeo("impact");
  const { t, lang } = useI18n();
  const c = t.imported;
  const amount = formatEUR(CAMPAIGN.donation.perRose, lang);
  const number = new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES");
  const share = new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES", { style: "percent", maximumFractionDigits: 2 }).format(CAMPAIGN.donation.profitShare);
  return <>
    <PageHero eyebrow={c.commitment} title={c.donationTitle(amount)} />
    <section className="container-page">
      <Link to="/colaboracio" className="link">{c.back}</Link>
      <div className="mt-8 max-w-3xl border-y border-border py-6">
        <p className="font-display text-5xl text-primary">{amount}</p>
        <p className="mt-3 text-lg">{c.donationIntro}</p>
      </div>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed">{c.donationDetail(share)}</p>
      <div className="mt-9 max-w-3xl">
        <h2 className="font-display text-3xl">{c.donationTableTitle}</h2>
        <table className="mt-5 w-full table-fixed border-y border-border text-sm sm:text-base">
          <thead className="bg-accent text-accent-foreground"><tr><th scope="col" className="px-4 py-4 text-left font-semibold">{c.donationRoses}</th><th scope="col" className="px-4 py-4 text-right font-semibold">{c.donationEffective}</th></tr></thead>
          <tbody>{CAMPAIGN.donation.tableQuantities.map(qty => <tr key={qty} className="border-t border-border even:bg-paper"><td className="px-4 py-3 tabular-nums">{number.format(qty)}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEUR(donationAmount(qty), lang)}</td></tr>)}</tbody>
        </table>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.donationNote(amount)}</p>
      </div>
    </section>
  </>;
}
