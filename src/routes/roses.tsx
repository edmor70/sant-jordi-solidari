import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { Catalog } from "@/components/site/Catalog";
import { PageHero } from "@/components/site/Bits";
export const Route = createFileRoute("/roses")({ head: () => seoHead("products"), component: Products });
function Products() { usePageSeo("products"); const { t } = useI18n(); return <><PageHero title={t.products.title}><p className="mt-4">{t.imported.catalogLead}</p></PageHero><Catalog /></>; }
