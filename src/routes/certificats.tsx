import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { Download } from "lucide-react";
import { CAMPAIGN } from "@/lib/campaign";
const letterPage = "/carta-suport-page-1.jpg";
export const Route = createFileRoute("/certificats")({ head: () => seoHead("certificates"), component: Certificates });
function Certificates() {
  usePageSeo("certificates");
  const { t } = useI18n();
  const c = t.imported;
  const f = t.foundation;
  return (
    <>
      <PageHero eyebrow={c.transparency} title={c.certificates} />
      <section className="container-page">
        <Link to="/colaboracio" className="link">{c.back}</Link>
        <div className="mt-8 grid max-w-4xl gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-10">
          <a href="/carta-de-suport" target="_blank" rel="noopener noreferrer" aria-label={`${f.letter} (${f.letterNewTab})`} className="block w-full max-w-sm self-start border border-border bg-paper transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <img src={letterPage} alt={f.letterAlt} width={1240} height={1755} className="h-auto w-full" />
          </a>
          <div className="space-y-5">
            <h2 className="font-display text-3xl">{f.letterPageTitle}</h2>
            <p className="leading-relaxed text-muted-foreground">{f.letterDesc}</p>
            <div>
              <a href={CAMPAIGN.supportLetter.url} download="carta-suport-fjc-2027.pdf" className="btn btn-outline"><Download className="h-4 w-4" aria-hidden /> {f.letterPdf}</a>
            </div>
          </div>
        </div>
        <article className="mt-10 max-w-3xl space-y-5 border-t border-border pt-8 text-lg leading-relaxed">
          <h2 className="font-display text-3xl">{c.certificateHeading}</h2><p>{c.certificateP1}</p><p>{c.certificateP2}</p>
          <h2 className="border-t border-border pt-6 font-display text-3xl">{c.transparencyHeading}</h2><p>{c.transparencyBody}</p><p className="text-muted-foreground">{c.certificatesPending}</p>
        </article>
      </section>
    </>
  );
}
