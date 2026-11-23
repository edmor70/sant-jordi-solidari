import { createFileRoute } from "@tanstack/react-router";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { Catalog } from "@/components/site/Catalog";
import { CatalogHero } from "@/components/site/Bits";
export const Route = createFileRoute("/")({ head: () => seoHead("home"), component: Home });
function Home() {
 usePageSeo("home");
 return <><CatalogHero /><Catalog /></>;
}
