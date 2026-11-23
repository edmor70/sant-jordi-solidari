import { it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { invoicePdf } from './billing-pdf.server';
import type { Database } from '@/integrations/supabase/types';
vi.mock('./draft.server', () => ({ loadDraftAssets: vi.fn().mockRejectedValue(new Error('missing_asset')) }));
it('generates a readable test PDF even when imported brand assets are missing', async () => {
  const invoice: Database['public']['Tables']['billing_invoices']['Row'] = {
    id:'00000000-0000-0000-0000-000000000001', order_id:'00000000-0000-0000-0000-000000000002', event_id:'00000000-0000-0000-0000-000000000003', actor:'00000000-0000-0000-0000-000000000004',
    is_test:true,series:'F',fiscal_year:2027,sequence_number:1,number:'TEST-F-2027-0001',kind:'advance',issued_at:'2027-04-01T12:00:00Z',operation_date:'2027-03-31',original_invoice_id:null,reason:'',base:75,vat:7.5,total:82.5,
    snapshot:{issuer:{name:'Sant Jordi Solidari Barcelona S.L.',nif:'B05857750',address:'Calle Maria Llimona, 5, puerta 5, 08019 Barcelona'},customer:{name:'EMPRESA FICTICIA',taxId:'TEST-NO-VALIDO',address:'DOMICILIO FICTICIO',email:'prueba@example.invalid'},lines:[{description:'Rosas naturales de Sant Jordi',quantity:50,unitBase:3,discountPct:0,vatRate:.1,base:75,vat:7.5}]},
  };
  const bytes=await invoicePdf(invoice,'http://localhost:8080');
  const pdf=await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBe(1);
  expect(bytes.length).toBeGreaterThan(1500);
});