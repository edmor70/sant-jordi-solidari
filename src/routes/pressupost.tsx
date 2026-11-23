import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { QuoteForm } from "@/components/quote/QuoteForm";

export const Route = createFileRoute("/pressupost")({ head: () => seoHead("quote"), component: QuotePage });

function QuotePage() {
  usePageSeo("quote");
  const { t } = useI18n();
  return (
    <>
      <PageHero eyebrow={t.common.date} title={t.quote.title}><p className="mt-5 max-w-2xl text-lg">{t.quote.lead}</p></PageHero>
      <section className="container-page"><QuoteForm /></section>
    </>
  );
}
