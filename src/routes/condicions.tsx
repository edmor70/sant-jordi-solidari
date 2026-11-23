import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { Terms } from "@/components/site/Legal";

export const Route = createFileRoute("/condicions")({ head: () => seoHead("terms"), component: Page });

function Page() {
  usePageSeo("terms");
  const { t, lang } = useI18n();
  return (
    <>
      <PageHero title={t.footer.terms} />
      <article className="container-page max-w-3xl">
        <Terms lang={lang} />
      </article>
    </>
  );
}
