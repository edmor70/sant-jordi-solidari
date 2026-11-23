import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { CAMPAIGN } from "./campaign";
import { round2 } from "./pricing";
import { draftCopy } from "./i18n/draft";
import type { NoticeData } from "./notify.server";
import logo from "@/assets/logo-colaboracio.png.asset.json";
import unicode from "@/assets/draft-unicode.ttf.asset.json";

export async function generateDraft(d: NoticeData, assets: { font: Uint8Array; logo: Uint8Array }) {
  const lang = d.lang === "es" ? "es" : "ca";
  const t = draftCopy[lang];
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(assets.font, { subset: true });
  const image = await pdf.embedPng(assets.logo);
  const accent = rgb(169 / 255, 29 / 255, 62 / 255);
  const ink = rgb(36 / 255, 37 / 255, 34 / 255);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 794;
  const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;
  const text = (value: string, x = 42, size = 9, width = 511, color = ink) => {
    // Wrap long words as well as sentences; untrusted contact data is plain text.
    let line = "";
    for (const char of value.replace(/[\r\n\t]/g, " ")) {
      if (font.widthOfTextAtSize(line + char, size) > width) {
        if (y < 55) { page = pdf.addPage([595.28, 841.89]); y = 794; }
        page.drawText(line, { x, y, size, font, color }); y -= size + 5; line = "";
      }
      line += char;
    }
    if (y < 55) { page = pdf.addPage([595.28, 841.89]); y = 794; }
    page.drawText(line, { x, y, size, font, color }); y -= size + 5;
  };
  text(t.title, 42, 19, 310);
  if (t.invalid) text(t.invalid, 42, 10, 310, accent);
  text(`${t.reference}: ${d.reference}`, 42, 9, 310);
  text(`${t.date}: ${new Date(d.createdAt).toLocaleDateString(d.lang === "es" ? "es-ES" : "ca-ES", { timeZone: "Europe/Madrid" })}`, 42, 9, 310);
  const dim = image.scaleToFit(177, 80);
  page.drawImage(image, { x: 553 - dim.width, y: 794 - dim.height + 8, ...dim });
  y = Math.min(y - 22, 690);
  const top = y;
  text(t.issuer, 42, 10, 270, accent);
  text(CAMPAIGN.company.name, 42, 9, 270);
  text(`NIF ${CAMPAIGN.company.nif}`, 42, 9, 270);
  text(CAMPAIGN.company.address[lang], 42, 9, 270);
  text(CAMPAIGN.contactEmail, 42, 9, 270);
  const leftEnd = y;
  y = top;
  text(t.client, 337, 10, 216, accent);
  text(d.contact.company || t.pending, 337, 9, 216);
  text(`NIF: ${t.pending}`, 337, 9, 216);
  text(`${d.lang === "es" ? "Domicilio fiscal" : "Domicili fiscal"}: ${t.pending}`, 337, 9, 216);
  text(d.contact.fullName, 337, 9, 216);
  text(d.contact.email, 337, 9, 216);
  y = Math.min(y, leftEnd) - 22;
  const row = (values: string[], heading = false) => {
    if (y < 80) { page = pdf.addPage([595.28, 841.89]); y = 794; }
    const start = y;
    const xs = [42, 282, 342, 447, 501];
    const widths = [230, 50, 95, 44, 52];
    let bottom = start;
    values.forEach((v, i) => { y = start; text(v, xs[i], 8, widths[i], heading ? accent : ink); bottom = Math.min(bottom, y); });
    page.drawLine({ start: { x: 42, y: bottom + 3 }, end: { x: 553, y: bottom + 3 }, thickness: 0.5, color: accent });
    y = bottom - 16;
  };
  const s = d.summary;
  row([t.concept, t.units, t.unit, t.vat, t.base], true);
  row([t.roses, String(s.roses.qty), eur(s.roses.unitBase), `${s.roses.vatRate * 100} %`, eur(s.roses.base)]);
  if (s.shippingTax) row([t.transport, "1", eur(s.shippingTax.base), `${CAMPAIGN.shipping.vatRate * 100} %`, eur(s.shippingTax.base)]);
  y -= 9;
  text(`${t.base}: ${eur(s.roses.base)} · IVA: ${eur(s.roses.vat)}`);
  text(`${t.roses}, IVA ${d.lang === "es" ? "incluido" : "inclòs"}: ${eur(s.roses.total)}`);
  text(`${t.transport}: ${eur(s.shippingKnown)}${s.shippingPending ? ` + ${t.pending}` : ""}`);
  if (s.shippingTax) text(`${t.base} (${t.transport}): ${eur(s.shippingTax.base)} · IVA: ${eur(s.shippingTax.vat)}`);
  if (s.grandTotal !== null) {
    const deposit = round2(s.grandTotal * CAMPAIGN.payment.depositPct);
    text(`${t.total}: ${eur(s.grandTotal)}`, 42, 12, 511, accent);
    text(`${t.deposit}: ${eur(deposit)} · ${t.balance}: ${eur(round2(s.grandTotal - deposit))}`);
  } else text(t.taxes);
  if (!CAMPAIGN.rose.vatValidated) text(t.roseVat);
  y -= 9;
  if (d.mode === "pickup") text(t.pickup);
  else {
    text(t.delivery, 42, 10, 511, accent);
    for (const [i, dest] of d.destinations.entries()) {
      const slot = dest.slot ? t.slots[dest.slot as keyof typeof t.slots] : undefined;
      text(`${i + 1}. ${dest.street}, ${dest.postalCode} ${dest.city} · ${dest.roses} ${t.roses.toLowerCase()} · ${slot || t.pending} · ${t.transport}: ${dest.cost === null ? t.pending : eur(dest.cost)}`);
      if (dest.notes) text(dest.notes);
    }
  }
  y -= 12;
  text(t.payment, 42, 11, 511, accent);
  for (const p of [t.transfer, t.deadline, t.explanation, t.cancellation]) { text(p); y -= 5; }
  pdf.setTitle(`${t.title} ${d.reference}`);
  for (const [i, p] of pdf.getPages().entries()) p.drawText(`${d.reference} · ${i + 1}/${pdf.getPageCount()}`, { x: 42, y: 28, font, size: 8, color: ink });
  return pdf.save();
}

export async function loadDraftAssets(origin: string) {
  const load = async (url: string) => {
    const response = await fetch(new URL(url, origin), { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("pdf_asset_failed");
    return new Uint8Array(await response.arrayBuffer());
  };
  const [font, bytes] = await Promise.all([load(unicode.url), load(logo.url)]);
  return { font, logo: bytes };
}