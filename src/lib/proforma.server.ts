import { officialInvoicePdf } from './official-invoice.server';
import { operationDocumentNumber, paymentSchedule, type PaymentPlan } from './payment-plan';
import type { Summary } from './pricing';
export async function generatePaymentDocuments(input:{reference:string;date:string;plan:PaymentPlan;sequence?:number;customer:{name:string;taxId:string;address:string;email:string};summary:Summary},origin:string){
 const s=input.summary;const total=s.grandTotal;if(total===null||total<=0)throw new Error('tax_or_shipping_pending');
 const seq=Math.max(1,Math.min(9999,input.sequence??1));
 const schedule=paymentSchedule(total,input.plan,input.reference,input.date);
 return Promise.all(schedule.slice(0,1).map(async(p)=>{
  const docNum=operationDocumentNumber(seq,input.plan,input.plan==='split'?'advance':'single');
  const ratio=p.amount/total;
  const base=Math.round(s.roses.base*ratio*100)/100;
  const shipping=s.shippingTax;const shipBase=shipping?Math.round(shipping.base*ratio*100)/100:0;
  const vat=Math.round((p.amount-base-shipBase)*100)/100;
  const roseVat=shipping?Math.round(s.roses.vat*ratio*100)/100:vat;
  return {reference:docNum,dueDate:p.dueDate,amount:p.amount,bytes:await officialInvoicePdf({number:docNum,reservation:input.reference,issuedDate:input.date,customer:input.customer,summary:s,base:base+shipBase,vat,total:p.amount,dueDate:p.dueDate,paid:0,stage:input.plan==='split'?'advance':'single',test:false,proforma:true},origin)};
 }));
}
