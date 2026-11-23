import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { LegalNotice } from "@/components/site/Legal";

export const Route = createFileRoute("/avis-legal")({ head: () => seoHead("legal"), component: Page });

function Page() {
  usePageSeo("legal");
  const { t, lang } = useI18n();
  return (
    <>
      <PageHero title={t.footer.legal} />
      <article className="container-page max-w-3xl">
        <LegalNotice lang={lang} />
      </article>
    </>
  );
}
