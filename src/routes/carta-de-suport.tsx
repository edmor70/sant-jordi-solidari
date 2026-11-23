import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { seoHead, usePageSeo } from "@/lib/i18n/seo";
import { CAMPAIGN } from "@/lib/campaign";
import letterPage from "@/assets/carta-suport-page-1.jpg";

export const Route = createFileRoute("/carta-de-suport")({ head: () => seoHead("letter"), component: SupportLetter });

// Shown as an image so it opens everywhere (some browser tabs refuse to display PDFs).
function SupportLetter() {
  usePageSeo("letter");
  const { t } = useI18n();
  const f = t.foundation;
  return (
    <section className="container-page py-10">
      <h1 className="font-display text-3xl md:text-4xl">{f.letterPageTitle}</h1>
      <div className="mt-5 flex flex-wrap gap-4">
        <a href={CAMPAIGN.supportLetter.url} download="carta-suport-fjc-2027.pdf" className="btn btn-outline">
          <Download className="h-4 w-4" aria-hidden /> {f.letterPdf}
        </a>
        <Link to="/certificats" className="link inline-flex items-center gap-2 self-center">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {f.letterBack}
        </Link>
      </div>
      <img src={letterPage} alt={f.letterAlt} width={1240} height={1755} className="mt-8 w-full max-w-3xl border border-border bg-paper" />
    </section>
  );
}
