import type { Summary } from './pricing';
export const NOTION_INVOICES_SOURCE='41d2b86b-e8a4-81c8-8d3f-000b6d9c4069';
export type NotionInvoiceInput={number:string;reference:string;customer:{name:string;taxId:string;email:string};plan:'single'|'split';stage:'single'|'advance'|'final';base:number;vat:number;total:number;paid:number;issuedDate:string;dueDate:string;state:'pendiente'|'pagada'|'anulada';summary:Summary};
/** Test documents use a prefixed key so they can never collide with a future fiscal number in the same table. */
export const notionInvoiceNumber=(number:string,test:boolean)=>test?`PRUEBA-${number}`:number;
export const notionInvoiceFilename=(number:string,test:boolean)=>`${notionInvoiceNumber(number,test)}.pdf`;
/** Actual existing schema (Factura, Número de factura, Estado, PDF): extra detail belongs in the page body, never schema edits. */
export function invoiceNotionProperties(d:NotionInvoiceInput,test=false){
 const key=notionInvoiceNumber(d.number,test);
 return {'Factura':{title:[{text:{content:`${test?'PRUEBA · SIN VALIDEZ FISCAL · ':''}${key} · ${d.reference} · ${d.customer.name}`}}]},'Número de factura':{rich_text:[{text:{content:key}}]},'Estado':{rich_text:[{text:{content:d.state}}]}};
}
export function invoiceNotionDetail(d:NotionInvoiceInput){
 return JSON.stringify({reserva:d.reference,cliente:d.customer,modalidad:d.plan==='split'?'fraccionado':'único',tipo:d.stage==='single'?'U':d.stage==='advance'?'M.1':'M.2',base:d.base,iva:d.vat,total:d.total,abonado:d.paid,pendiente:Math.round((d.total-d.paid)*100)/100,emision:d.issuedDate,vencimiento:d.dueDate,estado:d.state,transporte:d.summary.shipping},null,2);
}
