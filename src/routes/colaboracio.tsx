import { CAMPAIGN } from "@/lib/campaign";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, formatEUR } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { PageHero, ColabLogo } from "@/components/site/Bits";
import { Heart, ArrowRight, FileCheck, Flower2 } from "lucide-react";
export const Route = createFileRoute("/colaboracio")({ head: () => seoHead("collaboration"), component: Collaboration });
function Collaboration() {
 usePageSeo("collaboration"); const { t, lang } = useI18n(); const c = t.imported;
 const items = [{ to: "/fundacio", title: c.withWhom, text: c.foundationIntro, label: c.foundationLink, icon: Heart }, { to: "/impacte", title: c.donationTitle(formatEUR(CAMPAIGN.donation.perRose, lang)), text: c.donationIntro, label: c.impactLink, icon: Flower2 }, { to: "/certificats", title: c.certificates, text: c.certificatesIntro, label: c.more, icon: FileCheck }] as const;
 return <><PageHero eyebrow={c.commitment} title={c.collaboration}><p className="mt-4 max-w-3xl text-lg leading-relaxed">{c.collaborationLead}</p></PageHero><section className="container-page"><ColabLogo /><div className="mt-8 grid gap-7 md:grid-cols-3">{items.map(x => <article key={x.to} className="border-t border-border py-6"><x.icon className="mb-4 size-7 text-primary" aria-hidden /><h2 className="font-display text-3xl">{x.title}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{x.text}</p><Link to={x.to} className="link mt-5 inline-flex items-center gap-2">{x.label}<ArrowRight className="size-4" aria-hidden /></Link></article>)}</div></section></>;
}
