import {beforeEach,it,expect,vi} from 'vitest';
import {syncNotionInvoice} from './notion-invoices.server';
import type {NotionInvoiceInput} from './notion-invoices';
import {buildSummary} from './pricing';
const m=vi.hoisted(()=>({call:vi.fn(),upload:vi.fn()}));
vi.mock('./notion.server',()=>({notion:m.call,notionUploadFile:m.upload}));
const d:NotionInvoiceInput={number:'U0012',reference:'PRUEBA',customer:{name:'PRUEBA',taxId:'TEST',email:'prueba@example.invalid'},plan:'single',stage:'single',base:150,vat:15,total:165,paid:0,issuedDate:'2026-11-19',dueDate:'2026-11-24',state:'pendiente',summary:buildSummary({mode:'pickup',roses:50,shipping:[]})};
const pdf=new Uint8Array([37,80,68,70]);
const withPdf=(name:string)=>({id:'page',properties:{PDF:{files:[{name,type:'file'}]}}});
beforeEach(()=>{m.call.mockReset();m.upload.mockReset();m.upload.mockResolvedValue('upload-1');});
it('creates a new row with the PDF attached as a Notion file upload, not a URL',async()=>{
 m.call.mockResolvedValueOnce({results:[]}).mockResolvedValueOnce({id:'page'}).mockResolvedValueOnce(withPdf('PRUEBA-U0012.pdf')).mockResolvedValueOnce({results:[]}).mockResolvedValue({});
 expect(await syncNotionInvoice(d,{test:true,pdf})).toBe('page');
 const create=m.call.mock.calls.find(([path,method])=>path==='/pages'&&method==='POST')?.[2];
 expect(create.properties.PDF.files[0]).toEqual({name:'PRUEBA-U0012.pdf',type:'file_upload',file_upload:{id:'upload-1'}});
 expect(create.properties['Número de factura'].rich_text[0].text.content).toBe('PRUEBA-U0012');
});
it('never reports success when Notion does not confirm the attached file',async()=>{
 m.call.mockResolvedValueOnce({results:[]}).mockResolvedValueOnce({id:'page'}).mockResolvedValueOnce({id:'page',properties:{PDF:{files:[]}}});
 await expect(syncNotionInvoice(d,{test:true,pdf})).rejects.toThrow('notion_pdf_not_confirmed');
});
it('reuses the existing row and its PDF on retry without uploading again',async()=>{
 m.call.mockResolvedValueOnce(withPdf('U0012.pdf')).mockResolvedValueOnce({id:'page'}).mockResolvedValueOnce(withPdf('U0012.pdf')).mockResolvedValueOnce({results:[{id:'detail',type:'paragraph',paragraph:{rich_text:[{plain_text:'SANT JORDI · DATOS SINCRONIZADOS\nold'}]}}]}).mockResolvedValue({});
 expect(await syncNotionInvoice(d,{test:false,pageId:'page',pdf})).toBe('page');
 expect(m.upload).not.toHaveBeenCalled();
 expect(m.call.mock.calls.filter(([path,method])=>path==='/pages'&&method==='POST')).toHaveLength(0);
});
