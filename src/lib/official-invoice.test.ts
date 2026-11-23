import {expect,it} from 'vitest';
import {PDFDocument} from 'pdf-lib';
import {officialInvoicePdf} from './official-invoice.server';
import {buildSummary} from './pricing';
const summary=buildSummary({mode:'pickup',roses:50,shipping:[]});
const customer={name:'EMPRESA FICTICIA — PRUEBA',taxId:'TEST-NO-VALIDO',address:'DOMICILIO FICTICIO',email:'prueba@example.invalid',postalCode:'08019',city:'Barcelona'};
for(const stage of ['single','advance','final'] as const) it(`fills the official ${stage} model as a nonfiscal test`,async()=>{
 const bytes=await officialInvoicePdf({number:stage==='single'?'U0017':stage==='advance'?'M0017.1':'M0017.2',reservation:'SJ27-PRUEBA',stage,issuedDate:'2026-11-19',dueDate:stage==='final'?'2027-04-07':'2026-11-24',base:stage==='single'?150:75,vat:stage==='single'?15:7.5,total:stage==='single'?165:82.5,paid:stage==='final'?82.5:0,advanceNumber:'M0017.1',advanceBase:75,advanceVat:7.5,customer,summary,test:true},'http://localhost:8080');
 const pdf=await PDFDocument.load(bytes);expect(pdf.getPageCount()).toBe(1);expect(pdf.getForm().getFields()).toHaveLength(0);
});
it('blocks production issuance',async()=>await expect(officialInvoicePdf({number:'U0017',reservation:'SJ27-PRUEBA',stage:'single',issuedDate:'2026-11-19',dueDate:'2026-11-24',base:150,vat:15,total:165,paid:0,customer,summary,test:false},'http://localhost:8080')).rejects.toThrow('production_invoicing_locked'));