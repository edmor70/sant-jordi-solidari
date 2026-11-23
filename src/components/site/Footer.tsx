import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { CAMPAIGN } from "@/lib/campaign";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 bg-leaf text-leaf-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Sant Jordi Solidari Barcelona</p>
          <p className="mt-3 max-w-xs text-sm opacity-85">{t.footer.tagline}</p>
        </div>
        <div className="text-sm">
          <Link to="/contacte" className="font-semibold hover:underline">{t.footer.contact}</Link>
          <p className="mt-2 opacity-85">{CAMPAIGN.company.name}</p>
          <a className="mt-1 inline-block underline underline-offset-2" href={`mailto:${CAMPAIGN.contactEmail}`}>{CAMPAIGN.contactEmail}</a>
        </div>
        <nav aria-label="Legal" className="text-sm">
          <ul className="space-y-2">
            <li><Link to="/avis-legal" className="underline-offset-2 hover:underline">{t.footer.legal}</Link></li>
            <li><Link to="/privacitat" className="underline-offset-2 hover:underline">{t.footer.privacy}</Link></li>
            <li><Link to="/condicions" className="underline-offset-2 hover:underline">{t.footer.terms}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-leaf-foreground/15">
        <p className="container-page py-5 text-xs opacity-75">© {new Date().getFullYear()} {CAMPAIGN.company.name}. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
