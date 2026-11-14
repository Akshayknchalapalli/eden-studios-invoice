'use strict';
const $=id=>document.getElementById(id);
const fields=['invoice','date','due','customer','phone','address','reference','notes','terms','signature'];
const number=id=>Math.max(0,Number($(id).value)||0);
const money=x=>x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const inr=x=>'₹'+money(x);
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
const DRAFT_KEY='eden-invoice-v1';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function displayDate(value){if(!value)return '';const [y,m,d]=value.split('-');return `${d}/${m}/${y}`;}
const ys=[55.35,57.55,59.75,61.95,64.15,66.35];
for(let i=1;i<=6;i++){
 const row=document.createElement('div');row.className='service-row';
 row.innerHTML=`<strong>LINE ${String(i).padStart(2,'0')}</strong><div class="service-grid"><div><label for="desc${i}">Description</label><input id="desc${i}" placeholder="e.g. Music composition"></div><div><label for="qty${i}">Quantity</label><input id="qty${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="1"></div><div><label for="rate${i}">Rate (₹)</label><input id="rate${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div></div><div class="small" id="amountLabel${i}">Amount: ₹0.00</div>`;
 $('serviceRows').append(row);
 const prev=document.createElement('div');
 prev.style.cssText=`position:absolute;left:13%;top:${ys[i-1]}%;width:79.3%;height:1.45%;display:flex;align-items:stretch`;
 // Each column follows the original image's cell boundaries.
 prev.innerHTML=`<span id="pdesc${i}" style="width:49.9%;display:flex;align-items:center"></span><span id="pqty${i}" style="width:10.6%;display:flex;align-items:center;justify-content:center"></span><span id="prate${i}" style="width:12.9%;display:flex;align-items:center;justify-content:flex-end"></span><span id="pamount${i}" style="width:26.6%;display:flex;align-items:center;justify-content:flex-end"></span>`;
 $('previewRows').append(prev);
}
const inputs=[...document.querySelectorAll('#editor input:not([readonly]),#editor textarea,#editor select')];
let overflowFields=[];
function fitText(el){
 const base=el.id==='p_grand'?18:14;let size=base;el.style.fontSize=size+'px';
 while(size>8&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)){size-=.5;el.style.fontSize=size+'px';}
 if(el.textContent&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1))overflowFields.push(el.id);
}
function sync(){
 fields.forEach(key=>{$('p_'+key).textContent=['date','due'].includes(key)?displayDate($('f_'+key).value):$('f_'+key).value;});
 document.querySelectorAll('[data-check]').forEach(c=>{document.querySelector(`[data-pcheck="${c.dataset.check}"]`).textContent=c.checked?'✓':'';});
 document.querySelectorAll('[data-pmode]').forEach(c=>{c.textContent=c.dataset.pmode===$('f_payment').value?'✓':'';});
 let subtotal=0;
 for(let i=1;i<=6;i++){
  const q=number('qty'+i),rate=number('rate'+i),amount=round(q*rate);subtotal=round(subtotal+amount);
  $('pdesc'+i).textContent=$('desc'+i).value;$('pqty'+i).textContent=$('qty'+i).value;
  $('prate'+i).textContent=$('rate'+i).value?money(rate):'';
  $('pamount'+i).textContent=($('qty'+i).value||$('rate'+i).value)?money(amount):'';
  $('amountLabel'+i).textContent='Amount: '+inr(amount);
 }
 const discount=Math.min(subtotal,number('f_discount')),tax=round((subtotal-discount)*number('f_taxrate')/100),grand=round(subtotal-discount+tax);
 for(const [key,value] of Object.entries({subtotal,discount,tax,grand}))$('p_'+key).textContent=money(value);
 $('sum_sub').value=inr(subtotal);$('sum_tax').value=inr(tax);$('sum_grand').value=inr(grand);$('mobileTotal').textContent=inr(grand);
 overflowFields=[];document.querySelectorAll('.ov,#previewRows span').forEach(fitText);
 const discountInvalid=number('f_discount')>subtotal;
 const invalidNumbers=inputs.some(el=>el.type==='number'&&!el.validity.valid);
 const incompleteRows=Array.from({length:6},(_,i)=>i+1).some(i=>($('qty'+i).value||$('rate'+i).value||$('desc'+i).value)&&(!$('desc'+i).value.trim()||!$('qty'+i).value||!$('rate'+i).value));
 const problems=[];
 if(overflowFields.length)problems.push('Some text is too long for the original invoice boxes. Shorten the highlighted fields before saving.');
 if(!Number.isFinite(grand)||!Number.isFinite(subtotal))problems.push('The amounts are too large. Enter smaller values.');
 if(discountInvalid)problems.push('Discount cannot exceed the subtotal.');
 if(invalidNumbers)problems.push('Enter valid non-negative quantities, prices, discount and tax.');
 if(incompleteRows)problems.push('Complete description, quantity and rate for each used service row.');
 $('fitWarning').textContent=problems.join(' ');$('fitWarning').hidden=!problems.length;
 document.querySelectorAll('.ov,#previewRows span').forEach(el=>el.style.background=overflowFields.includes(el.id)?'#ffdb8a':'');
 for(const el of inputs){const key=el.id.startsWith('f_')?'p_'+el.id.slice(2):el.id.replace(/^(desc|qty|rate)/,'p$1');el.setAttribute('aria-invalid',overflowFields.includes(key)?'true':'false');}
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
function resizePreview(){const wrap=$('previewWrap'),available=wrap.clientWidth-parseFloat(getComputedStyle(wrap).paddingLeft)-parseFloat(getComputedStyle(wrap).paddingRight);const scale=available/1097*zoom;$('preview').style.transform=`scale(${scale})`;$('previewStage').style.width=1097*scale+'px';$('previewStage').style.height=1536*scale+'px';$('zoomLabel').textContent=zoom===1?'Fit':`${zoom}×`;$('zoomOut').disabled=zoom===1;$('zoomIn').disabled=zoom===3;}
new ResizeObserver(resizePreview).observe($('previewWrap'));
$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.5);resizePreview();};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.5);resizePreview();};$('fitBtn').onclick=()=>{zoom=1;resizePreview();};
$('clearBtn').onclick=()=>{if(!confirm('Start a new invoice? Download the current PDF first. This clears the draft on this device.'))return;clearTimeout(saveTimer);inputs.forEach(el=>{el.value='';if(el.type==='checkbox')el.checked=false;});$('f_date').value=today();$('f_discount').value='0';$('f_taxrate').value='0';zoom=1;cachedPdf=null;$('shareBtn').textContent='Share PDF';resizePreview();sync();saveDraft();$('exportStatus').textContent='';window.scrollTo({top:0,behavior:'smooth'});};
function readyToExport(){if(!sync()){$('exportStatus').textContent=$('fitWarning').textContent;$('previewCard').scrollIntoView({behavior:'smooth'});return false;}return true;}
// Standalone, dependency-free PDF: render the same image and fitted preview text.
async function makePdf(){
 const image=$('templateImage');await image.decode();
 const canvas=document.createElement('canvas');canvas.width=2194;canvas.height=3072;
 const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.drawImage(image,0,0,1097,1536);
 const preview=$('preview'),rect=preview.getBoundingClientRect(),scale=rect.width/1097;
 for(const el of document.querySelectorAll('.ov,.ovcheck,#previewRows span')){
  if(!el.textContent)continue;
  const style=getComputedStyle(el),box=el.getBoundingClientRect();const x=(box.left-rect.left)/scale,y=(box.top-rect.top)/scale,w=el.clientWidth,h=el.clientHeight,pad=parseFloat(style.paddingLeft)||0,rightPad=parseFloat(style.paddingRight)||0,fs=parseFloat(style.fontSize),lineHeight=parseFloat(style.lineHeight)||fs*1.1;
  ctx.font=`${style.fontWeight} ${fs}px Arial`;ctx.fillStyle=style.color;ctx.textBaseline='top';
  const lines=[];for(const paragraph of el.textContent.split('\n')){let line='';for(const char of paragraph){if(line&&ctx.measureText(line+char).width>w-pad-rightPad){lines.push(line);line=char;}else line+=char;}lines.push(line);}
  const totalHeight=lines.length*lineHeight;let yy=y+(style.alignItems==='center'?Math.max(0,(h-totalHeight)/2):0);
  for(const line of lines){let xx=x+pad;if(style.justifyContent==='flex-end')xx=x+w-rightPad-ctx.measureText(line).width;if(style.justifyContent==='center')xx=x+(w-ctx.measureText(line).width)/2;ctx.fillText(line,xx,yy);yy+=lineHeight;}
 }
 const jpg=new Uint8Array(await (await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.96))).arrayBuffer());
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;const add=s=>{const b=typeof s==='string'?enc.encode(s):s;chunks.push(b);length+=b.length;};
 add('%PDF-1.4\n');function obj(id,body){offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`);}
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 2194 /Height 3072 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');
 const content='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n';obj(5,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
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
