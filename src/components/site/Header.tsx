import { CAMPAIGN } from "@/lib/campaign";
import { Link } from "@tanstack/react-router";
import { Menu, ChevronDown } from "lucide-react";
const logo = "/logo-rosa.png";
import { useI18n, formatEUR, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return <div role="group" aria-label={t.langName} className="flex rounded-full border border-border bg-paper p-0.5 text-xs font-semibold">{(["ca", "es"] as Lang[]).map(l => <Button key={l} variant="ghost" size="sm" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l} className={`min-h-8 min-w-9 rounded-full px-2 uppercase ${lang === l ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-foreground hover:bg-muted"}`}>{l}</Button>)}</div>;
}
export function Header() {
 const { t, lang } = useI18n(); const c = t.imported;
 const principal = [{ to: "/", label: t.nav.home }, { to: "/pressupost", label: c.reservations }] as const;
 const solidarity = [{ to: "/colaboracio", label: c.mainPage }, { to: "/fundacio", label: t.nav.foundation }, { to: "/impacte", label: c.donationTitle(formatEUR(CAMPAIGN.donation.perRose, lang)) }, { to: "/certificats", label: c.certificates }] as const;
 const legal = [{ to: "/avis-legal", label: t.footer.legal }, { to: "/privacitat", label: t.footer.privacy }, { to: "/condicions", label: t.footer.terms }] as const;
 return <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
  <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">{t.skip}</a>
  <div className="container-page flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 py-3">
   <Link to="/" className="flex min-w-0 items-center gap-2"><img src={logo} alt="" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" /><span className="max-w-48 font-display text-xl leading-tight sm:max-w-none sm:text-2xl">{c.projectName}</span></Link>
   <div className="ml-auto flex items-center gap-2"><LangSwitch /><Button asChild className="min-h-10 shadow-none"><Link to="/pressupost"><span className="hidden md:inline">{t.cta.quote}</span><span className="md:hidden">{t.cta.quoteShort}</span></Link></Button></div>
  </div>
  <div className="border-t border-border"><nav aria-label={c.principal} className="container-page flex min-h-11 items-center justify-center gap-5 py-1">
   <div className="hidden items-center gap-5 lg:flex">{[...principal, { to: "/colaboracio", label: c.collaboration }, { to: "/avis-legal", label: t.footer.legal }, { to: "/contacte", label: c.contact }].map(l => <Link key={l.to} to={l.to} activeOptions={{ exact: true }} activeProps={{ className: "text-primary", "aria-current": "page" }} className="whitespace-nowrap py-2 text-sm font-medium hover:text-primary">{l.label}</Link>)}</div>
   <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 text-primary"><Menu aria-hidden /><span>{c.allPages}</span><ChevronDown aria-hidden /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-2 shadow-none">
    <DropdownMenuLabel className="text-xs text-muted-foreground">{c.principal}</DropdownMenuLabel>{principal.map(l => <DropdownMenuItem key={l.to} asChild><Link to={l.to} className="min-h-10">{l.label}</Link></DropdownMenuItem>)}
    <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs text-muted-foreground">{c.collaboration}</DropdownMenuLabel>{solidarity.map((l,i) => <DropdownMenuItem key={l.to} asChild><Link to={l.to} className={`min-h-10 ${i ? "pl-5" : ""}`}>{l.label}</Link></DropdownMenuItem>)}
    <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs text-muted-foreground">{c.legalGroup}</DropdownMenuLabel>{legal.map(l => <DropdownMenuItem key={l.to} asChild><Link to={l.to} className="min-h-10">{l.label}</Link></DropdownMenuItem>)}
    <DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/contacte" className="min-h-10">{c.contactUs}</Link></DropdownMenuItem>
   </DropdownMenuContent></DropdownMenu>
  </nav></div>
 </header>;
}
