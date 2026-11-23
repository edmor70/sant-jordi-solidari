import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
const templateUrl = "/factura-modelo.pdf";
import { CAMPAIGN } from './campaign';
import { invoiceModelCopy } from './i18n/invoice-model';
export type ModelData = {
 reference:string; issuedDate:string; operationDate:string; reservationReference:string;
 customer:{name:string;taxId:string;address:string;email:string;postalCode?:string;city?:string;provinceCountry?:string};
 lines:{description:string;quantity:number;unitBase:number;vatRate:number;base:number;vat:number}[];
 base:number;vat:number;total:number;dueDate:string;paid:number;notes:string;proforma:boolean;
};
export async function fillInvoiceModel(d:ModelData,origin:string,lang:'es'|'ca'='es') {
 const t=invoiceModelCopy[lang];
 const response=await fetch(new URL(templateUrl,origin)); if(!response.ok)throw new Error('invoice_template_missing');
 const pdf=await PDFDocument.load(await response.arrayBuffer());const form=pdf.getForm();const font=await pdf.embedFont(StandardFonts.Helvetica);
 const clean=(text:string)=>Array.from(text.replace(/[\r\n\t]/g,' '),c=>{try{font.encodeText(c);return c;}catch{return '?';}}).join('');
 const set=(key:string,value:string)=>{const field=form.getTextField(key);const text=clean(value);field.setText(text);const widget=field.acroField.getWidgets()[0];const width=widget?.getRectangle().width??100;field.setFontSize(Math.max(5,Math.min(8,8*(width-5)/Math.max(1,font.widthOfTextAtSize(text,8)))));};
 const eur=(n:number)=>n.toFixed(2).replace('.',',');
 const date=(s:string)=>s?new Date(`${s.slice(0,10)}T12:00:00Z`).toLocaleDateString('es-ES',{timeZone:'Europe/Madrid'}):t.pending;
 const values:Record<string,string>={'Serie y número':d.reference,'Fecha de emisión':date(d.issuedDate),'Fecha de operación':date(d.operationDate),'Referencia de pedido':d.reservationReference,'Razón social o nombre':d.customer.name,'NIF':d.customer.taxId||t.pending,'Domicilio fiscal':d.customer.address||t.pending,'Código postal':d.customer.postalCode||t.pending,'Municipio':d.customer.city||t.pending,'Provincia y país':d.customer.provinceCountry||t.pending,'IBAN':CAMPAIGN.payment.iban??invoiceModelCopy.ibanPending[lang],'Referencia de pago':d.reference,'Vencimiento o fecha de pago':date(d.dueDate),'Base imponible total':eur(d.base),'Tipo y cuota de IVA':eur(d.vat)+' €','Total factura EUR':eur(d.total),'Importe abonado (€)':eur(d.paid),'Pendiente de pago (€)':eur(d.total-d.paid),'Observaciones':d.notes};
 for(const [key,value]of Object.entries(values))set(key,value);
 const line=d.lines[0];if(line){set('Cantidad 1',String(line.quantity));set('Base línea 1',eur(line.base));}
 for(const i of [2,3]){const x=d.lines[i-1];set(`Cantidad ${i}`,x?String(x.quantity):'');set(`Precio unitario ${i}`,x?eur(x.unitBase):'');set(`Tipo IVA ${i}`,x?`${x.vatRate*100} %`:'');set(`Base línea ${i}`,x?eur(x.base):'');}
 set('Concepto adicional 2',d.lines[2]?.description??'');
 form.updateFieldAppearances(font);form.flatten();
 const page=pdf.getPage(0);const accent=rgb(169/255,29/255,62/255);
 // Preserve the supplied artwork, but never label payment requests as fiscal invoices.
 if(d.proforma){page.drawRectangle({x:38,y:776,width:250,height:45,color:rgb(1,1,1)});page.drawText(t.proforma,{x:43,y:788,size:27,font,color:accent});}
 page.drawText(clean(d.proforma?t.invalid:t.test),{x:43,y:774,size:7,font,color:accent});
 // The uploaded issuer address differs from the stored one; retain stored identification pending confirmation.
 page.drawRectangle({x:42,y:713,width:403,height:42,color:rgb(1,1,1)});
 page.drawText(clean(`NIF ${CAMPAIGN.company.nif} · ${CAMPAIGN.company.address[lang]}`),{x:43,y:740,size:8,font});
 page.drawText(CAMPAIGN.contactEmail,{x:43,y:725,size:9,font});
 if(line){page.drawRectangle({x:327,y:393,width:137,height:20,color:rgb(1,1,1)});page.drawText(eur(line.unitBase)+' €',{x:330,y:403,size:9,font});page.drawText(`${line.vatRate*100} %`,{x:417,y:403,size:9,font});}
 if(d.proforma){page.drawRectangle({x:310,y:199,width:140,height:23,color:accent});page.drawText(invoiceModelCopy.proformaTotal,{x:315,y:211,size:10,font,color:rgb(1,1,1)});}
 if(d.lines.length>3){const extra=pdf.addPage();extra.drawText(t.rows,{x:42,y:790,size:16,font});let y=760;for(const x of d.lines){extra.drawText(clean(`${x.description.slice(0,55)} · ${x.quantity} · ${eur(x.base)} + ${eur(x.vat)} €`),{x:42,y,size:9,font});y-=20;}}
 pdf.setTitle(`${d.proforma?t.proforma:t.test} ${d.reference}`);return pdf.save();
}