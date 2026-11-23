import { fillInvoiceModel } from './invoice-model.server';
import { CAMPAIGN } from './campaign';
import type { Database } from '@/integrations/supabase/types';

export async function invoicePdf(invoice: Database['public']['Tables']['billing_invoices']['Row'], origin: string, lang: 'es' | 'ca' = 'es') {
  const snapshot = invoice.snapshot as unknown as { issuer:{name:string;nif:string;address:string};customer:{name:string;taxId:string;address:string;email:string};lines:{description:string;quantity:number;unitBase:number;discountPct:number;vatRate:number;base:number;vat:number;advanceNumber?:string}[] };
  return fillInvoiceModel({reference:invoice.number,issuedDate:invoice.issued_at.slice(0,10),operationDate:invoice.operation_date,reservationReference:invoice.order_id,customer:snapshot.customer,lines:snapshot.lines,base:invoice.base,vat:invoice.vat,total:invoice.total,dueDate:invoice.kind==='advance'?invoice.issued_at.slice(0,10):CAMPAIGN.payment.balanceDeadlineISO,paid:invoice.kind==='advance'?invoice.total:0,notes:invoice.reason,proforma:false},origin,lang);
}