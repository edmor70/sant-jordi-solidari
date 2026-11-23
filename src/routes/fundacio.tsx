import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { CAMPAIGN } from "@/lib/campaign";
import { ColabLogo, PageHero, QuoteCTA } from "@/components/site/Bits";

export const Route = createFileRoute("/fundacio")({ head: () => seoHead("foundation"), component: Foundation });

function Foundation() {
  usePageSeo("foundation");
  const { t } = useI18n();
  const f = t.foundation;
  return (
    <>
      <PageHero eyebrow={`Sant Jordi ${CAMPAIGN.year}`} title={f.title} />
      <section className="container-page"><Link to="/colaboracio" className="link">{t.imported.back}</Link><div className="mt-6"><ColabLogo className="border border-border" /></div></section>
      <section className="container-page mt-8"><div className="max-w-3xl space-y-5 text-lg leading-relaxed"><h2 className="font-display text-3xl">{t.imported.withWhom}</h2><p>{t.imported.foundationP1}</p><p>{t.imported.foundationP2}</p><p>{t.imported.foundationP3}</p></div></section>
      <section className="container-page mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <blockquote className="font-display text-2xl leading-snug md:text-3xl">{t.imported.tradition} {t.imported.impactBody}</blockquote>
        <div className="space-y-5">
          <a href={CAMPAIGN.foundationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">{f.know} <ExternalLink className="h-4 w-4" aria-hidden /></a>
        </div>
      </section>
      <div className="container-page mt-12"><QuoteCTA /></div>
    </>
  );
}
