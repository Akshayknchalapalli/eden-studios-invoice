'use strict';
// The preview is native HTML. Canvas is created only when exporting a PDF.
const INVOICE_WIDTH=794,INVOICE_HEIGHT=1123,INVOICE_SCALE=3;
function setInvoiceCheck(el,checked){
 const mark=el.querySelector('svg');
 if(checked)mark.removeAttribute('hidden');else mark.setAttribute('hidden','');
}
function updateInvoiceDOM(root,data){
 root.querySelectorAll('[data-field]').forEach(el=>el.textContent=data[el.dataset.field]||'');
 root.querySelectorAll('[data-invoice-check]').forEach(el=>setInvoiceCheck(el,!!data.checks[el.dataset.invoiceCheck]));
 root.querySelectorAll('[data-invoice-payment]').forEach(el=>setInvoiceCheck(el,data.payment===el.dataset.invoicePayment));
 root.querySelectorAll('#invoiceTableBody tr').forEach((row,index)=>{row.hidden=index>=data.rows.length;});
 root.querySelector('.invoice-table').classList.toggle('is-compact',data.rows.length>6);
 root.querySelectorAll('[data-row]').forEach(el=>{const row=data.rows[Number(el.dataset.row)];el.textContent=row?row[el.dataset.column]:'';});
 const money=x=>x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 root.querySelectorAll('[data-total]').forEach(el=>el.textContent=money(data[el.dataset.total]));
 const issues=[];
 root.querySelectorAll('[data-field],[data-row],[data-total]').forEach(el=>{
  const base=parseFloat(getComputedStyle(el).getPropertyValue('--invoice-value-size'))||12;let size=base;el.style.fontSize=size+'px';
  while(size>11&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)){size-=.25;el.style.fontSize=size+'px';}
  const overflow=el.textContent&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1);
  el.setAttribute('data-overflow',overflow?'true':'false');
  if(overflow)issues.push(el.dataset.field||el.dataset.total||`Service ${Number(el.dataset.row)+1} ${el.dataset.column}`);
 });
 return issues;
}
const invoiceBaselineCache=new Map();
function invoiceFontAscent(style){
 const font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
 if(invoiceBaselineCache.has(font))return invoiceBaselineCache.get(font);
 const probe=document.createElement('span');probe.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;white-space:nowrap;padding:0;border:0;margin:0;';probe.style.font=font;probe.style.lineHeight=style.lineHeight;
 const text=document.createTextNode('Hg'),marker=document.createElement('span');marker.style.cssText='display:inline-block;width:0;height:0;padding:0;border:0;vertical-align:baseline;';probe.append(text,marker);document.body.append(probe);
 const range=document.createRange();range.selectNodeContents(text);const ascent=marker.getBoundingClientRect().top-range.getBoundingClientRect().top;probe.remove();invoiceBaselineCache.set(font,ascent);return ascent;
}
async function invoiceDOMToCanvas(root){
 if(document.fonts)await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=2382;canvas.height=3369;const c=canvas.getContext('2d');c.scale(3,3);c.fillStyle='#fff';c.fillRect(0,0,794,1123);
 const origin=root.getBoundingClientRect(),scale=origin.width/794;
 const box=rect=>({x:(rect.left-origin.left)/scale,y:(rect.top-origin.top)/scale,w:rect.width/scale,h:rect.height/scale});
 const visibleColor=color=>color&&color!=='transparent'&&color!=='rgba(0, 0, 0, 0)';
 function roundPath(x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
 function textNode(node){
  if(!node.textContent.trim())return;
  const style=getComputedStyle(node.parentElement);if(style.visibility==='hidden')return;
  const range=document.createRange();let groups=[],current=null;
  for(let i=0;i<node.textContent.length;i++){
   range.setStart(node,i);range.setEnd(node,i+1);const rect=range.getBoundingClientRect();if(!rect.width||!rect.height)continue;
   const b=box(rect),ch=node.textContent[i];
   if(!current||Math.abs(current.y-b.y)>.5){current={x:b.x,y:b.y,text:ch};groups.push(current);}else current.text+=ch;
  }
  c.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;c.fillStyle=style.color;c.textAlign='left';c.textBaseline='alphabetic';const ascent=invoiceFontAscent(style);
  for(const g of groups)c.fillText(g.text,g.x,g.y+ascent);
 }
 async function element(el){
  const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')return;
  const b=box(el.getBoundingClientRect());if(!b.w||!b.h)return;
  c.save();
  if(visibleColor(style.backgroundColor)){c.fillStyle=style.backgroundColor;roundPath(b.x,b.y,b.w,b.h,parseFloat(style.borderTopLeftRadius)||0);c.fill();}
  const sides=[['Top',b.x,b.y,b.x+b.w,b.y],['Right',b.x+b.w,b.y,b.x+b.w,b.y+b.h],['Bottom',b.x,b.y+b.h,b.x+b.w,b.y+b.h],['Left',b.x,b.y,b.x,b.y+b.h]];
  for(const [side,x1,y1,x2,y2] of sides){const width=parseFloat(style['border'+side+'Width']);if(width&&style['border'+side+'Style']!=='none'){c.strokeStyle=style['border'+side+'Color'];c.lineWidth=width;c.beginPath();if(side==='Top'){c.moveTo(x1,y1+width/2);c.lineTo(x2,y2+width/2);}else if(side==='Bottom'){c.moveTo(x1,y1-width/2);c.lineTo(x2,y2-width/2);}else if(side==='Left'){c.moveTo(x1+width/2,y1);c.lineTo(x2+width/2,y2);}else{c.moveTo(x1-width/2,y1);c.lineTo(x2-width/2,y2);}c.stroke();}}
  if(style.overflowX==='hidden'||style.overflowY==='hidden'){c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();}
  if(el.tagName==='IMG'){if(typeof el.decode==='function')await el.decode();c.drawImage(el,b.x,b.y,b.w,b.h);}
  else if(el.tagName.toLowerCase()==='svg'){
   const svg=el.cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width',String(b.w));svg.setAttribute('height',String(b.h));const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await image.decode();c.drawImage(image,b.x,b.y,b.w,b.h);
  }else{for(const node of el.childNodes){if(node.nodeType===Node.ELEMENT_NODE)await element(node);else if(node.nodeType===Node.TEXT_NODE)textNode(node);}}
  c.restore();
 }
 await element(root);return canvas;
}
