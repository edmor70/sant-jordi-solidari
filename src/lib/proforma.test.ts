import { expect,it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generatePaymentDocuments } from './proforma.server';
import { buildSummary } from './pricing';
it('prepares only the initial PDF until the advance is confirmed',async()=>{
 const documents=await generatePaymentDocuments({reference:'SJ27-TEST',date:'2026-11-18',plan:'split',customer:{name:'EMPRESA FICTICIA',taxId:'TEST-NO-VALIDO',address:'DOMICILIO FICTICIO',email:'prueba@example.invalid'},summary:buildSummary({mode:'pickup',roses:50,shipping:[]})},'http://localhost:8080');
 expect(documents.map(x=>[x.reference,x.amount,x.dueDate])).toEqual([['SJ27-TEST',82.5,'2026-11-23']]);
 for(const d of documents)expect((await PDFDocument.load(d.bytes)).getPageCount()).toBe(1);
});