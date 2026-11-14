'use strict';
const $=id=>document.getElementById(id);
const fields=['invoice','date','due','customer','phone','address','reference','notes','terms','signature'];
const number=id=>Math.max(0,Number($(id).value)||0);
const money=x=>x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const inr=x=>'₹'+money(x);
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
const DRAFT_KEY='eden-invoice-v1';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function displayDate(value){return value||'';}

for(let i=1;i<=6;i++){
 const row=document.createElement('div');row.className='service-row';
 row.innerHTML=`<strong>LINE ${String(i).padStart(2,'0')}</strong><div class="service-grid"><div><label for="desc${i}">Description</label><input id="desc${i}" placeholder="e.g. Music composition"></div><div><label for="qty${i}">Quantity</label><input id="qty${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="1"></div><div><label for="rate${i}">Rate (₹)</label><input id="rate${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div></div><div class="small" id="amountLabel${i}">Amount: ₹0.00</div>`;
 $('serviceRows').append(row);

}
const inputs=[...document.querySelectorAll('#editor input:not([readonly]),#editor textarea,#editor select')];
let currentInvoice=null;
function sync(){
 let subtotal=0;const rows=[];
 for(let i=1;i<=6;i++){
  const quantity=number('qty'+i),rate=number('rate'+i),amount=round(quantity*rate);subtotal=round(subtotal+amount);
  rows.push({description:$('desc'+i).value,quantity:$('qty'+i).value,rateText:$('rate'+i).value?money(rate):'',amountText:($('qty'+i).value||$('rate'+i).value)?money(amount):''});
  $('amountLabel'+i).textContent='Amount: '+inr(amount);
 }
 const discount=Math.min(subtotal,number('f_discount')),taxRate=number('f_taxrate'),tax=round((subtotal-discount)*taxRate/100),grand=round(subtotal-discount+tax);
 currentInvoice={rows,subtotal,discount,taxRate,tax,grand,payment:$('f_payment').value,checks:Object.fromEntries([...document.querySelectorAll('[data-check]')].map(c=>[c.dataset.check,c.checked]))};
 fields.forEach(key=>currentInvoice[key]=['date','due'].includes(key)?displayDate($('f_'+key).value):$('f_'+key).value);
 const overflow=drawInvoice($('invoiceCanvas'),currentInvoice,$('templateImage'));
 $('sum_sub').value=inr(subtotal);$('sum_tax').value=inr(tax);$('sum_grand').value=inr(grand);$('mobileTotal').textContent=inr(grand);
 const problems=[];
 if(overflow.length)problems.push('Shorten these fields to fit the A4 layout: '+[...new Set(overflow)].join(', ')+'.');
 if(!Number.isFinite(grand)||!Number.isFinite(subtotal))problems.push('The amounts are too large. Enter smaller values.');
 if(number('f_discount')>subtotal)problems.push('Discount cannot exceed the subtotal.');
 if(inputs.some(el=>el.type==='number'&&!el.validity.valid))problems.push('Enter valid non-negative quantities, prices, discount and tax.');
 if(Array.from({length:6},(_,i)=>i+1).some(i=>($('qty'+i).value||$('rate'+i).value||$('desc'+i).value)&&(!$('desc'+i).value.trim()||!$('qty'+i).value||!$('rate'+i).value)))problems.push('Complete description, quantity and rate for each used service row.');
 $('fitWarning').textContent=problems.join(' ');$('fitWarning').hidden=!problems.length;
 $('previewAccessible').textContent=JSON.stringify(currentInvoice);
 $('invoiceCanvas').setAttribute('aria-label',`Invoice ${currentInvoice.invoice||'draft'} for ${currentInvoice.customer||'customer'}. Total ${inr(grand)}.`);
 return !problems.length;
}
let saveTimer;
function saveDraft(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify({version:1,values:inputs.map(el=>({id:el.id,value:el.value,checked:el.checked}))}));$('draftStatus').textContent='Draft saved on this device';}catch{$('draftStatus').textContent='Draft not saved — download your PDF before leaving';}}
function update(){sync();$('draftStatus').textContent='Updating draft…';clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,250);}
inputs.forEach(el=>{el.addEventListener('input',update);el.addEventListener('change',update);});
$('f_date').value=today();
try{const draft=JSON.parse(localStorage.getItem(DRAFT_KEY));if(draft?.version===1&&Array.isArray(draft.values)){draft.values.forEach(v=>{const el=inputs.find(el=>el.id===v.id);if(el){el.value=String(v.value??'');if(el.type==='checkbox')el.checked=!!v.checked;}});$('draftStatus').textContent='Your saved draft is restored';}}catch{$('draftStatus').textContent='Start a new invoice — no saved draft available';}
sync();
let zoom=1;
function resizePreview(){const wrap=$('previewWrap'),available=wrap.clientWidth-parseFloat(getComputedStyle(wrap).paddingLeft)-parseFloat(getComputedStyle(wrap).paddingRight);const scale=available/794*zoom;$('preview').style.transform=`scale(${scale})`;$('previewStage').style.width=794*scale+'px';$('previewStage').style.height=1123*scale+'px';$('zoomLabel').textContent=zoom===1?'Fit':`${zoom}×`;$('zoomOut').disabled=zoom===1;$('zoomIn').disabled=zoom===3;}
new ResizeObserver(resizePreview).observe($('previewWrap'));
$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.5);resizePreview();};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.5);resizePreview();};$('fitBtn').onclick=()=>{zoom=1;resizePreview();};
$('clearBtn').onclick=()=>{if(!confirm('Start a new invoice? Download the current PDF first. This clears the draft on this device.'))return;clearTimeout(saveTimer);inputs.forEach(el=>{el.value='';if(el.type==='checkbox')el.checked=false;});$('f_date').value=today();$('f_discount').value='0';$('f_taxrate').value='0';zoom=1;cachedPdf=null;$('shareBtn').textContent='Share PDF';resizePreview();sync();saveDraft();$('exportStatus').textContent='';window.scrollTo({top:0,behavior:'smooth'});};
function readyToExport(){if(!sync()){$('exportStatus').textContent=$('fitWarning').textContent;$('previewCard').scrollIntoView({behavior:'smooth'});return false;}return true;}
// Standalone, dependency-free PDF: render the same image and fitted preview text.
async function makePdf(){
 await invoiceResources;if(!sync())throw new Error('Invoice content does not fit');
 const canvas=$('invoiceCanvas');
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
async function exportPdf(){if(!readyToExport())return;const buttons=[$('downloadBtn'),$('mobileDownload')];buttons.forEach(b=>b.disabled=true);$('exportStatus').textContent='Preparing your PDF…';try{cachedPdf=await makePdf();download(cachedPdf);$('exportStatus').textContent='PDF ready. On iPhone, use Share → Save to Files in the PDF viewer. Tap Share PDF to send it.';}catch{$('exportStatus').textContent='Could not create the PDF. Try Print invoice, then save from the print preview.';}finally{buttons.forEach(b=>b.disabled=false);}}
$('downloadBtn').onclick=exportPdf;$('mobileDownload').onclick=exportPdf;
$('shareBtn').onclick=async()=>{if(!readyToExport())return;try{
 // iOS requires user activation for sharing: prepare first, then ask for a second tap.
 if(!cachedPdf){$('shareBtn').disabled=true;$('exportStatus').textContent='Preparing PDF for sharing…';cachedPdf=await makePdf();$('shareBtn').disabled=false;$('shareBtn').textContent='Share prepared PDF';$('exportStatus').textContent='PDF prepared. Tap Share prepared PDF to open the share sheet.';return;}
 if(navigator.canShare?.({files:[cachedPdf]})){await navigator.share({files:[cachedPdf],title:'Eden Studios invoice'});$('exportStatus').textContent='Share sheet closed.';}else{download(cachedPdf);$('exportStatus').textContent='Sharing files is unavailable here. Your PDF has been downloaded instead.';}
 }catch(error){$('exportStatus').textContent=error.name==='AbortError'?'Sharing cancelled. Your draft is still saved.':'Could not share the PDF. Use Download PDF instead.';}finally{$('shareBtn').disabled=false;}};
$('printBtn').onclick=()=>{if(readyToExport())window.print();};

const invoiceResources=Promise.all([$('templateImage').decode(),document.fonts.load('12px InvoiceSans'),document.fonts.load('600 12px InvoiceSans'),document.fonts.load('900 12px InvoiceSans')]);
invoiceResources.then(()=>{sync();invalidatePdf();}).catch(()=>{$('exportStatus').textContent='Brand artwork or font could not load. Reopen the complete HTML file.';});
