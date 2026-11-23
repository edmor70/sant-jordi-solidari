import { officialInvoicePdf } from './official-invoice.server';
import { paymentSchedule, type PaymentPlan } from './payment-plan';
import type { Summary } from './pricing';
export async function generatePaymentDocuments(input:{reference:string;date:string;plan:PaymentPlan;customer:{name:string;taxId:string;address:string;email:string};summary:Summary},origin:string){
 const s=input.summary;const total=s.grandTotal;if(total===null||total<=0)throw new Error('tax_or_shipping_pending');
 const schedule=paymentSchedule(total,input.plan,input.reference,input.date);
 return Promise.all(schedule.slice(0,1).map(async(p,i)=>{
  const ratio=p.amount/total;
  const base=Math.round(s.roses.base*ratio*100)/100;
  const shipping=s.shippingTax;const shipBase=shipping?Math.round(shipping.base*ratio*100)/100:0;
  const vat=Math.round((p.amount-base-shipBase)*100)/100;
  const roseVat=shipping?Math.round(s.roses.vat*ratio*100)/100:vat;
  const lines:{description:string;quantity:number;unitBase:number;vatRate:number;base:number;vat:number}[]=[{description:'Rosa natural de Sant Jordi',quantity:s.roses.qty,unitBase:s.roses.unitBase*ratio,vatRate:s.roses.vatRate,base,vat:roseVat}];
  if(shipping)lines.push({description:'Transporte',quantity:1,unitBase:shipBase,vatRate:shipping.base?shipping.vat/shipping.base:0,base:shipBase,vat:Math.round((vat-roseVat)*100)/100});
  return {reference:p.reference,dueDate:p.dueDate,amount:p.amount,bytes:await officialInvoicePdf({number:p.reference,reservation:input.reference,issuedDate:input.date,customer:input.customer,summary:s,base:base+shipBase,vat,total:p.amount,dueDate:p.dueDate,paid:0,stage:input.plan==='split'?'advance':'single',test:false,proforma:true},origin)};
 }));
}