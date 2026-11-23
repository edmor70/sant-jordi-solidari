import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import singleUrl from '@/assets/factura-pago_unico-iban.pdf?url';
import advanceUrl from '@/assets/factura-anticipo-iban.pdf?url';
import finalUrl from '@/assets/factura-final-iban.pdf?url';
import { CAMPAIGN } from './campaign';
import { invoiceModelCopy } from './i18n/invoice-model';
import type { Summary } from './pricing';
export type OfficialDocumentInput = {
  number: string; reservation: string; stage: 'single' | 'advance' | 'final';
  issuedDate: string; dueDate: string; operationDate?: string; base: number; vat: number; total: number;
  paid: number; advanceNumber?: string; advanceBase?: number; advanceVat?: number;
  customer: {name: string; taxId: string; address: string; email: string; postalCode?: string; city?: string};
  summary: Summary; test: boolean; proforma?: boolean;
};
export async function officialInvoicePdf(d: OfficialDocumentInput, origin: string) {
  if (!d.test && !d.proforma) throw new Error('production_invoicing_locked');
  const assetUrl = d.stage === 'single' ? singleUrl : d.stage === 'advance' ? advanceUrl : finalUrl;
  const response = await fetch(new URL(assetUrl, origin));
  if (!response.ok) throw new Error('invoice_template_missing');
  const pdf = await PDFDocument.load(await response.arrayBuffer());
  const form = pdf.getForm(), font = await pdf.embedFont(StandardFonts.Helvetica);
  const clean = (value: string) => Array.from(value.replace(/[\r\n\t]/g, ' '), c => { try { font.encodeText(c); return c; } catch { return '?'; } }).join('');
  const set = (key: string, value: string) => {
    const field = form.getTextField(key), text = clean(value);
    const width = field.acroField.getWidgets()[0]?.getRectangle().width ?? 100;
    field.setText(text); field.setFontSize(Math.max(5, Math.min(8, 8 * (width - 5) / Math.max(1, font.widthOfTextAtSize(text, 8)))));
  };
  const eur = (n: number) => n.toFixed(2).replace('.', ',');
  const date = (s: string) => s ? new Date(`${s.slice(0,10)}T12:00:00Z`).toLocaleDateString('es-ES',{timeZone:'Europe/Madrid'}) : '';
  const s = d.summary, r = s.roses, ship = s.shippingTax;
  const rates = [...new Set([r.vatRate, ...(ship && ship.base ? [ship.vat / ship.base] : [])])].map(n => `${Math.round(n*10000)/100} %`).join(' / ');
  const values: Record<string,string> = {
    'Número correlativo de factura': d.number, 'Fecha de expedición': date(d.issuedDate),
    'Fecha límite de pago': date(d.dueDate) + (d.stage === 'final' ? ' · 23:59' : ''), 'Referencia de reserva': d.reservation,
    'Razón social del cliente': d.customer.name, 'NIF del cliente': d.customer.taxId, 'Domicilio fiscal del cliente': d.customer.address,
    'Código postal y localidad del cliente': [d.customer.postalCode,d.customer.city].filter(Boolean).join(' '), 'Email del cliente': d.customer.email,
    'Unidades de rosas': String(r.qty), 'Precio unitario sin IVA de rosas': eur(r.unitBase), 'Tipo de IVA de rosas': `${r.vatRate*100} %`, 'Base de rosas': eur(r.base),
    'Unidades de transporte': ship ? String(s.shipping.length) : '0', 'Precio unitario sin IVA de transporte': ship ? s.shipping.map(c=>eur(c??0)).join(' + ') : '0,00', 'Tipo de IVA de transporte': ship?.base ? `${Math.round(ship.vat/ship.base*10000)/100} %` : '0 %', 'Base de transporte': eur(ship?.base ?? 0),
    'Base del pedido': eur(r.base+(ship?.base ?? 0)), 'Cuota de IVA del pedido': eur(r.vat+(ship?.vat ?? 0)), 'Total de rosas con IVA': eur(r.total), 'Total de transporte con IVA': eur(ship?.total ?? 0), 'Total del pedido con IVA': eur(s.grandTotal ?? 0),
    'Base imponible de esta factura': eur(d.base), 'Cuota de IVA de esta factura': eur(d.vat), 'Tipo de IVA de esta factura': rates, 'Importe total de esta factura': eur(d.total),
    'Modalidad de entrega': s.mode === 'pickup' ? invoiceModelCopy.es.pickup : invoiceModelCopy.es.delivery,
    'Fecha de operación o pago anticipado, si distinta': date(d.operationDate ?? ''),
  };
  if (d.stage === 'final') Object.assign(values, {'N.º de factura de anticipo':d.advanceNumber ?? '', 'Base del anticipo (€)':eur(d.advanceBase ?? 0), 'IVA del anticipo (€)':eur(d.advanceVat ?? 0), 'Anticipo previamente abonado':eur(d.paid)});
  else values['Saldo restante tras este pago'] = eur((s.grandTotal ?? 0)-d.total);
  for (const [key,value] of Object.entries(values)) set(key,value);
  form.updateFieldAppearances(font); form.flatten();
  const page = pdf.getPage(0);
  // Correct only the previously confirmed street name; retain official artwork and conditions.
  page.drawRectangle({x:41,y:637.5,width:286,height:18,color:rgb(1,1,1)});
  page.drawText(clean(CAMPAIGN.company.address.es),{x:42,y:643,size:9.3,font});
  page.drawText(d.proforma ? invoiceModelCopy.es.invalid : invoiceModelCopy.es.test,{x:42,y:49,size:8,font});
  pdf.setTitle(`${d.proforma ? invoiceModelCopy.es.proforma : invoiceModelCopy.es.test} ${d.number}`);
  return pdf.save();
}