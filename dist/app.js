'use strict';
const $=id=>document.getElementById(id);
const fields=['invoice','date','due','customer','phone','address','reference','notes','terms','signature'];
const money=x=>x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const inr=x=>'₹'+money(x);
const DRAFT_KEY='eden-invoice-v1';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function displayDate(value){return value||'';}

const serviceDefinitions=[
 ['music','Music composition','e.g. Original song composition'],
 ['arrange','Track arrangements','e.g. Arrangement for one song'],
 ['record','Recording / pitch correction','e.g. Vocal recording and tuning'],
 ['mix','Mixing & mastering','e.g. Stereo mix and master'],
 ['voice','Voice-over / dubbing','e.g. Voice-over for a promotional video'],
 ['score','Background score','e.g. Background score for a short film'],
 ['live','Live instruments','e.g. Acoustic guitar recording'],
 ['plugins','Audio plugins / MIDI installation','e.g. MIDI setup and plugin installation'],
 ['score_sfx','Background Score SFX','e.g. Sound design and effects'],
 ['voice_artist','Voice Dub / Voice over Artist','e.g. Voice artist session']
];
serviceDefinitions.forEach((service,index)=>{
 const i=index+1,row=document.createElement('div');row.className='service-row';row.id='serviceLine'+i;row.hidden=true;
 row.innerHTML=`<strong>${service[1]}</strong><div class="service-grid"><div><label for="desc${i}">Description / deliverable</label><input id="desc${i}" placeholder="${service[2]}"></div><div><label for="qty${i}">Quantity</label><input id="qty${i}" type="number" inputmode="decimal" min="0.01" step="0.01" value="1" placeholder="1"></div><div><label for="rate${i}">Rate per unit (₹)</label><input id="rate${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Rate for ${service[1]}"></div></div><div class="small" id="amountLabel${i}">Amount: ₹0.00</div>`;
 $('serviceRows').append(row);
 $('desc'+i).value='';
});
function selectedServiceLines(){
 const selected=[];
 serviceDefinitions.forEach((service,index)=>{
  const i=index+1,checked=$('service_'+service[0]).checked;
  $('serviceLine'+i).hidden=!checked;
  ['desc','qty','rate'].forEach(field=>{$(field+i).disabled=!checked;});
  if(checked)selected.push({key:service[0],label:service[1],index:i,description:$('desc'+i).value.trim()||service[1],quantity:$('qty'+i).value,rate:$('rate'+i).value});
 });
 $('serviceEmpty').hidden=selected.length>0;
 $('serviceCount').textContent=selected.length?selected.length+' selected service'+(selected.length===1?'':'s'):'';
 return selected;
}
const inputs=[...document.querySelectorAll('#editor input:not([readonly]),#editor textarea,#editor select')];
let currentInvoice=null;
function readServiceChecks(){
 const checks={};
 document.querySelectorAll('[data-check]').forEach(el=>{checks[el.dataset.check]=el.checked;});
 return checks;
}
function sync(){
 const selected=selectedServiceLines();
 const hasServices=selected.length>0;
 $('previewEmpty').hidden=hasServices;
 $('previewWrap').hidden=!hasServices;
 $('previewTools').hidden=!hasServices;
 $('previewLive').hidden=!hasServices;
 ['downloadBtn','mobileDownload','shareBtn','printBtn'].forEach(id=>{$(id).disabled=!hasServices;});
 const amounts=calculateInvoiceAmounts(selected,$('f_discount').value,$('f_taxrate').value);
 const rows=selected.map((line,index)=>{
  const amount=amounts.rows[index].amount;
  $('amountLabel'+line.index).textContent='Amount: '+inr(amount);
  return {description:line.description,quantity:line.quantity,rateText:line.rate!==''?money(Number(line.rate)||0):'',amountText:line.rate!==''?money(amount):''};
 });
 const {subtotal,discount,taxRate,tax,grand,taxable}=amounts;
 currentInvoice={rows,subtotal,discount,taxRate,tax,grand,taxable,payment:$('f_payment').value,checks:readServiceChecks()};
 fields.forEach(key=>currentInvoice[key]=['date','due'].includes(key)?displayDate($('f_'+key).value):$('f_'+key).value);
 const overflow=updateInvoiceDOM($('invoicePaper'),currentInvoice);
 $('sum_sub').value=inr(subtotal);$('sum_tax').value=inr(tax);$('sum_grand').value=inr(grand);$('mobileTotal').textContent=inr(grand);
 $('sum_discount').value=inr(discount);$('sum_taxable').value=inr(taxable);
 const problems=amounts.errors.slice();
 if(overflow.length)problems.push('Shorten these fields to fit the A4 layout: '+[...new Set(overflow)].join(', ')+'.');
 if(inputs.some(el=>!el.disabled&&el.type==='number'&&!el.validity.valid))problems.push('Check the highlighted number fields. Use non-negative amounts and at most 2 decimal places.');
 $('fitWarning').textContent=problems.join(' ');$('fitWarning').hidden=!problems.length;
 $('previewAccessible').textContent=JSON.stringify(currentInvoice);
 $('invoicePaper').setAttribute('aria-label',`Invoice ${currentInvoice.invoice||'draft'} for ${currentInvoice.customer||'customer'}. Total ${inr(grand)}.`);
 if(hasServices&&typeof window.fitInvoicePreview==='function')window.fitInvoicePreview();
 return hasServices&&!problems.length;
}
let saveTimer;
function saveDraft(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify({version:2,values:inputs.map(el=>({id:el.id,value:el.value,checked:el.checked}))}));$('draftStatus').textContent='Draft saved on this device';}catch(error){$('draftStatus').textContent='Draft not saved — download your PDF before leaving';}}
function update(){sync();if(typeof invalidatePdf==='function')invalidatePdf();$('draftStatus').textContent='Updating draft…';clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,250);}
inputs.forEach(el=>{el.addEventListener('input',update);el.addEventListener('change',update);el.addEventListener('blur',update);});
// Some embedded viewers commit edits only when focus changes or Preview is tapped.
document.querySelectorAll('a[href="#previewCard"]').forEach(link=>link.addEventListener('click',update));
window.addEventListener('pageshow',()=>{sync();});
function restoreServiceDraft(draft){
 if(draft.version!==1)return;
 const selectedKeys=draft.values.filter(v=>v.checked&&/^service_/.test(v.id)).map(v=>v.id.slice(8));
 const oldLines=draft.values.filter(v=>/^(desc|qty|rate)\d+$/.test(v.id));
 draft.values=draft.values.filter(v=>!/^(desc|qty|rate)\d+$/.test(v.id));
 selectedKeys.forEach((key,index)=>{
  const target=serviceDefinitions.findIndex(service=>service[0]===key)+1;
  if(!target)return;
  ['desc','qty','rate'].forEach(field=>{const old=oldLines.find(v=>v.id===field+(index+1));if(old)draft.values.push({id:field+target,value:old.value});});
 });
}
$('f_date').value=today();
try{const draft=JSON.parse(localStorage.getItem(DRAFT_KEY));if(draft&&(draft.version===1||draft.version===2)&&Array.isArray(draft.values)){restoreServiceDraft(draft);draft.values.forEach(v=>{const el=inputs.find(el=>el.id===v.id);if(el){el.value=String(v.value==null?'':v.value);if(el.type==='checkbox')el.checked=!!v.checked;}});$('draftStatus').textContent='Your saved draft is restored';}}catch(error){$('draftStatus').textContent='Start a new invoice — no saved draft available';}
sync();
let zoom=1;
function resizePreview(){
 if(typeof window.fitInvoicePreview==='function')window.fitInvoicePreview(zoom);
 $('zoomLabel').textContent=zoom===1?'Fit':`${zoom}×`;
 $('zoomOut').disabled=zoom===1;$('zoomIn').disabled=zoom===3;
}
resizePreview();
$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.5);resizePreview();};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.5);resizePreview();};$('fitBtn').onclick=()=>{zoom=1;resizePreview();};
$('clearBtn').onclick=()=>{if(!confirm('Start a new invoice? Download the current PDF first. This clears the draft on this device.'))return;clearTimeout(saveTimer);inputs.forEach(el=>{el.value='';if(el.type==='checkbox')el.checked=false;});serviceDefinitions.forEach((service,index)=>{$('desc'+(index+1)).value='';$('qty'+(index+1)).value='1';});$('f_date').value=today();$('f_discount').value='0';$('f_taxrate').value='0';zoom=1;cachedPdf=null;$('shareBtn').textContent='Share PDF';resizePreview();sync();saveDraft();$('exportStatus').textContent='';window.scrollTo({top:0,behavior:'smooth'});};
function readyToExport(){if(!sync()){$('exportStatus').textContent=currentInvoice.rows.length?$('fitWarning').textContent:'Select at least one service in Step 2 to preview or export an invoice.';$('previewCard').scrollIntoView({behavior:'smooth'});return false;}return true;}
// Render the live HTML element boxes and text to an export-only canvas. No invoice background image is used.
async function makePdf(){
 await invoiceResources;if(!sync())throw new Error('Invoice content does not fit');
 const canvas=await invoiceDOMToCanvas($('invoicePaper'));
 const jpg=new Uint8Array(await (await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.96))).arrayBuffer());
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;const add=s=>{const b=typeof s==='string'?enc.encode(s):s;chunks.push(b);length+=b.length;};
 add('%PDF-1.4\n');function obj(id,body){offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`);}
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 841] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 2382 /Height 3369 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');
 const content='q\n595 0 0 841 0 0 cm\n/Im0 Do\nQ\n';obj(5,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
 const start=length;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
 return new File(chunks,`Eden-Invoice-${($('f_invoice').value||'draft').replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`,{type:'application/pdf'});
}
let cachedPdf=null;
function invalidatePdf(){cachedPdf=null;$('shareBtn').textContent='Share PDF';}
inputs.forEach(el=>{el.addEventListener('input',invalidatePdf);el.addEventListener('change',invalidatePdf);});
function download(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportPdf(){if(!readyToExport())return;const buttons=[$('downloadBtn'),$('mobileDownload')];buttons.forEach(b=>b.disabled=true);$('exportStatus').textContent='Preparing your PDF…';try{cachedPdf=await makePdf();download(cachedPdf);$('exportStatus').textContent='PDF ready. On iPhone, use Share → Save to Files in the PDF viewer. Tap Share PDF to send it.';}catch(error){$('exportStatus').textContent='Could not create the PDF. Try Print invoice, then save from the print preview.';}finally{buttons.forEach(b=>b.disabled=false);}}
$('downloadBtn').onclick=exportPdf;$('mobileDownload').onclick=exportPdf;
$('shareBtn').onclick=async()=>{if(!readyToExport())return;try{
 // iOS requires user activation for sharing: prepare first, then ask for a second tap.
 if(!cachedPdf){$('shareBtn').disabled=true;$('exportStatus').textContent='Preparing PDF for sharing…';cachedPdf=await makePdf();$('shareBtn').disabled=false;$('shareBtn').textContent='Share prepared PDF';$('exportStatus').textContent='PDF prepared. Tap Share prepared PDF to open the share sheet.';return;}
 if(navigator.canShare&&navigator.canShare({files:[cachedPdf]})){await navigator.share({files:[cachedPdf],title:'Eden Studios invoice'});$('exportStatus').textContent='Share sheet closed.';}else{download(cachedPdf);$('exportStatus').textContent='Sharing files is unavailable here. Your PDF has been downloaded instead.';}
 }catch(error){$('exportStatus').textContent=error.name==='AbortError'?'Sharing cancelled. Your draft is still saved.':'Could not share the PDF. Use Download PDF instead.';}finally{$('shareBtn').disabled=false;}};
$('printBtn').onclick=()=>{if(readyToExport())window.print();};

// Optional resource APIs must never interrupt form initialization in embedded viewers.
const invoiceResources=Promise.resolve().then(()=>Promise.all([
 typeof $('brandLogo').decode==='function'?$('brandLogo').decode():Promise.resolve(),
 document.fonts&&typeof document.fonts.load==='function'?Promise.all(['12px InvoiceSans','600 12px InvoiceSans','700 12px InvoiceSans','900 12px InvoiceSans'].map(font=>document.fonts.load(font))):Promise.resolve()
]));
invoiceResources.then(()=>{sync();invalidatePdf();}).catch(()=>{$('exportStatus').textContent='Brand artwork or font could not load. Reopen the complete HTML file.';});
