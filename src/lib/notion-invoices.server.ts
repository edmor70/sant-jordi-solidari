import {notion,notionUploadFile} from './notion.server';
import {NOTION_INVOICES_SOURCE,invoiceNotionProperties,invoiceNotionDetail,notionInvoiceNumber,notionInvoiceFilename,type NotionInvoiceInput} from './notion-invoices';
type FilesProp={files?:{name:string;type:string}[]};
type Page={id:string;properties?:Record<string,FilesProp>};
const hasPdf=(page:Page,name:string)=>!!page.properties?.['PDF']?.files?.some(f=>f.name===name&&f.type==='file');
/** Called under the document's durable lease. Upserts by invoice number and attaches the archived PDF as a Notion-hosted file;
 * resolves only after Notion confirms the row carries that file, so callers never record an unconfirmed sync. */
export async function syncNotionInvoice(d:NotionInvoiceInput,options:{test:boolean;pageId?:string|null;pdf:Uint8Array}){
 const key=notionInvoiceNumber(d.number,options.test), filename=notionInvoiceFilename(d.number,options.test);
 let page:Page|undefined=options.pageId?await notion(`/pages/${options.pageId}`):undefined;
 if(!page){
  const found=await notion(`/data_sources/${NOTION_INVOICES_SOURCE}/query`,'POST',{filter:{property:'Número de factura',rich_text:{equals:key}},page_size:2});
  if(found.results.length>1)throw new Error('notion_duplicate_review_required');
  page=found.results[0];
 }
 const properties:Record<string,unknown>={...invoiceNotionProperties(d,options.test)};
 if(!page||!hasPdf(page,filename))properties['PDF']={files:[{name:filename,type:'file_upload',file_upload:{id:await notionUploadFile(options.pdf,filename)}}]};
 page=page?await notion(`/pages/${page.id}`,'PATCH',{properties}):await notion('/pages','POST',{parent:{type:'data_source_id',data_source_id:NOTION_INVOICES_SOURCE},properties});
 const id=page!.id;
 const confirmed:Page=await notion(`/pages/${id}`);
 if(!hasPdf(confirmed,filename))throw new Error('notion_pdf_not_confirmed');
 const children=await notion(`/blocks/${id}/children?page_size=100`);
 const marker='SANT JORDI · DATOS SINCRONIZADOS\n';
 const text=marker+invoiceNotionDetail(d);
 const rich_text=Array.from({length:Math.ceil(text.length/1900)},(_,i)=>({type:'text',text:{content:text.slice(i*1900,(i+1)*1900)}}));
 const existing=children.results.find((b:{type:string;paragraph?:{rich_text:{plain_text?:string;text?:{content:string}}[]}})=>b.type==='paragraph'&&b.paragraph?.rich_text.map(t=>t.plain_text??t.text?.content??'').join('').startsWith(marker));
 if(existing)await notion(`/blocks/${existing.id}`,'PATCH',{paragraph:{rich_text}});
 else await notion(`/blocks/${id}/children`,'PATCH',{children:[{object:'block',type:'paragraph',paragraph:{rich_text}}]});
 return id;
}
