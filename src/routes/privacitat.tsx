import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero } from "@/components/site/Bits";
import { Privacy } from "@/components/site/Legal";

export const Route = createFileRoute("/privacitat")({ head: () => seoHead("privacy"), component: Page });

function Page() {
  usePageSeo("privacy");
  const { t, lang } = useI18n();
  return (
    <>
      <PageHero title={t.footer.privacy} />
      <article className="container-page max-w-3xl">
        <Privacy lang={lang} />
      </article>
    </>
  );
}
